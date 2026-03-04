interface TechBadgeProps {
  name: string;
  active?: boolean;
  onClick?: () => void;
}

export function TechBadge({ name, active = false, onClick }: TechBadgeProps) {
  const baseClasses =
    "font-[family-name:var(--font-mono)] text-xs px-2.5 py-1 rounded-sm transition-all whitespace-nowrap border cursor-default";

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`${baseClasses} ${
          active
            ? "bg-cyan text-base border-cyan font-bold shadow-[0_0_15px_rgba(0,255,240,0.5),0_0_30px_rgba(0,255,240,0.3),inset_0_0_12px_rgba(0,255,240,0.2)] hover:shadow-[0_0_20px_rgba(0,255,240,0.6),0_0_40px_rgba(0,255,240,0.4)] scale-105"
            : "bg-surface text-steel border-steel/20 hover:border-cyan/40 hover:text-cool-white hover:shadow-[0_0_10px_rgba(0,255,240,0.2)]"
        }`}
      >
        {name}
      </button>
    );
  }

  return (
    <span className={`${baseClasses} bg-surface/80 text-kiroshi-cyan border-kiroshi-cyan/30 hover:border-kiroshi-cyan/60 hover:shadow-[0_0_8px_rgba(85,234,212,0.2)] transition-all`}>
      {name}
    </span>
  );
}
