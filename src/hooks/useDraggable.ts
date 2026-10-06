import { useRef, useCallback, type RefObject } from 'react';
import { useGame } from '../context/GameContext';

const TITLE_BAR_H = 30;

export function useDraggable(
  windowId: string,
  workspaceRef: RefObject<HTMLElement | null>
) {
  const { focusWindow, moveWindow, state } = useGame();
  const dragging  = useRef(false);
  const startMouse = useRef({ x: 0, y: 0 });
  const startWin   = useRef({ x: 0, y: 0 });

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;

      const win = state.windows.find(w => w.id === windowId);
      if (!win || win.maximized) return;

      dragging.current   = true;
      startMouse.current = { x: e.clientX, y: e.clientY };
      startWin.current   = { x: win.x,     y: win.y };
      focusWindow(windowId);

      const onMove = (me: MouseEvent) => {
        if (!dragging.current) return;

        let newX = startWin.current.x + (me.clientX - startMouse.current.x);
        let newY = startWin.current.y + (me.clientY - startMouse.current.y);

        // ── ワークスペース境界でクランプ ──────────────────────────
        const ws = workspaceRef.current;
        if (ws) {
          const r = ws.getBoundingClientRect();
          // ウィンドウの幅の大部分が外に出ても、最低100pxは画面内に残るようにする
          const minVisibleWidth = 100;
          newX = Math.max(newX, -win.width + minVisibleWidth);
          newX = Math.min(newX, r.width - minVisibleWidth);
          // 上にはタイトルバーが消えないように0でクランプ
          newY = Math.max(newY, 0);
          // 下にはタイトルバーが完全に消えないようにクランプ
          newY = Math.min(newY, r.height - TITLE_BAR_H);
        } else {
          newX = Math.max(0, newX);
          newY = Math.max(0, newY);
        }

        moveWindow(windowId, newX, newY);
      };

      const onUp = () => {
        dragging.current = false;
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup',   onUp);
      };

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup',   onUp);
    },
    [windowId, focusWindow, moveWindow, state.windows, workspaceRef]
  );

  return { onMouseDown };
}
