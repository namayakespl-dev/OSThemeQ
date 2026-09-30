import { useState, useRef, useCallback, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import styles from './SystemOverride.module.css';

// ─── 正解コード ─────────────────────────────────────────────────────
const ANSWERS = { s1: 'DO', s3: 'ON' } as const;

export function SystemOverride() {
  const { setGameCleared, closeAllWindows } = useGame();

  const [s1, setS1]       = useState('');      // Sector 1 入力値
  const [s3, setS3]       = useState('');      // Sector 3 入力値
  const [error, setError]  = useState('');
  const [shaking, setShaking] = useState(false);
  const [phase, setPhase]  = useState<'lock' | 'success'>('lock');

  const s1Ref = useRef<HTMLInputElement>(null);
  const s3Ref = useRef<HTMLInputElement>(null);

  useEffect(() => { s1Ref.current?.focus(); }, []);

  // ─── 入力ハンドラ（2文字・大文字変換） ─────────────────────────
  const handleS1 = (v: string) => {
    setS1(v.toUpperCase().slice(0, 2));
    setError('');
  };
  const handleS3 = (v: string) => {
    setS3(v.toUpperCase().slice(0, 2));
    setError('');
  };

  // ─── EXECUTE ───────────────────────────────────────────────────
  const execute = useCallback(() => {
    const ok =
      s1.trim().toUpperCase() === ANSWERS.s1 &&
      s3.trim().toUpperCase() === ANSWERS.s3;

    if (ok) {
      // ── 正解 ────────────────────────────────────────────────────
      setError('');
      setPhase('success');

      // 2秒後にゲームクリア State を更新 → Desktop の clearedOverlay が表示される
      setTimeout(() => {
        setGameCleared();
      }, 2000);

      // さらに 3.5秒後に全ウィンドウを閉じて初期デスクトップへ
      setTimeout(() => {
        closeAllWindows();
      }, 3500);

    } else {
      // ── 不正解 ──────────────────────────────────────────────────
      setError('[ERROR] INVALID CODE — AUTHENTICATION FAILED');
      setS1('');
      setS3('');
      // シェイクアニメーション
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      // エラーを 3 秒後に消去
      setTimeout(() => setError(''), 3000);
      setTimeout(() => s1Ref.current?.focus(), 50);
    }
  }, [s1, s3, setGameCleared, closeAllWindows]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') execute();
  }, [execute]);

  // ─── SUCCESS 画面（赤 → 緑） ─────────────────────────────────────
  if (phase === 'success') {
    return (
      <div className={styles.successRoot}>
        <div className={styles.successInner}>
          <div className={styles.successBanner}>
            <span className={styles.successCheck}>✓</span>
            <span className={styles.successTitle}>[SUCCESS] ALL SYSTEMS ONLINE</span>
          </div>
          <div className={styles.successLog}>
            <span>&gt; Sector 1 [空 / DRONE]  ......... CODE: DO ........ [ONLINE] ✓</span>
            <span>&gt; Sector 2 [闘 / GAME]   ......... CODE: ST ........ [ONLINE] ✓</span>
            <span>&gt; Sector 3 [繋 / COMM]   ......... CODE: ON ........ [ONLINE] ✓</span>
            <span>&gt; COMBINED: D-O-S-T-O-N ................... [VERIFIED] ✓</span>
            <span>&gt; NAMAYAN SYSTEM .................. [FULLY RESTORED] ✓</span>
          </div>
          <div className={styles.successSub}>
            ── GAME CLEAR ── おめでとうございます！謎解き完了 ──
          </div>
        </div>
      </div>
    );
  }

  // ─── LOCK 画面（赤ベース） ────────────────────────────────────────
  return (
    <div className={`${styles.root} ${shaking ? styles.shake : ''}`}>
      <div className={styles.inner}>

        {/* ── ヘッダー ── */}
        <div className={styles.header}>
          <div className={styles.fatalBadge}>⚠ FATAL</div>
          <div className={styles.fatalTitle}>
            {/* 点滅テキスト */}
            <span className={styles.blink}>[FATAL] SYSTEM OVERRIDE REQUIRED</span>
          </div>
          <div className={styles.desc}>
            システム復旧のため、各セクターの管理コード（2文字）を入力してください。<br />
            全セクターの認証が完了次第、システムを復旧します。
          </div>
        </div>

        <div className={styles.divider} />

        {/* ── セクター入力 ── */}
        <div className={styles.sectors}>
          <div className={styles.sectorTitle}>▶ SECTOR AUTHENTICATION</div>

          {/* Sector 1 */}
          <div className={styles.sectorRow}>
            <span className={styles.sectorLabel}>[ Sector 1 : 空（DRONE）]</span>
            <input
              ref={s1Ref}
              className={styles.sectorInput}
              type="text"
              maxLength={2}
              value={s1}
              onChange={e => handleS1(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="__"
              spellCheck={false}
              autoComplete="off"
            />
          </div>

          {/* Sector 2 — 固定 */}
          <div className={styles.sectorRow}>
            <span className={styles.sectorLabel}>[ Sector 2 : 闘（GAME） ]</span>
            <span className={styles.sectorFixed}>ST</span>
          </div>

          {/* Sector 3 */}
          <div className={styles.sectorRow}>
            <span className={styles.sectorLabel}>[ Sector 3 : 繋（COMM） ]</span>
            <input
              ref={s3Ref}
              className={styles.sectorInput}
              type="text"
              maxLength={2}
              value={s3}
              onChange={e => handleS3(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="__"
              spellCheck={false}
              autoComplete="off"
            />
          </div>
        </div>

        {/* ── エラーメッセージ ── */}
        <div className={styles.errorLine}>
          {error || '\u00a0'}
        </div>

        {/* ── EXECUTE ボタン ── */}
        <button className={styles.execBtn} onClick={execute}>
          ▶ EXECUTE OVERRIDE
        </button>

      </div>
    </div>
  );
}
