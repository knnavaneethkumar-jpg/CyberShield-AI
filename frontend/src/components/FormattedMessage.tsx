import React from 'react';
import { AlertTriangle, CheckCircle, Info, ShieldAlert } from 'lucide-react';

interface FormattedMessageProps {
  content: string;
}

export const FormattedMessage: React.FC<FormattedMessageProps> = ({ content }) => {
  // Split lines to render headings, bullet points, checklists, and code snippets cleanly
  const lines = content.split('\n');

  return (
    <div className="space-y-2 text-sm leading-relaxed text-white/90 break-words">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        // Heading 3 or 4: ### or ##
        if (trimmed.startsWith('### ') || trimmed.startsWith('## ')) {
          const text = trimmed.replace(/^#{2,3}\s+/, '');
          return (
            <h4 key={idx} className="text-sm font-bold text-accent-teal mt-3 mb-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-teal" />
              {renderInlineStyles(text)}
            </h4>
          );
        }

        // Heading 1 or Title: #
        if (trimmed.startsWith('# ')) {
          const text = trimmed.replace(/^#\s+/, '');
          return (
            <h3 key={idx} className="text-base font-extrabold text-white mt-3 mb-1 border-b border-white/10 pb-1">
              {renderInlineStyles(text)}
            </h3>
          );
        }

        // High Alert / Danger callout
        if (trimmed.toLowerCase().includes('**dangerous**') || trimmed.toLowerCase().includes('**high risk**') || trimmed.startsWith('[DANGER]')) {
          return (
            <div key={idx} className="my-2 p-2.5 bg-accent-red/10 border border-accent-red/30 rounded-lg flex items-start gap-2 text-xs text-red-200">
              <ShieldAlert className="w-4 h-4 text-accent-red shrink-0 mt-0.5" />
              <div>{renderInlineStyles(trimmed.replace('[DANGER]', ''))}</div>
            </div>
          );
        }

        // Warning / Caution callout
        if (trimmed.toLowerCase().includes('**suspicious**') || trimmed.toLowerCase().includes('**warning**') || trimmed.startsWith('[WARNING]')) {
          return (
            <div key={idx} className="my-2 p-2.5 bg-accent-yellow/10 border border-accent-yellow/30 rounded-lg flex items-start gap-2 text-xs text-amber-200">
              <AlertTriangle className="w-4 h-4 text-accent-yellow shrink-0 mt-0.5" />
              <div>{renderInlineStyles(trimmed.replace('[WARNING]', ''))}</div>
            </div>
          );
        }

        // Bullet point
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const bulletText = trimmed.replace(/^[-*]\s+/, '');
          return (
            <div key={idx} className="flex items-start gap-2 pl-1 py-0.5">
              <span className="text-accent-teal mt-1 text-xs">•</span>
              <span className="flex-1 text-white/80">{renderInlineStyles(bulletText)}</span>
            </div>
          );
        }

        // Numbered list
        const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numberedMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1 py-0.5">
              <span className="font-mono text-xs text-accent-teal font-bold px-1.5 py-0.5 bg-accent-teal/10 rounded">
                {numberedMatch[1]}
              </span>
              <span className="flex-1 text-white/80">{renderInlineStyles(numberedMatch[2])}</span>
            </div>
          );
        }

        // Code block / quote
        if (trimmed.startsWith('`') && trimmed.endsWith('`')) {
          return (
            <div key={idx} className="my-1.5 p-2 bg-black/40 border border-white/10 rounded font-mono text-xs text-accent-teal/90 overflow-x-auto">
              {trimmed.replace(/`/g, '')}
            </div>
          );
        }

        // Regular paragraph
        return (
          <p key={idx} className="text-white/85">
            {renderInlineStyles(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

// Simple inline styling helper for **bold**, *italics*, and `inline code`
function renderInlineStyles(text: string): React.ReactNode[] {
  // Regex to split on bold **...** and inline code `...`
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldText = part.slice(2, -2);
      return (
        <strong key={i} className="font-semibold text-white">
          {boldText}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      const codeText = part.slice(1, -1);
      return (
        <code key={i} className="px-1.5 py-0.5 bg-white/10 text-accent-teal rounded text-xs font-mono">
          {codeText}
        </code>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}
