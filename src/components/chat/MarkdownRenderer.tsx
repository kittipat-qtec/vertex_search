"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import type { Components } from "react-markdown";

const components: Components = {
  // ── Table ────────────────────────────────────────────
  table: ({ children }) => (
    <div className="md-table-wrapper">
      <table className="md-table">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="md-thead">{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr className="md-tr">{children}</tr>,
  th: ({ children }) => <th className="md-th">{children}</th>,
  td: ({ children }) => <td className="md-td">{children}</td>,

  // ── Code ─────────────────────────────────────────────
  code: ({ children, className }) => {
    const isBlock = className?.startsWith("language-");
    return isBlock ? (
      <code className={`md-code-block ${className ?? ""}`}>{children}</code>
    ) : (
      <code className="md-code-inline">{children}</code>
    );
  },
  pre: ({ children }) => <pre className="md-pre">{children}</pre>,

  // ── Text ──────────────────────────────────────────────
  p: ({ children }) => <p className="md-p">{children}</p>,
  strong: ({ children }) => <strong className="md-strong">{children}</strong>,
  em: ({ children }) => <em className="md-em">{children}</em>,

  // ── Lists ─────────────────────────────────────────────
  ul: ({ children }) => <ul className="md-ul">{children}</ul>,
  ol: ({ children }) => <ol className="md-ol">{children}</ol>,
  li: ({ children }) => <li className="md-li">{children}</li>,

  // ── Headings ──────────────────────────────────────────
  h1: ({ children }) => <h3 className="md-h1">{children}</h3>,
  h2: ({ children }) => <h4 className="md-h2">{children}</h4>,
  h3: ({ children }) => <h5 className="md-h3">{children}</h5>,

  // ── Misc ──────────────────────────────────────────────
  blockquote: ({ children }) => (
    <blockquote className="md-blockquote">{children}</blockquote>
  ),
  hr: () => <hr className="md-hr" />,

  // ── Links (open in new tab) ───────────────────────────
  a: ({ href, children }) => (
    <a
      className="md-link"
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      {children}
    </a>
  ),
};

export default function MarkdownRenderer({ children }: { children: string }) {
  return (
    <div className="md-root">
      <ReactMarkdown components={components} remarkPlugins={[remarkGfm, remarkBreaks]}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
