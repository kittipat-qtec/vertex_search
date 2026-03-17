import type { ReactNode } from "react";

interface HeaderProps {
  actions?: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
}

export function Header({
  actions,
  eyebrow,
  title,
  description,
}: HeaderProps) {
  return (
    <header className="page-header">
      <div className="page-header__content">
        <span className="page-header__eyebrow">{eyebrow}</span>
        <h1 className="page-header__title">{title}</h1>
        <p className="page-header__description">{description}</p>
      </div>
      {actions ? <div className="page-header__actions">{actions}</div> : null}
    </header>
  );
}
