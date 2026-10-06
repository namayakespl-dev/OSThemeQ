export type FileType = 'txt' | 'md' | 'mp4' | 'png' | 'pdf' | 'exe' | 'json';

export interface FileItem {
  id: string;
  name: string;
  type: FileType;
  content?: string;
  metadata?: Record<string, string>;
  /** 動画ファイル等の代わりに表示する静止画のパス（public/ からの相対） */
  thumbnail?: string;
}

export type LockType = 'numeric' | 'text';

export interface FolderItem {
  id: string;
  name: string;
  type: 'folder';
  locked: boolean;
  lockType?: LockType;
  lockAnswer?: string;
  lockQuestion?: string;
  lockHint?: string;
  children: (FileItem | FolderItem)[];
}

export type FSItem = FileItem | FolderItem;

export interface WindowState {
  id: string;
  title: string;
  type: 'folder' | 'file' | 'system_override';
  item?: FSItem;
  x: number;
  y: number;
  width: number;
  height: number;
  // zIndex は GameContext の activeWindowId で動的に決定するため不要
  minimized: boolean;
  maximized: boolean;
}

export interface GameState {
  filesystem: FolderItem[];
  windows: WindowState[];
  activeWindowId: string | null;   // ← アクティブウィンドウID
  unlockedFolders: Set<string>;
  gameCleared: boolean;
}
