import { useState } from 'react';
import type { FileItem } from '../../types';
import styles from './ImageViewer.module.css';

/**
 * ImageViewer — 静止画を表示するシンプルなビューア
 * 動画ファイル（.mp4）は再生せず、thumbnail に設定された画像を表示する。
 */
export function ImageViewer({ file }: { file: FileItem }) {
  const [loadFailed, setLoadFailed] = useState(false);
  const src = file.thumbnail;
  const date = file.metadata?.createdAt;

  return (
    <div className={styles.viewer}>
      <div className={styles.statusBar}>
        <span className={styles.statusTag}>[IMAGE_PREVIEW]</span>
        <span className={styles.fileName}>{file.name}</span>
        {date && <span className={styles.meta}>DATE: {date}</span>}
      </div>

      <div className={styles.stage}>
        {src && !loadFailed ? (
          <div className={styles.frame}>
            <img
              className={styles.image}
              src={src}
              alt={file.metadata?.description ?? file.name}
              onError={() => setLoadFailed(true)}
            />
          </div>
        ) : (
          <div className={styles.placeholder}>
            <span className={styles.placeholderIcon}>🖼</span>
            <span>NO IMAGE DATA</span>
            {src && <span className={styles.placeholderPath}>public{src}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
