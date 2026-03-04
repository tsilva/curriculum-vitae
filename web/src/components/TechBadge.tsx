interface TechBadgeProps {
  name: string;
  active?: boolean;
  onClick?: () => void;
}

export function TechBadge({ name, active = false, onClick }: TechBadgeProps) {
  const baseClasses =
    "font-[family-name:var(--font-mono)] text-xs px-2.5 py-1 rounded-full transition-all whitespace-nowrap";

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`${baseClasses} cursor-pointer ${
          active
            ? "bg-amber text-base font-medium"
            : "bg-surface text-slate hover:bg-surface-hover hover:text-warm-white"
        }`}
      >
        {name}
      </button>
    );
  }

  return (
    <span className={`${baseClasses} bg-surface text-slate`}>
      {name}
    </span>
  );
}
