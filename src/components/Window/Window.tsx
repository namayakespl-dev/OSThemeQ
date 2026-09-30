import React, { useRef, useCallback, type RefObject } from 'react';
import { useGame } from '../../context/GameContext';
import { useDraggable } from '../../hooks/useDraggable';
import type { WindowState } from '../../types';
import styles from './Window.module.css';

interface WindowProps {
  window: WindowState;
  workspaceRef: RefObject<HTMLElement | null>;
  children: React.ReactNode;
}

export function Window({ window: win, workspaceRef, children }: WindowProps) {
  const {
    activeWindowId,
    closeWindow,
    minimizeWindow,
    toggleMaximize,
    focusWindow,
  } = useGame();

  const { onMouseDown: onTitleBarDrag } = useDraggable(win.id, workspaceRef);

  const resizeRef = useRef<{
    startX: number; startY: number; startW: number; startH: number;
  } | null>(null);

  // ★ アクティブ判定
  const isActive = activeWindowId === win.id;

  // ─── ウィンドウ本体クリック → focusWindow ─────────────────────
  const handleWindowMouseDown = useCallback(() => {
    focusWindow(win.id);
  }, [focusWindow, win.id]);

  // ─── タイトルバー mouseDown：フォーカス + ドラッグ ────────────
  const handleTitleMouseDown = useCallback((e: React.MouseEvent) => {
    focusWindow(win.id);
    onTitleBarDrag(e);
  }, [focusWindow, win.id, onTitleBarDrag]);

  // ─── リサイズ ─────────────────────────────────────────────────
  const startResize = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (win.maximized) return;

    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startW: win.width,
      startH: win.height,
    };

    const onMove = (me: MouseEvent) => {
      if (!resizeRef.current) return;
      const newW = Math.max(320, resizeRef.current.startW + me.clientX - resizeRef.current.startX);
      const newH = Math.max(180, resizeRef.current.startH + me.clientY - resizeRef.current.startY);
      const el = document.getElementById(`win-${win.id}`);
      if (el) {
        el.style.width  = `${newW}px`;
        el.style.height = `${newH}px`;
      }
    };

    const onUp = () => {
      resizeRef.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [win.id, win.maximized, win.width, win.height]);

  if (win.minimized) return null;

  // ─── スタイル ─────────────────────────────────────────────────
  // ★ zIndex: アクティブ=999 / 非アクティブ=10
  const style: React.CSSProperties = win.maximized
    ? {
        top: 0, left: 0, width: '100%', height: '100%',
        zIndex: isActive ? 999 : 10,
      }
    : {
        top: win.y, left: win.x, width: win.width, height: win.height,
        zIndex: isActive ? 999 : 10,
      };

  return (
    <div
      id={`win-${win.id}`}
      className={`${styles.window} ${win.maximized ? styles.maximized : ''} ${isActive ? styles.focused : ''}`}
      style={style}
      onMouseDown={handleWindowMouseDown}   // ★ どこでもクリックで最前面
    >
      {/* タイトルバー */}
      <div
        className={`${styles.titleBar} ${win.maximized ? styles.maxed : ''}`}
        onMouseDown={handleTitleMouseDown}  // ★ focusWindow + ドラッグ
        onDoubleClick={() => toggleMaximize(win.id)}
      >
        <div className={styles.controls}>
          <button
            className={`${styles.btn} ${styles.btnClose}`}
            onMouseDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); closeWindow(win.id); }}
            title="Close"
          />
          <button
            className={`${styles.btn} ${styles.btnMin}`}
            onMouseDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); minimizeWindow(win.id); }}
            title="Minimize"
          />
          <button
            className={`${styles.btn} ${styles.btnMax}`}
            onMouseDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); toggleMaximize(win.id); }}
            title="Maximize / Restore"
          />
        </div>
        <div className={styles.titleWrap}>
          <span className={styles.titlePrompt}>root@sys:~$</span>
          <span className={styles.titleText}>{win.title}</span>
        </div>
      </div>

      {/* コンテンツ */}
      <div className={styles.content}>
        {children}
      </div>

      {/* リサイズハンドル */}
      {!win.maximized && (
        <div className={styles.resize} onMouseDown={startResize} />
      )}
    </div>
  );
}
