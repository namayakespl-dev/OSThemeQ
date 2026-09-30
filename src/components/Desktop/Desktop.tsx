import { useMemo, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { Window } from '../Window/Window';
import { FolderViewer } from '../FolderViewer/FolderViewer';
import { FileViewer } from '../FileViewer/FileViewer';
import { SystemOverride } from '../SystemOverride/SystemOverride';
import { Taskbar } from '../Taskbar/Taskbar';
import type { FolderItem, FileItem } from '../../types';
import styles from './Desktop.module.css';

// ─── Matrix rain（サイドバー背景用） ─────────────────────────────
const MATRIX_CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホ01';

function MatrixBackground() {
  const columns = useMemo(() => {
    const COUNT = 12; // サイドバー幅に合わせた列数
    return Array.from({ length: COUNT }, (_, i) => ({
      id: i,
      chars: Array.from({ length: 25 }, () =>
        MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]
      ).join('\n'),
      duration: 10 + Math.random() * 14,
      delay: -Math.random() * 20,
      left: i * 20,
    }));
  }, []);

  return (
    <div className={styles.matrixBg}>
      {columns.map(col => (
        <div
          key={col.id}
          className={styles.matrixCol}
          style={{
            left: col.left,
            animationDuration: `${col.duration}s`,
            animationDelay: `${col.delay}s`,
          }}
        >
          {col.chars}
        </div>
      ))}
    </div>
  );
}

// ─── フォルダアイコン用ヘルパー ───────────────────────────────────
function getFolderGlyph(name: string, locked: boolean) {
  if (locked) return '🔒';
  const map: Record<string, string> = {
    GAME: '🎮', MOVIE: '🎬', DRONE: '🚁', COMMUNITY: '👥', GOODS: '📦',
  };
  return map[name] ?? '📁';
}

function getFolderItemCount(name: string): string {
  const map: Record<string, string> = {
    GAME: '3 items', MOVIE: '5 items', DRONE: '3 items',
    COMMUNITY: '3 items', GOODS: '1 item',
  };
  return map[name] ?? '';
}

// ─── Desktop ─────────────────────────────────────────────────────
export function Desktop() {
  const { state, openWindow } = useGame();

  // ワークスペースの DOM ref — ドラッグ境界計算に使用
  const workspaceRef = useRef<HTMLDivElement>(null);

  return (
    <div className={styles.desktop}>

      {/* ══ ヘッダーバー ══ */}
      <div className={styles.headerBar}>
        <div className={styles.sysLabel}>
          <span>NAMAYAN</span>_OS &nbsp;v2.4.1
        </div>
        <div className={styles.headerDivider} />
        <div className={styles.statusIndicators}>
          <span><span className={styles.statusDot} />SYS_ONLINE</span>
          <span>CPU: 12%</span>
          <span>MEM: 4.2GB</span>
        </div>
      </div>

      {/* ══ 中段（サイドバー + ワークスペース） ══ */}
      <div className={styles.body}>

        {/* ── 左サイドバー（フォルダ一覧・常に可視） ── */}
        <aside className={styles.sidebar}>
          <MatrixBackground />
          <div className={styles.sidebarHeader}>FILESYSTEM</div>
          <div className={styles.folderList}>
            {state.filesystem.map(folder => (
              <div
                key={folder.id}
                className={styles.folderRow}
                onClick={() => openWindow(folder)}
              >
                <span className={styles.folderGlyph}>
                  {getFolderGlyph(folder.name, folder.locked)}
                </span>
                <div className={styles.folderInfo}>
                  <span className={styles.folderName}>{folder.name}/</span>
                  <span className={styles.folderMeta}>{getFolderItemCount(folder.name)}</span>
                </div>
                {folder.locked
                  ? <span className={styles.lockedTag}>LOCK</span>
                  : <span className={styles.openTag}>●</span>
                }
              </div>
            ))}
          </div>
        </aside>

        {/* ── 右ワークスペース（ウィンドウ展開エリア） ── */}
        <div className={styles.workspace} ref={workspaceRef}>

          {/* 空のときのヒント */}
          {state.windows.every(w => w.minimized) && (
            <div className={styles.workspaceEmpty}>
              <div className={styles.emptyHint}>
                <div className={styles.emptyTitle}>WORKSPACE</div>
                <div className={styles.emptyCmd}>{'>'} click folder to open_</div>
              </div>
            </div>
          )}

          {/* ウィンドウ群 */}
          {state.windows.map(win => (
            <Window key={win.id} window={win} workspaceRef={workspaceRef}>
              {win.type === 'system_override' && <SystemOverride />}
              {win.type === 'folder' && win.item && (
                <FolderViewer folder={win.item as FolderItem} />
              )}
              {win.type === 'file' && win.item && (
                <FileViewer file={win.item as FileItem} />
              )}
            </Window>
          ))}

          {/* ブランディング */}
          <div className={styles.branding}>
            <div className={styles.brandTitle}>NAMAYAN_OS</div>
            <div className={styles.brandSub}>MYSTERY SYSTEM v2.4.1</div>
          </div>
        </div>
      </div>

      {/* ══ タスクバー ══ */}
      <Taskbar />

      {/* ══ ゲームクリアオーバーレイ ══ */}
      {state.gameCleared && (
        <div className={styles.clearedOverlay}>
          <div className={styles.clearedBox}>
            <div className={styles.clearedTitle}>SYSTEM RESTORED</div>
            <div className={styles.clearedLog}>
              <span>{'>'} Sector 1 [空/DRONE]  ................ ONLINE ✓</span>
              <span>{'>'} Sector 2 [闘/GAME]   ................ ONLINE ✓</span>
              <span>{'>'} Sector 3 [繋/COMM]   ................ ONLINE ✓</span>
              <span>{'>'} DOSTON SYSTEM ............... FULLY ACTIVE ✓</span>
            </div>
            <div className={styles.clearedSub}>
              ── GAME CLEAR ── おめでとうございます！謎解き完了 ──
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
