import React from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { FileItem } from '../../types';
import { useGame } from '../../context/GameContext';
import { ImageViewer } from '../ImageViewer/ImageViewer';
import styles from './FileViewer.module.css';

// ─── Markdown renderer ────────────────────────────────────────────
function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('*') && part.endsWith('*'))
      return <em key={i}>{part.slice(1, -1)}</em>;
    if (part.startsWith('`') && part.endsWith('`'))
      return <code key={i}>{part.slice(1, -1)}</code>;
    return part;
  });
}

function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split('\n');
  const result: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('# ')) {
      result.push(<h1 key={i}>{line.slice(2)}</h1>);
    } else if (line.startsWith('## ')) {
      result.push(<h2 key={i}>{line.slice(3)}</h2>);
    } else if (line.startsWith('### ')) {
      result.push(<h3 key={i}>{line.slice(4)}</h3>);
    } else if (line.trim() === '---') {
      result.push(<hr key={i} />);
    } else if (line.startsWith('| ')) {
      // Table
      const rows: string[][] = [];
      while (i < lines.length && lines[i].startsWith('|')) {
        rows.push(lines[i].split('|').slice(1, -1).map(c => c.trim()));
        i++;
      }
      const headers = rows[0];
      const body = rows.slice(2);
      result.push(
        <table key={`t${i}`}>
          <thead><tr>{headers.map((h, j) => <th key={j}>{renderInline(h)}</th>)}</tr></thead>
          <tbody>{body.map((row, ri) => <tr key={ri}>{row.map((c, ci) => <td key={ci}>{renderInline(c)}</td>)}</tr>)}</tbody>
        </table>
      );
      continue;
    } else if (line.startsWith('- [x] ') || line.startsWith('- [ ] ')) {
      const items: { done: boolean; text: string }[] = [];
      while (i < lines.length && (lines[i].startsWith('- [x] ') || lines[i].startsWith('- [ ] '))) {
        items.push({ done: lines[i].startsWith('- [x]'), text: lines[i].slice(6) });
        i++;
      }
      result.push(
        <ul key={`cl${i}`} style={{ listStyle: 'none', paddingLeft: 0 }}>
          {items.map((it, idx) => (
            <li key={idx} className={`${styles.checkItem} ${it.done ? styles.checkDone : styles.checkPend}`}>
              <span>{it.done ? '✓' : '○'}</span>
              <span>{renderInline(it.text)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      const items: string[] = [];
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        items.push(lines[i].slice(2));
        i++;
      }
      result.push(<ul key={`ul${i}`}>{items.map((it, idx) => <li key={idx}>{renderInline(it)}</li>)}</ul>);
      continue;
    } else if (line.trim() === '') {
      result.push(<br key={i} />);
    } else {
      result.push(<p key={i}>{renderInline(line)}</p>);
    }
    i++;
  }
  return <>{result}</>;
}

// ─── FileViewer ───────────────────────────────────────────────────
export function FileViewer({ file }: { file: FileItem }) {
  const { openSystemOverride } = useGame();

  // サムネイルが設定されているファイル、または画像ファイル（png）は画像ビューアで表示する
  if (file.thumbnail || file.type === 'png') {
    const fileWithThumb = {
      ...file,
      thumbnail: file.thumbnail ?? `/images/${file.name}`,
    };
    return <ImageViewer file={fileWithThumb} />;
  }

  const inner = () => {
    switch (file.type) {

      case 'txt':
        return (
          <div className={styles.txtViewer}>
            <div className={styles.txtHeader}>
              {'>'} {file.name} — TEXT FILE
            </div>
            {file.content}
          </div>
        );

      case 'md':
        return (
          <div className={styles.mdViewer}>
            {renderMarkdown(file.content || '')}
          </div>
        );

      case 'mp4': {
        const m = file.metadata || {};
        const rows: [string, string][] = [
          ['FILE', file.name],
          ['DATE', m.createdAt || '—'],
          ['DURATION', m.duration || '—'],
          ['RESOLUTION', m.resolution || '—'],
          ['FPS', m.fps || '—'],
          ['CODEC', m.codec || '—'],
          ['SIZE', m.size || '—'],
          ['DESC', m.description || '—'],
        ];
        return (
          <div className={styles.mp4Viewer}>
            <div className={styles.mp4Header}>
              <div className={styles.mp4Thumb}>▶</div>
              <div>
                <div className={styles.mp4Name}>{file.name}</div>
                <span className={styles.mp4TypeBadge}>MP4 · VIDEO</span>
              </div>
            </div>
            <div className={styles.metaGrid}>
              {rows.filter(([, v]) => v !== '—').map(([k, v]) => (
                <div className={styles.metaRow} key={k}>
                  <span className={styles.metaKey}>{k}</span>
                  <span className={styles.metaVal}>{v}</span>
                </div>
              ))}
            </div>
            <div className={styles.noPlayMsg}>
              [ PLAYBACK NOT AVAILABLE — METADATA ONLY ]
            </div>
          </div>
        );
      }

      case 'png':
        return (
          <div className={styles.pngViewer}>
            <div className={styles.imgPlaceholder}>
              <span className={styles.imgEmoji}>🐕</span>
              <span className={styles.imgLabel}>
                {file.metadata?.description || file.name}
              </span>
            </div>
            <span className={styles.imgCaption}>{file.name} — IMAGE FILE</span>
          </div>
        );

      case 'pdf':
        return (
          <div className={styles.pdfViewer}>
            {renderMarkdown(file.content || '')}
          </div>
        );

      case 'json':
        return (
          <div className={styles.jsonViewer}>
            {(file.content || '').split('\n').map((line, i) => {
              if (line.trim().startsWith('//')) {
                return <span key={i} className={styles.jsonComment}>{line}{'\n'}</span>;
              }
              return <span key={i}>{line}{'\n'}</span>;
            })}
          </div>
        );

      case 'exe':
        return (
          <div className={styles.exeViewer}>
            <div className={styles.exeAscii}>{`
 ███████╗██╗  ██╗███████╗
 ██╔════╝╚██╗██╔╝██╔════╝
 █████╗   ╚███╔╝ █████╗  
 ██╔══╝   ██╔██╗ ██╔══╝  
 ███████╗██╔╝ ██╗███████╗
 ╚══════╝╚═╝  ╚═╝╚══════╝`}
            </div>
            <div className={styles.exeTitle}>{file.name}</div>
            <div className={styles.exeInfo}>
              TYPE: Win64 Executable (.exe){'\n'}
              STATUS: Ready to execute{'\n'}
              SIGNATURE: NAMAYAN_SYS_OVERRIDE_v4.2
            </div>
            <button className={styles.exeRunBtn} onClick={openSystemOverride}>
              ▶ EXECUTE
            </button>
            <div className={styles.exeWarning}>
              ⚠ WARNING: This will trigger a SYSTEM OVERRIDE sequence
            </div>
          </div>
        );

      default:
        return (
          <div className={styles.txtViewer}>
            <div className={styles.txtHeader}>UNKNOWN FILE TYPE</div>
            {file.content}
          </div>
        );
    }
  };

  return <div className={styles.wrap}>{inner()}</div>;
}
