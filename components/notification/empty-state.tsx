import {Bell} from 'lucide-react';

export function EmptyState() {
  return (
    <div className="text-center py-20 text-muted-foreground">
      <Bell className="h-10 w-10 mx-auto mb-3 opacity-50" />
      <p className="font-medium">No notifications yet</p>
      <p className="text-sm">You’re all caught up.</p>
    </div>
  );
}
