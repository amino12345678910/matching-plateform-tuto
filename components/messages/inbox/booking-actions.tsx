import type {Booking} from '@/app/(shared)/dashboard/messages/page';
import {Button} from '@/components/ui/button';

export function BookingActionCard({
  status,
  role,
  onAction,
}: {
  status: Booking['status'];
  role: 'SELLER' | 'USER';
  onAction: (action: string) => void;
}) {
  if (role === 'SELLER' && status === 'PENDING') {
    return (
      <ActionCard
        title="New order request"
        actions={[
          {label: 'Accept Order', action: 'CONFIRM'},
          {label: 'Decline', action: 'CANCEL', destructive: true},
        ]}
        onAction={onAction}
      />
    );
  }

  if (role === 'SELLER' && status === 'CONFIRMED') {
    return (
      <ActionCard
        title="Work in progress"
        actions={[{label: 'Submit Delivery', action: 'DELIVER'}]}
        onAction={onAction}
      />
    );
  }

  if (role === 'USER' && status === 'DELIVERED') {
    return (
      <ActionCard
        title="Delivery received"
        actions={[
          {label: 'Accept & Complete', action: 'ACCEPT'},
          {
            label: 'Request Revision',
            action: 'DISPUTE',
            destructive: true,
          },
        ]}
        onAction={onAction}
      />
    );
  }

  return null;
}

function ActionCard({
  title,
  actions,
  onAction,
}: {
  title: string;
  actions: {
    label: string;
    action: string;
    destructive?: boolean;
  }[];
  onAction: (action: string) => void;
}) {
  return (
    <div className="border rounded-lg p-4 bg-muted/30 space-y-3">
      <p className="font-medium text-sm">{title}</p>
      <div className="flex gap-2">
        {actions.map(a => (
          <Button
            key={a.action}
            variant={a.destructive ? 'destructive' : 'default'}
            onClick={() => onAction(a.action)}
            className="cursor-pointer"
          >
            {a.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
