import type {Message} from '@/types/messages';
import {IconFile} from '@tabler/icons-react';

export function MessageContent({message}: {message: Message}) {
  switch (message.contentType) {
    case 'FILE':
      return (
        <div className="flex flex-col gap-1">
          {message.text && <span className="text-sm">{message.text}</span>}

          {message.linkedUrls.map((url, idx) => (
            <a
              key={idx}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex bg-accent-foreground items-center gap-2 text-sm underline underline-offset-2"
            >
              <IconFile size={16} />
              <span className="truncate max-w-[14rem]"> dd{url}</span>
            </a>
          ))}
        </div>
      );

    case 'AUTOMATED':
      return <span className="italic text-xs opacity-70">{message.text}</span>;

    case 'NORMAL':
    default:
      return <span>{message.text}</span>;
  }
}
