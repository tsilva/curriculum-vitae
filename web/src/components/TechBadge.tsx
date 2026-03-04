interface TechBadgeProps {
  name: string;
  active?: boolean;
  onClick?: () => void;
}

export function TechBadge({ name, active = false, onClick }: TechBadgeProps) {
  const baseClasses =
    "font-[family-name:var(--font-mono)] text-xs px-2.5 py-1 rounded-sm transition-all whitespace-nowrap border";

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`${baseClasses} cursor-pointer ${
          active
            ? "bg-cyan/10 text-cyan border-cyan/60 shadow-[0_0_8px_rgba(0,255,240,0.2)]"
            : "bg-surface text-steel border-steel/20 hover:border-cyan/30 hover:text-cool-white"
        }`}
      >
        {name}
      </button>
    );
  }

  return (
    <span className={`${baseClasses} bg-surface text-steel border-steel/20`}>
      {name}
    </span>
  );
}
