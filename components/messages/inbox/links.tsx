import {Button} from '@/components/ui/button';
import {cn} from '@/lib/utils';
import type {Message} from '@/types/messages';

function getDisplayUrl(url: string) {
  try {
    const u = new URL(url);
    return u.hostname.replace('www.', '');
  } catch {
    return url;
  }
}

type MessageLinksProps = {
  linkedUrls: Message['linkedUrls'];
  senderId: string;
  currentUserId: string;
};

function MessageLinks({linkedUrls, currentUserId, senderId}: MessageLinksProps) {
  return (
    linkedUrls.length > 0 && (
      <div className="space-y-1">
        {linkedUrls.map(url => (
          <Button
            className="hover:bg-muted/30 transition-all duration-150"
            variant="link"
            key={url}
            asChild
          >
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'flex items-center gap-2 rounded-md px-2 py-1 text-xs',
                'border hover:bg-accent transition-colors',
                senderId === currentUserId
                  ? 'border-primary/20 text-primary-foreground/90'
                  : 'border-border text-foreground'
              )}
            >
              <span className="">🔗 {getDisplayUrl(url)}</span>
            </a>
          </Button>
        ))}
      </div>
    )
  );
}

export default MessageLinks;
