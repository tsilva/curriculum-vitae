// Convert basic Markdown to HTML
function markdownToHtml(markdown: string): string {
  return markdown
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^<br>\s*/gm, '')
    .split('\n').map(line => line.trim()).join('<br>');
}

// Extract the backstory narrative from the TLDR content
function extractBackstory(tldr: string): string {
  const lines = tldr.split('\n');
  const backstoryLines: string[] = [];
  let inBlockquote = false;

  for (const line of lines) {
    if (
      line.includes("<p align=") ||
      line.includes("readme-logo.png") ||
      line.includes("logo.png")
    ) continue;
    if (line.includes('This CV is detailed')) continue;

    if (line.match(/^>(<br>)?\s*/)) {
      inBlockquote = true;
      const cleanLine = line.replace(/^>(<br>)?\s*/, '');
      if (cleanLine) backstoryLines.push(cleanLine);
    } else if (inBlockquote) {
      if (line.trim() !== '' && !line.match(/^\s*>/)) break;
    }
  }

  return markdownToHtml(backstoryLines.join('\n'));
}

interface BackstoryProps {
  tldr: string;
}

export function Backstory({ tldr }: BackstoryProps) {
  const backstoryContent = extractBackstory(tldr);

  if (!backstoryContent) return null;

  return (
    <section id="backstory" className="py-12 px-6 relative overflow-hidden reveal">
      <div className="max-w-4xl mx-auto relative">
        <details className="backstory-details group">
          <summary className="w-full flex items-center justify-between gap-4 p-4 border-l-2 border-kiroshi-red/40 bg-surface/20 hover:bg-surface/50 hover:border-kiroshi-red/80 hover:shadow-[0_0_20px_rgba(232,0,63,0.15)] hover:translate-x-1 transition-all duration-300 cursor-pointer list-none [&::-webkit-details-marker]:hidden group-open:border-kiroshi-red group-open:bg-kiroshi-red/5 group-open:translate-x-0 group-open:hover:translate-x-0">
            <div className="flex items-center gap-3">
              <span className="font-[family-name:var(--font-mono)] text-lg text-kiroshi-red transition-transform duration-300 group-open:rotate-45">
                <span className="group-open:hidden">+</span>
                <span className="hidden group-open:inline">&times;</span>
              </span>
              <div className="flex flex-col items-start">
                <span className="font-[family-name:var(--font-mono)] text-xs text-kiroshi-red/60 tracking-[0.2em] uppercase">
                  Optional Side Quest
                </span>
                <span className="font-[family-name:var(--font-display)] text-sm tracking-[0.15em] uppercase text-steel group-open:text-cool-white group-hover:text-cool-white transition-colors duration-300">
                  ORIGIN_STORY.exe
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-[family-name:var(--font-mono)] text-xs tracking-wider text-steel/60 group-open:text-kiroshi-yellow transition-colors duration-300">
                <span className="group-open:hidden">[ LOCKED ]</span>
                <span className="hidden group-open:inline">[ ACCESSING... ]</span>
              </span>
              <div className="w-2 h-2 rounded-full bg-steel/40 group-open:bg-kiroshi-red group-open:animate-pulse group-open:shadow-[0_0_8px_rgba(232,0,63,0.6)] group-hover:bg-kiroshi-red/60 transition-all duration-300" />
            </div>
          </summary>

          <div className="mt-4 relative p-8 md:p-12 border-l-2 border-kiroshi-red/40 bg-surface/30 backdrop-blur-sm backstory-content">
            <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-kiroshi-red/60" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-kiroshi-red/60" />
            <div className="absolute -top-4 -left-2 text-6xl text-kiroshi-red/20 font-[family-name:var(--font-display)] leading-none">
              &ldquo;
            </div>

            <div
              className="font-[family-name:var(--font-body)] text-sm md:text-base !text-cool-white leading-relaxed space-y-6 [&>*]:!text-cool-white [&_a]:text-cyan [&_a]:underline [&_a]:decoration-cyan/50 [&_a]:hover:text-cool-white [&_a]:hover:decoration-cool-white [&_strong]:text-cool-white [&_strong]:font-bold"
              dangerouslySetInnerHTML={{ __html: backstoryContent }}
            />

            <div className="absolute -bottom-8 -right-2 text-6xl text-kiroshi-red/20 font-[family-name:var(--font-display)] leading-none rotate-180">
              &rdquo;
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
              <span className="font-[family-name:var(--font-mono)] text-xs text-kiroshi-yellow/60 tracking-wider">
                CLASSIFIED // LEVEL 1 CLEARANCE
              </span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-kiroshi-red/60 animate-pulse" />
                <span className="font-[family-name:var(--font-mono)] text-xs text-kiroshi-red/60">
                  AUTHENTICATED
                </span>
              </div>
            </div>
          </div>
        </details>
      </div>
    </section>
  );
}
