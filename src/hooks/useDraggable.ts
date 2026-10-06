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
          // ウィンドウ全体が常にWorkspace内に収まるようにクランプ
          newX = Math.max(newX, 0);
          newX = Math.min(newX, r.width - win.width);
          
          newY = Math.max(newY, 0);
          newY = Math.min(newY, r.height - win.height);
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
