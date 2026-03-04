export function Footer() {
  return (
    <footer className="border-t border-amber/10 py-8 text-center pb-16 lg:pb-8">
      <p className="font-[family-name:var(--font-mono)] text-xs text-slate-dim">
        &copy; {new Date().getFullYear()} Tiago Silva
      </p>
    </footer>
  );
}
