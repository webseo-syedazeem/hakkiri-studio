/**
 * Lightweight Markdown-to-HTML parser for Hakkiri Blog.
 * Converts markdown text into semantic, safe HTML with Tailwind typography.
 */

export function markdownToHtml(md: string): string {
  if (!md) return "";

  // Normalize line endings
  let text = md.replace(/\r\n/g, "\n");

  // Escape HTML entities to prevent XSS
  text = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Code blocks (fenced)
  text = text.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (_match, lang, code) => {
    return `<div class="my-6 rounded-xl overflow-hidden border border-slate-700/60 bg-[#0f1117] text-slate-200">
      ${lang ? `<div class="px-4 py-1.5 text-xs font-mono font-medium text-slate-400 bg-white/5 border-b border-white/5 uppercase tracking-wider">${lang}</div>` : ""}
      <pre class="p-4 overflow-x-auto text-sm font-mono leading-relaxed"><code>${code.trim()}</code></pre>
    </div>`;
  });

  // Blockquotes / Callout boxes
  // Unescape > for blockquotes
  text = text.replace(/^&gt;\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*\n([\s\S]*?)(?=(?:\n\n|\n(?!&gt;)|$))/gm, (_match, type, content) => {
    const cleanContent = content.replace(/^&gt;\s?/gm, "").trim();
    let border = "border-blue-500 bg-blue-500/10 text-blue-100";
    let title = "Note";
    if (type === "TIP") {
      border = "border-emerald-500 bg-emerald-500/10 text-emerald-100";
      title = "Pro Tip";
    } else if (type === "IMPORTANT" || type === "WARNING") {
      border = "border-amber-500 bg-amber-500/10 text-amber-100";
      title = "Important";
    } else if (type === "CAUTION") {
      border = "border-rose-500 bg-rose-500/10 text-rose-100";
      title = "Caution";
    }
    return `<div class="my-5 rounded-xl border-l-4 p-4 ${border}">
      <div class="font-semibold text-xs uppercase tracking-wider mb-1">${title}</div>
      <div class="text-sm opacity-90 leading-relaxed">${cleanContent}</div>
    </div>`;
  });

  // Regular blockquotes
  text = text.replace(/^&gt;\s+(.+)$/gm, '<blockquote class="my-4 border-l-4 border-purple-500/60 pl-4 py-1 italic text-slate-300 dark:text-slate-300 bg-purple-500/5 rounded-r-lg">$1</blockquote>');

  // Horizontal rules
  text = text.replace(/^(?:---|\*\*\*|___)\s*$/gm, '<hr class="my-8 border-slate-700/40" />');

  // Headings
  text = text.replace(/^####\s+(.+)$/gm, '<h4 class="text-lg font-bold text-slate-100 mt-6 mb-2 tracking-tight">$1</h4>');
  text = text.replace(/^###\s+(.+)$/gm, '<h3 class="text-xl font-bold text-slate-100 mt-8 mb-3 tracking-tight">$1</h3>');
  text = text.replace(/^##\s+(.+)$/gm, '<h2 class="text-2xl font-bold text-slate-100 mt-10 mb-4 tracking-tight border-b border-slate-800/80 pb-2">$1</h2>');
  text = text.replace(/^#\s+(.+)$/gm, '<h1 class="text-3xl font-extrabold text-slate-100 mt-8 mb-4 tracking-tight">$1</h1>');

  // Lists (Unordered)
  text = text.replace(/^[-*+]\s+(.+)$/gm, '<li class="ml-4 list-disc pl-1 text-slate-300 my-1 leading-relaxed">$1</li>');

  // Lists (Ordered)
  text = text.replace(/^(\d+)\.\s+(.+)$/gm, '<li class="ml-4 list-decimal pl-1 text-slate-300 my-1 leading-relaxed">$2</li>');

  // Inline formatting
  // Images: ![alt](url)
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<figure class="my-6"><img src="$2" alt="$1" class="rounded-xl border border-slate-800 w-full object-cover max-h-[460px] shadow-lg" />$1 ? `<figcaption class="text-center text-xs text-slate-400 mt-2">$1</figcaption>` : ""</figure>');

  // Links: [label](url)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-purple-400 hover:text-purple-300 underline underline-offset-2 font-medium transition-colors">$1</a>');

  // Bold + Italic: ***text***
  text = text.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong class="font-bold"><em>$1</em></strong>');

  // Bold: **text**
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-slate-100">$1</strong>');

  // Italic: *text*
  text = text.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');

  // Inline code: `code`
  text = text.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-white/10 text-purple-300 text-[13px] font-mono">$1</code>');

  // Paragraphs
  const blocks = text.split(/\n\s*\n/);
  const formattedBlocks = blocks.map((block) => {
    const trimmed = block.trim();
    if (!trimmed) return "";
    // If block starts with a tag like <h1, <h2, <h3, <h4, <div, <blockquote, <hr, <li, return as is (wrap <li> in <ul>/ <ol> if needed)
    if (/^<(h[1-4]|div|blockquote|hr|figure)/i.test(trimmed)) {
      return trimmed;
    }
    if (/^<li class="[^"]*list-disc/i.test(trimmed)) {
      return `<ul class="my-4 space-y-1">${trimmed}</ul>`;
    }
    if (/^<li class="[^"]*list-decimal/i.test(trimmed)) {
      return `<ol class="my-4 space-y-1">${trimmed}</ol>`;
    }
    // Markdown table support
    if (trimmed.startsWith("|") && trimmed.includes("\n|")) {
      const rows = trimmed.split("\n").filter((r) => r.trim().startsWith("|"));
      if (rows.length >= 2) {
        const headerCols = rows[0].split("|").slice(1, -1).map((c) => c.trim());
        const bodyRows = rows.slice(2);
        return `<div class="overflow-x-auto my-6 rounded-xl border border-slate-700/60 bg-[#0f1117]/80">
          <table class="w-full text-left text-sm">
            <thead class="bg-white/5 border-b border-white/10 text-xs font-bold uppercase tracking-wider text-slate-300">
              <tr>${headerCols.map((c) => `<th class="px-5 py-3">${c}</th>`).join("")}</tr>
            </thead>
            <tbody class="divide-y divide-white/5 text-slate-300">
              ${bodyRows.map((row) => {
                const cols = row.split("|").slice(1, -1).map((c) => c.trim());
                return `<tr>${cols.map((c) => `<td class="px-5 py-3">${c}</td>`).join("")}</tr>`;
              }).join("")}
            </tbody>
          </table>
        </div>`;
      }
    }
    return `<p class="my-4 text-slate-300 leading-relaxed text-[16px]">${trimmed.replace(/\n/g, "<br />")}</p>`;
  });

  return formattedBlocks.join("\n");
}
