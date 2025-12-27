import {MessageSquare, Briefcase} from 'lucide-react';
import {Button} from '@/components/ui/button';
import Link from 'next/link';

export default function MessagesEmptyState({role = 'USER'}: {role?: 'USER' | 'SELLER'}) {
  const isClient = role === 'USER';

  return (
    <div className="flex h-[80vh] border rounded-xl overflow-hidden">
      <aside className="hidden lg:block w-72 border-r bg-muted/30" />

      <div className="flex flex-1 items-center justify-center px-6">
        <div className="max-w-md text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            {isClient ? (
              <MessageSquare className="h-7 w-7 text-muted-foreground" />
            ) : (
              <Briefcase className="h-7 w-7 text-muted-foreground" />
            )}
          </div>

          <h2 className="text-lg font-semibold">
            {isClient ? 'No conversations yet' : 'No active orders'}
          </h2>

          <p className="text-sm text-muted-foreground">
            {isClient
              ? 'Once you book a service, your conversations with freelancers will appear here.'
              : 'When a client books your service, messages will show up here automatically.'}
          </p>

          <Button className="mt-2" asChild>
            <Link href={isClient ? '/explore' : '/dashboard/freelancer/create-service'}>
              {isClient ? 'Browse services' : 'Create a gig'}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
