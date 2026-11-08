import React from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';

interface MarkdownRendererProps {
  content: string;
  onContentChange?: (newContent: string) => void;
  fontClass?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  onContentChange,
  fontClass = 'note-prose-sans',
}) => {
  const { pages, selectPage, createPage } = useWorkspace();

  // Handle task checkbox toggle in markdown content
  const handleToggleTask = (lineIndex: number, currentChecked: boolean) => {
    if (!onContentChange) return;
    const lines = content.split('\n');
    if (lineIndex < 0 || lineIndex >= lines.length) return;

    const line = lines[lineIndex];
    const targetPattern = currentChecked ? '- [x]' : '- [ ]';
    const replacementPattern = currentChecked ? '- [ ]' : '- [x]';

    lines[lineIndex] = line.replace(targetPattern, replacementPattern);
    onContentChange(lines.join('\n'));
  };

  // Handle clicking an internal link [[Title]]
  const handleInternalLinkClick = async (title: string) => {
    const cleanTitle = title.trim();
    const existing = pages.find(
      p => p.title.trim().toLowerCase() === cleanTitle.toLowerCase()
    );

    if (existing) {
      selectPage(existing.id);
    } else {
      const confirmCreate = window.confirm(
        `Note "[[${cleanTitle}]]" does not exist yet. Would you like to create it?`
      );
      if (confirmCreate) {
        const newPage = await createPage({
          title: cleanTitle,
          content: `# ${cleanTitle}\n\nCreated from internal link.`,
        });
        selectPage(newPage.id);
      }
    }
  };

  // Render inline formatting (bold, italic, code, [[internal links]], #tags)
  const renderInline = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let keyIdx = 0;

    const linkPattern = /\[\[([^\]]+)\]\]/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = linkPattern.exec(text)) !== null) {
      const precedingText = text.substring(lastIndex, match.index);
      if (precedingText) {
        parts.push(renderFormatting(precedingText, `p-${keyIdx++}`));
      }

      const linkTitle = match[1].trim();
      const targetExists = pages.some(
        p => p.title.trim().toLowerCase() === linkTitle.toLowerCase()
      );

      parts.push(
        <button
          key={`link-${keyIdx++}`}
          type="button"
          onClick={() => handleInternalLinkClick(linkTitle)}
          className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            targetExists
              ? 'bg-[#EEF2EB] dark:bg-[#282A2F] text-[#4F6348] dark:text-[#CBD5E1] border border-[#D6DFD1] dark:border-[#383B43] hover:scale-[1.02] shadow-2xs'
              : 'bg-[#F7EFEA] dark:bg-[#282A2F] text-[#8C5237] dark:text-[#DEB29E] border border-dashed border-[#EDDACF] dark:border-[#383B43] hover:scale-[1.02]'
          }`}
          title={targetExists ? `Open note: ${linkTitle}` : `Create new note: ${linkTitle}`}
        >
          <span className="text-[10px] text-[#7B8E73] dark:text-[#A2A5AC] mr-1 opacity-80">
            [[
          </span>
          {linkTitle}
          <span className="text-[10px] text-[#7B8E73] dark:text-[#A2A5AC] ml-1 opacity-80">
            ]]
          </span>
        </button>
      );

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(renderFormatting(text.substring(lastIndex), `tail-${keyIdx++}`));
    }

    return parts.length > 0 ? parts : text;
  };

  // Helper for bold, italic, code
  const renderFormatting = (raw: string, keyPrefix: string): React.ReactNode => {
    const tokens: React.ReactNode[] = [];
    let buffer = '';
    let i = 0;
    let k = 0;

    const flush = () => {
      if (buffer) {
        tokens.push(<span key={`${keyPrefix}-${k++}`}>{buffer}</span>);
        buffer = '';
      }
    };

    while (i < raw.length) {
      // Inline code `...`
      if (raw[i] === '`') {
        flush();
        const end = raw.indexOf('`', i + 1);
        if (end !== -1) {
          tokens.push(
            <code
              key={`${keyPrefix}-code-${k++}`}
              className="px-1.5 py-0.5 rounded-md text-xs font-mono bg-[#EEEEEA] dark:bg-[#1B1C1F] text-[#8C5237] dark:text-[#DEB29E] border border-[#E3E4DC] dark:border-[#32353C]"
            >
              {raw.substring(i + 1, end)}
            </code>
          );
          i = end + 1;
          continue;
        }
      }

      // Bold **...**
      if (raw.startsWith('**', i)) {
        flush();
        const end = raw.indexOf('**', i + 2);
        if (end !== -1) {
          tokens.push(
            <strong key={`${keyPrefix}-b-${k++}`} className="font-bold text-[#30332E] dark:text-[#EEEEEE]">
              {raw.substring(i + 2, end)}
            </strong>
          );
          i = end + 2;
          continue;
        }
      }

      // Italic *...*
      if (raw[i] === '*' && raw[i + 1] !== '*') {
        flush();
        const end = raw.indexOf('*', i + 1);
        if (end !== -1) {
          tokens.push(
            <em key={`${keyPrefix}-em-${k++}`} className="italic text-[#55584F] dark:text-[#A2A5AC]">
              {raw.substring(i + 1, end)}
            </em>
          );
          i = end + 1;
          continue;
        }
      }

      buffer += raw[i];
      i++;
    }

    flush();
    return tokens;
  };

  // Parse blocks
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLang = '';

  lines.forEach((line, lineIndex) => {
    // Code block fences
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <div key={`codeblock-${lineIndex}`} className="my-4 rounded-2xl bg-[#1B1C1F] border border-[#32353C] text-[#EEEEEE] p-4 font-mono text-xs overflow-x-auto shadow-2xs">
            {codeLang && <div className="text-[10px] uppercase font-bold tracking-wider text-[#A2A5AC] mb-2">{codeLang}</div>}
            <pre className="whitespace-pre leading-relaxed">{codeBuffer.join('\n')}</pre>
          </div>
        );
        inCodeBlock = false;
        codeBuffer = [];
        codeLang = '';
      } else {
        inCodeBlock = true;
        codeLang = line.trim().replace('```', '');
      }
      return;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      return;
    }

    // Horizontal rule
    if (/^---+$|^\*\*\*+$/.test(line.trim())) {
      elements.push(
        <hr key={`hr-${lineIndex}`} className="my-6 border-[#E3E4DC] dark:border-[#32353C]" />
      );
      return;
    }

    // Headings
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={`h1-${lineIndex}`} className="text-2xl sm:text-3xl font-bold tracking-tight text-[#30332E] dark:text-[#EEEEEE] font-heading mt-6 mb-3">
          {renderInline(line.replace('# ', ''))}
        </h1>
      );
      return;
    }

    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={`h2-${lineIndex}`} className="text-xl sm:text-2xl font-bold tracking-tight text-[#30332E] dark:text-[#EEEEEE] font-heading mt-5 mb-2.5">
          {renderInline(line.replace('## ', ''))}
        </h2>
      );
      return;
    }

    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${lineIndex}`} className="text-base sm:text-lg font-bold text-[#30332E] dark:text-[#EEEEEE] font-heading mt-4 mb-2">
          {renderInline(line.replace('### ', ''))}
        </h3>
      );
      return;
    }

    // Task list items: - [ ] or - [x]
    const taskMatch = line.match(/^(\s*)-\s*\[([ xX])\]\s*(.*)$/);
    if (taskMatch) {
      const isChecked = taskMatch[2].toLowerCase() === 'x';
      const text = taskMatch[3];
      elements.push(
        <label
          key={`task-${lineIndex}`}
          className="flex items-start gap-3 my-1.5 text-sm cursor-pointer group select-none min-h-[32px] py-0.5 hover:opacity-90"
        >
          <input
            type="checkbox"
            checked={isChecked}
            onChange={() => handleToggleTask(lineIndex, isChecked)}
            className="mt-1 h-4 w-4 rounded-md border-[#E3E4DC] dark:border-[#32353C] text-[#7B8E73] dark:text-[#EEEEEE] focus:ring-[#7B8E73] dark:focus:ring-[#4B4F58] cursor-pointer shrink-0 accent-[#7B8E73] dark:accent-[#EEEEEE]"
          />
          <span
            className={`flex-1 leading-relaxed ${
              isChecked
                ? 'line-through text-[#969990] dark:text-[#6C7078]'
                : 'text-[#30332E] dark:text-[#EEEEEE]'
            }`}
          >
            {renderInline(text)}
          </span>
        </label>
      );
      return;
    }

    // Bullet lists
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const text = line.replace(/^\s*[-*]\s*/, '');
      elements.push(
        <li key={`li-${lineIndex}`} className="ml-5 list-disc text-sm text-[#30332E] dark:text-[#EEEEEE] my-1 leading-relaxed">
          {renderInline(text)}
        </li>
      );
      return;
    }

    // Numbered lists
    const numMatch = line.match(/^\s*(\d+)\.\s+(.*)$/);
    if (numMatch) {
      elements.push(
        <div key={`num-${lineIndex}`} className="flex items-start gap-2.5 my-1 text-sm text-[#30332E] dark:text-[#EEEEEE] leading-relaxed">
          <span className="font-semibold text-[#7B8E73] dark:text-[#A2A5AC] tabular-nums shrink-0">{numMatch[1]}.</span>
          <span className="flex-1">{renderInline(numMatch[2])}</span>
        </div>
      );
      return;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      elements.push(
        <blockquote
          key={`quote-${lineIndex}`}
          className="my-3.5 pl-4 py-2 border-l-3 border-[#7B8E73] dark:border-[#4B4F58] bg-[#EEF2EB]/50 dark:bg-[#1B1C1F]/70 rounded-r-xl italic text-[#55584F] dark:text-[#A2A5AC] text-sm leading-relaxed"
        >
          {renderInline(line.replace('> ', ''))}
        </blockquote>
      );
      return;
    }

    // Empty line spacer
    if (!line.trim()) {
      elements.push(<div key={`empty-${lineIndex}`} className="h-2" />);
      return;
    }

    // Normal paragraph
    elements.push(
      <p key={`p-${lineIndex}`} className="text-sm leading-relaxed text-[#30332E] dark:text-[#EEEEEE] my-1.5">
        {renderInline(line)}
      </p>
    );
  });

  return (
    <div className={`prose-container max-w-none ${fontClass}`}>
      {elements}
    </div>
  );
};
