import React, {
  createContext,
  useContext,
  useReducer,
  useState,
  useCallback,
} from 'react';
import type { GameState, WindowState, FSItem, FolderItem, FileItem } from '../types';
import { initialFilesystem } from '../data/filesystem';

// ─────────────────────────────────────────────────────────────────────────────
// Reducer actions  ※ z-index 関連を完全に除去
// ─────────────────────────────────────────────────────────────────────────────
type GameAction =
  | { type: 'OPEN_WINDOW';      payload: Omit<WindowState, 'minimized' | 'maximized'> }
  | { type: 'CLOSE_WINDOW';     payload: string }
  | { type: 'CLOSE_ALL_WINDOWS' }                // ゲームクリア演出用
  | { type: 'MOVE_WINDOW';      payload: { id: string; x: number; y: number } }
  | { type: 'RESIZE_WINDOW';    payload: { id: string; width: number; height: number } }
  | { type: 'MINIMIZE_WINDOW';  payload: string }
  | { type: 'RESTORE_WINDOW';   payload: string }
  | { type: 'TOGGLE_MAXIMIZE';  payload: string }
  | { type: 'UNLOCK_FOLDER';    payload: string }
  | { type: 'SET_GAME_CLEARED' };

const initialState: GameState = {
  filesystem: initialFilesystem,
  windows: [],
  activeWindowId: null,
  unlockedFolders: new Set<string>(),
  gameCleared: false,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {

    case 'OPEN_WINDOW': {
      const existing = state.windows.find(w => w.id === action.payload.id);
      if (existing) {
        // すでに開いていれば最小化解除して返す
        return {
          ...state,
          windows: state.windows.map(w =>
            w.id === action.payload.id ? { ...w, minimized: false } : w
          ),
        };
      }
      return {
        ...state,
        windows: [
          ...state.windows,
          { ...action.payload, minimized: false, maximized: false },
        ],
      };
    }

    case 'CLOSE_WINDOW':
      return {
        ...state,
        windows: state.windows.filter(w => w.id !== action.payload),
        activeWindowId:
          state.activeWindowId === action.payload ? null : state.activeWindowId,
      };

    case 'CLOSE_ALL_WINDOWS':
      return { ...state, windows: [], activeWindowId: null };

    case 'MOVE_WINDOW':
      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === action.payload.id
            ? { ...w, x: action.payload.x, y: action.payload.y }
            : w
        ),
      };

    case 'MINIMIZE_WINDOW':
      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === action.payload ? { ...w, minimized: true } : w
        ),
        // 最小化したらアクティブ解除
        activeWindowId:
          state.activeWindowId === action.payload ? null : state.activeWindowId,
      };

    case 'RESTORE_WINDOW':
      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === action.payload ? { ...w, minimized: false } : w
        ),
      };

    case 'RESIZE_WINDOW':
      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === action.payload.id
            ? { ...w, width: action.payload.width, height: action.payload.height }
            : w
        ),
      };

    case 'TOGGLE_MAXIMIZE':
      return {
        ...state,
        windows: state.windows.map(w => {
          if (w.id !== action.payload) return w;
          
          if (!w.maximized) {
            // 最大化する時: 現在の bounds を退避
            return {
              ...w,
              maximized: true,
              previousBounds: { x: w.x, y: w.y, width: w.width, height: w.height },
            };
          } else {
            // 元に戻す時: 退避した bounds を復元 (なければそのまま)
            return {
              ...w,
              maximized: false,
              x: w.previousBounds?.x ?? w.x,
              y: w.previousBounds?.y ?? w.y,
              width: w.previousBounds?.width ?? w.width,
              height: w.previousBounds?.height ?? w.height,
            };
          }
        }),
      };

    case 'UNLOCK_FOLDER': {
      const newUnlocked = new Set(state.unlockedFolders);
      newUnlocked.add(action.payload);
      const updateFolder = (items: FSItem[]): FSItem[] =>
        items.map(item => {
          if (item.type === 'folder' && item.id === action.payload) {
            return { ...item, locked: false };
          }
          if (item.type === 'folder') {
            return { ...item, children: updateFolder(item.children) };
          }
          return item;
        });
      return {
        ...state,
        filesystem: updateFolder(state.filesystem) as FolderItem[],
        unlockedFolders: newUnlocked,
      };
    }

    case 'SET_GAME_CLEARED':
      return { ...state, gameCleared: true };

    default:
      return state;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Context interface
