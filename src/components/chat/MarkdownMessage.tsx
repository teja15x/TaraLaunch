'use client';

import React from 'react';

/**
 * Lightweight inline markdown renderer — no external dependencies.
 * Handles: **bold**, *italic*, `code`, bullet lists (- / * / •),
 * numbered lists, and plain paragraphs.
 */

type Token =
  | { type: 'paragraph'; parts: InlinePart[] }
  | { type: 'bullet'; items: InlinePart[][] }
  | { type: 'numbered'; items: InlinePart[][] }
  | { type: 'hr' };

type InlinePart =
  | { kind: 'text'; value: string }
  | { kind: 'bold'; value: string }
  | { kind: 'italic'; value: string }
  | { kind: 'code'; value: string };

function parseInline(text: string): InlinePart[] {
  const parts: InlinePart[] = [];
  // combined regex: **bold**, *italic*, `code`
  const re = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`(.+?)`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      parts.push({ kind: 'text', value: text.slice(last, m.index) });
    }
    if (m[1]) parts.push({ kind: 'bold', value: m[2] });
    else if (m[3]) parts.push({ kind: 'italic', value: m[4] });
    else if (m[5]) parts.push({ kind: 'code', value: m[6] });
    last = m.index + m[0].length;
  }
  if (last < text.length) {
    parts.push({ kind: 'text', value: text.slice(last) });
  }
  return parts;
}

function renderInline(parts: InlinePart[], key: string): React.ReactNode[] {
  return parts.map((part, i) => {
    const k = `${key}-${i}`;
    if (part.kind === 'bold') return <strong key={k} className="font-semibold">{part.value}</strong>;
    if (part.kind === 'italic') return <em key={k}>{part.value}</em>;
    if (part.kind === 'code') return <code key={k} className="rounded bg-white/10 px-1 py-0.5 font-mono text-xs">{part.value}</code>;
    return <span key={k}>{part.value}</span>;
  });
}

function tokenize(raw: string): Token[] {
  const lines = raw.split('\n');
  const tokens: Token[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    if (!line) { i++; continue; }

    if (line === '---' || line === '***' || line === '___') {
      tokens.push({ type: 'hr' });
      i++;
      continue;
    }

    // bullet list block
    if (/^[-*•]\s/.test(line)) {
      const items: InlinePart[][] = [];
      while (i < lines.length && /^[-*•]\s/.test(lines[i].trim())) {
        items.push(parseInline(lines[i].trim().replace(/^[-*•]\s+/, '')));
        i++;
      }
      tokens.push({ type: 'bullet', items });
      continue;
    }

    // numbered list block
    if (/^\d+[.)]\s/.test(line)) {
      const items: InlinePart[][] = [];
      while (i < lines.length && /^\d+[.)]\s/.test(lines[i].trim())) {
        items.push(parseInline(lines[i].trim().replace(/^\d+[.)]\s+/, '')));
        i++;
      }
      tokens.push({ type: 'numbered', items });
      continue;
    }

    // paragraph — collect consecutive non-list lines
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^[-*•]\s/.test(lines[i].trim()) &&
      !/^\d+[.)]\s/.test(lines[i].trim()) &&
      lines[i].trim() !== '---'
    ) {
      paraLines.push(lines[i].trim());
      i++;
    }
    tokens.push({ type: 'paragraph', parts: parseInline(paraLines.join(' ')) });
  }

  return tokens;
}

interface Props {
  content: string;
  className?: string;
}

export function MarkdownMessage({ content, className }: Props) {
  const tokens = tokenize(content);

  return (
    <div className={className}>
      {tokens.map((token, ti) => {
        if (token.type === 'hr') {
          return <hr key={ti} className="my-2 border-white/20" />;
        }
        if (token.type === 'bullet') {
          return (
            <ul key={ti} className="my-1 ml-4 list-disc space-y-0.5">
              {token.items.map((item, ii) => (
                <li key={ii}>{renderInline(item, `${ti}-${ii}`)}</li>
              ))}
            </ul>
          );
        }
        if (token.type === 'numbered') {
          return (
            <ol key={ti} className="my-1 ml-4 list-decimal space-y-0.5">
              {token.items.map((item, ii) => (
                <li key={ii}>{renderInline(item, `${ti}-${ii}`)}</li>
              ))}
            </ol>
          );
        }
        // paragraph
        return (
          <p key={ti} className="my-1">
            {renderInline(token.parts, `${ti}`)}
          </p>
        );
      })}
    </div>
  );
}
