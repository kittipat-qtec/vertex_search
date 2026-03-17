import type { Source } from "@/lib/types";

export function SourceCitation({ source }: { source: Source }) {
  const content = (
    <>
      <div className="citation-card__title">{source.title}</div>
      <p className="citation-card__snippet">{source.snippet}</p>
      {source.documentName ? (
        <span className="citation-card__meta">{source.documentName}</span>
      ) : null}
    </>
  );

  if (source.uri) {
    return (
      <a
        aria-label={`เปิดเอกสารอ้างอิง ${source.title} ในแท็บใหม่`}
        className="citation-card"
        href={source.uri}
        target="_blank"
        rel="noopener noreferrer"
      >
        {content}
      </a>
    );
  }

  return <div className="citation-card" role="article">{content}</div>;
}
