import { useGame } from '../../context/GameContext';
import { LockScreen } from '../LockScreen/LockScreen';
import type { FolderItem, FSItem, FileItem } from '../../types';
import styles from './FolderViewer.module.css';

// ─── アイコン・バッジヘルパー ──────────────────────────────────────
function getFileIcon(item: FSItem): string {
  if (item.type === 'folder') return (item as FolderItem).locked ? '🔒' : '📁';
  const map: Record<string, string> = {
    txt: '📄', md: '📝', mp4: '▶', png: '🖼', pdf: '📋', json: '{}', exe: '⚡',
  };
  return map[(item as FileItem).type] ?? '📄';
}

function getExtBadge(item: FSItem): string {
  if (item.type === 'folder') return 'DIR';
  return (item as FileItem).type.toUpperCase();
}

/** state.filesystem からフォルダIDで再帰検索して最新状態を取得 */
function findFolder(items: FolderItem[], id: string): FolderItem | null {
  for (const item of items) {
    if (item.id === id) return item;
    const found = findFolder(
      item.children.filter(c => c.type === 'folder') as FolderItem[],
      id
    );
    if (found) return found;
  }
  return null;
}

// ─── FolderViewer ─────────────────────────────────────────────────
interface FolderViewerProps {
  /** win.item から渡されるフォルダ（初期値 / IDの参照用） */
  folder: FolderItem;
}

export function FolderViewer({ folder }: FolderViewerProps) {
  const { state, openWindow, unlockFolder } = useGame();

  /**
   * ★ win.item は開いた瞬間のスナップショットなので locked 状態が古い。
   *    state.filesystem から ID で最新版を引き直す。
   *    見つからなければ props の folder にフォールバック。
   */
  const liveFolder = findFolder(state.filesystem, folder.id) ?? folder;

  // ★ ロック中は LockScreen のみ表示
  if (liveFolder.locked) {
    return (
      <LockScreen
        folder={liveFolder}
        onUnlock={() => unlockFolder(liveFolder.id)}
      />
    );
  }

  // ─── 解錠済み: ファイル一覧 ────────────────────────────────────
  return (
    <div className={styles.folderViewer}>
      <div className={styles.toolbar}>
        <span className={styles.path}>
          / <span>{liveFolder.name}</span>
        </span>
        <span className={styles.itemCount}>{liveFolder.children.length} items</span>
      </div>

      <div className={styles.fileList}>
        {liveFolder.children.map(item => (
          <div
            key={item.id}
            className={styles.fileRow}
            onClick={() => openWindow(item, { x: 40, y: 40 })}
          >
            <span className={styles.fileIcon}>{getFileIcon(item)}</span>
            <span className={styles.fileName}>{item.name}</span>
            <span className={styles.fileExt}>{getExtBadge(item)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
