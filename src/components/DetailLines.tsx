/**
 * Affiche un texte saisi dans l'admin : les lignes commençant par "- " forment une liste à puces,
 * les autres restent des lignes distinctes ; une ligne vide sépare deux paragraphes.
 */
export function DetailLines({ text }: { text: string }) {
  const blocks: { bullets: boolean; lines: string[] }[] = [];
  let gap = false;
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) {
      gap = true;
      continue;
    }
    const bullets = line.startsWith("- ");
    const content = bullets ? line.slice(2).trim() : line;
    const last = blocks[blocks.length - 1];
    if (last && last.bullets === bullets && !gap) last.lines.push(content);
    else blocks.push({ bullets, lines: [content] });
    gap = false;
  }

  return (
    <div className="space-y-2 text-sm text-brand-ink/70 dark:text-white/80 leading-relaxed">
      {blocks.map((block, i) =>
        block.bullets ? (
          <ul key={i} className="list-disc pl-5 space-y-1">
            {block.lines.map((line, j) => (
              <li key={j}>{line}</li>
            ))}
          </ul>
        ) : (
          <p key={i} className="whitespace-pre-line">{block.lines.join("\n")}</p>
        ),
      )}
    </div>
  );
}
