import type { Source } from "@/lib/types";

export function SourceCitation({ source }: { source: Source }) {
  return (
    <div className="citation-card" role="article">
      <div className="citation-card__title">{source.title}</div>
      <p className="citation-card__snippet">{source.snippet}</p>
      {source.documentName ? (
        <span className="citation-card__meta">{source.documentName}</span>
      ) : null}
    </div>
  );
}