// ─────────────────────────────────────────────────────────────────────────────
interface GameContextValue {
  state: GameState;
  activeWindowId: string | null;
  openWindow: (item: FSItem, offset?: { x: number; y: number }) => void;
  openSystemOverride: () => void;
  closeWindow: (id: string) => void;
  closeAllWindows: () => void;         // ゲームクリア演出用
  /**
   * focusWindow — アクティブウィンドウを切り替える唯一の関数。
   * Window クリック・タスクバークリック 両方から呼ぶ。
   */
  focusWindow: (id: string) => void;
  moveWindow: (id: string, x: number, y: number) => void;
  resizeWindow: (id: string, width: number, height: number) => void;
  minimizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  toggleMaximize: (id: string) => void;
  unlockFolder: (id: string) => void;
  setGameCleared: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

let windowCounter = 0;

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────
export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // ★ activeWindowId は useState で独立管理（reducer 外）
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);

  // ★ focusWindow = setActiveWindowId のラッパー
  const focusWindow = useCallback((id: string) => {
    setActiveWindowId(id);
  }, []);

  // ─── ウィンドウ操作 ─────────────────────────────────────────────
  const openWindow = useCallback((item: FSItem, offset = { x: 0, y: 0 }) => {
    const id = `window-${item.id}`;
    const baseX = 40 + (windowCounter % 8) * 28;
    const baseY = 20 + (windowCounter % 8) * 28;
    windowCounter++;

    const isImage = item.type !== 'folder' && (Boolean((item as FileItem).thumbnail) || item.name.endsWith('.png'));
    const defaultWidth = item.type === 'folder' ? 540 : (isImage ? 660 : 480);
    const defaultHeight = item.type === 'folder' ? 400 : (isImage ? 440 : 360);

    dispatch({
      type: 'OPEN_WINDOW',
      payload: {
        id,
        title: item.name,
        type: item.type === 'folder' ? 'folder' : 'file',
        item,
        x: baseX + offset.x,
        y: baseY + offset.y,
        width: defaultWidth,
        height: defaultHeight,
      },
    });
    // 開いたウィンドウを即アクティブにする
    setActiveWindowId(id);
  }, []);

  const openSystemOverride = useCallback(() => {
    const id = 'window-system-override';
    dispatch({
      type: 'OPEN_WINDOW',
      payload: {
        id,
        title: 'SYSTEM OVERRIDE',
        type: 'system_override',
        x: 80,
        y: 40,
        width: 580,
        height: 480,
      },
    });
    setActiveWindowId(id);
  }, []);

  const closeWindow = useCallback((id: string) => {
    dispatch({ type: 'CLOSE_WINDOW', payload: id });
    // 閉じたらアクティブを解除（reducer 側でも activeWindowId を更新しているが
    // こちらの useState も同期する）
    setActiveWindowId(prev => (prev === id ? null : prev));
  }, []);

  const moveWindow = useCallback((id: string, x: number, y: number) => {
    dispatch({ type: 'MOVE_WINDOW', payload: { id, x, y } });
  }, []);

  const resizeWindow = useCallback((id: string, width: number, height: number) => {
    dispatch({ type: 'RESIZE_WINDOW', payload: { id, width, height } });
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    dispatch({ type: 'MINIMIZE_WINDOW', payload: id });
    setActiveWindowId(prev => (prev === id ? null : prev));
  }, []);

  const restoreWindow = useCallback((id: string) => {
    dispatch({ type: 'RESTORE_WINDOW', payload: id });
    // 復元 = アクティブにする
    setActiveWindowId(id);
  }, []);

  const toggleMaximize = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_MAXIMIZE', payload: id });
  }, []);

  const unlockFolder = useCallback((id: string) => {
    dispatch({ type: 'UNLOCK_FOLDER', payload: id });
  }, []);

  const setGameCleared = useCallback(() => {
    dispatch({ type: 'SET_GAME_CLEARED' });
  }, []);

  const closeAllWindows = useCallback(() => {
    dispatch({ type: 'CLOSE_ALL_WINDOWS' });
    setActiveWindowId(null);
  }, []);

  return (
    <GameContext.Provider
      value={{
        state,
        activeWindowId,
        openWindow,
        openSystemOverride,
        closeWindow,
        closeAllWindows,
        focusWindow,
        moveWindow,
        resizeWindow,
        minimizeWindow,
        restoreWindow,
        toggleMaximize,
        unlockFolder,
        setGameCleared,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
