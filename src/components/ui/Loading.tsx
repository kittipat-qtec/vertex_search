export function Loading({ label = "กำลังโหลด…" }: { label?: string }) {
  return (
    <div aria-live="polite" className="loading" role="status">
      <span aria-hidden="true" className="loading__spinner" />
      <span>{label}</span>
    </div>
  );
}
