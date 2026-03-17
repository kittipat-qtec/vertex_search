"use client";

import ReactMarkdown from "react-markdown";

export default function MarkdownRenderer({
  children,
}: {
  children: string;
}) {
  return <ReactMarkdown>{children}</ReactMarkdown>;
}
