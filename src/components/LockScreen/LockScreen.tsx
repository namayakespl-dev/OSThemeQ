import { useState, useRef, useCallback, useEffect } from 'react';
import type { FolderItem } from '../../types';
import styles from './LockScreen.module.css';

interface LockScreenProps {
  folder: FolderItem;
  /**
   * 親（FolderViewer）から渡されるコールバック。
   * 呼ばれると対象フォルダが GlobalState の unlocked リストに追加され、
   * FolderViewer が再レンダリングされてファイル一覧に切り替わる。
   */
  onUnlock: () => void;
}

/**
 * LockScreen — 汎用ロック画面コンポーネント
 *
 * ・ヒントテキストを緑の等幅フォントで表示
 * ・パスワード入力 → lockAnswer と一致で解錠
 * ・不一致時: 赤文字 [ERROR] ACCESS DENIED + シェイクアニメーション
 * ・正解時: ACCESS GRANTED を表示 → 1.5秒後に onUnlock() 呼び出し
 *           → 親が再レンダリング → LockScreen が自動的にアンマウント
 */
export function LockScreen({ folder, onUnlock }: LockScreenProps) {
  const [input,   setInput]   = useState('');
  const [error,   setError]   = useState('');
  const [shaking, setShaking] = useState(false);
  const [success, setSuccess] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // マウント時にフォーカス
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // ヒント: lockHint → lockQuestion の優先順
  const hint = folder.lockHint ?? folder.lockQuestion ?? '暗証を入力してください';

  // ─── 解錠試行 ─────────────────────────────────────────────────────
  const tryUnlock = useCallback(() => {
    const answer  = folder.lockAnswer ?? '';
    const trimmed = input.trim();

    if (trimmed === answer) {
      // ── 正解 ──────────────────────────────────────────────────────
      setError('');
      setSuccess(true);   // SUCCESS 画面に切り替え

      // ★ 1.5秒後に onUnlock() を呼ぶ
      //    → GlobalState が更新 → FolderViewer が再レンダリング
      //    → liveFolder.locked === false になり LockScreen がアンマウント
      setTimeout(() => {
        onUnlock();
      }, 1500);

    } else {
      // ── 不正解 ────────────────────────────────────────────────────
      setError('[ERROR] ACCESS DENIED');
      setInput('');

      // シェイクアニメーション
      setShaking(true);
      setTimeout(() => setShaking(false), 450);

      // エラー表示は 2.5秒後に消去
      setTimeout(() => setError(''), 2500);

      // フォーカスを戻す
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [input, folder.lockAnswer, onUnlock]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') tryUnlock();
  }, [tryUnlock]);

  // ─── 成功画面 ─────────────────────────────────────────────────────
  if (success) {
    return (
      <div className={styles.successScreen}>
        <span className={styles.successIcon}>✓</span>
        <span className={styles.successMsg}>ACCESS GRANTED</span>
        <span className={styles.successSub}>UNLOCKING...</span>
      </div>
    );
  }

  // ─── ロック画面 ───────────────────────────────────────────────────
  return (
    <div className={styles.lockScreen}>

      <div className={styles.header}>
        <span className={styles.lockIcon}>🔒</span>
        <span className={styles.title}>ACCESS RESTRICTED</span>
      </div>

      {/* ヒントテキスト（緑の等幅フォント） */}
      <div className={styles.hintBox}>{hint}</div>

      {/* 入力エリア — shaking クラスでシェイク発火 */}
      <div className={`${styles.inputArea} ${shaking ? styles.shake : ''}`}>
        <span className={styles.inputLabel}>PASSWORD</span>

        <input
          ref={inputRef}
          className={`${styles.input} ${error ? styles.inputError : ''}`}
          type="text"
          value={input}
          onChange={e => {
            setInput(e.target.value);
            if (error) setError('');
          }}
          onKeyDown={handleKeyDown}
          placeholder="_ _ _ _ _ _"
          spellCheck={false}
          autoComplete="off"
        />

        <button className={styles.unlockBtn} onClick={tryUnlock}>
          ▶ UNLOCK
        </button>

        {/* エラーメッセージ（高さ確保でレイアウトジャンプ防止） */}
        <div className={styles.errorMsg}>
          {error || '\u00a0'}
        </div>
      </div>

    </div>
  );
}
