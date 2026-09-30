import { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import styles from './Taskbar.module.css';

function getTaskIcon(type: string, title: string): string {
  if (type === 'system_override') return '⚙';
  if (type === 'folder') return '▸';
  if (title.endsWith('.mp4')) return '▶';
  if (title.endsWith('.png')) return '🖼';
  if (title.endsWith('.pdf')) return '≡';
  if (title.endsWith('.exe')) return '⚡';
  if (title.endsWith('.json')) return '{}';
  if (title.endsWith('.md')) return '#';
  return '»';
}

export function Taskbar() {
  const {
    state,
    activeWindowId,
    focusWindow,      // ★ アクティブ切り替え
    restoreWindow,    // 最小化解除
    minimizeWindow,
  } = useGame();

  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('ja-JP', {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={styles.taskbar}>
      {state.windows.map(win => {
        const isActive = activeWindowId === win.id && !win.minimized;

        const handleClick = () => {
          if (win.minimized) {
            // 最小化中 → 復元してアクティブ化
            restoreWindow(win.id);
          } else {
            // ★ 最大化・通常を問わず focusWindow でアクティブ化
            focusWindow(win.id);
          }
        };

        return (
          <button
            key={win.id}
            className={`${styles.taskBtn} ${isActive ? styles.active : ''} ${win.minimized ? styles.minimized : ''}`}
            onClick={handleClick}
            onContextMenu={e => { e.preventDefault(); minimizeWindow(win.id); }}
            title={`${win.title}${win.minimized ? ' (最小化中)' : ''} — 右クリックで最小化`}
          >
            <span className={styles.taskIcon}>{getTaskIcon(win.type, win.title)}</span>
            <span className={styles.taskLabel}>{win.title}</span>
          </button>
        );
      })}

      {state.windows.length > 0 && <div className={styles.sep} />}

      <div className={styles.rightArea}>
        <span>SYS_OK</span>
        <span className={styles.clock}>{time}</span>
      </div>
    </div>
  );
}
