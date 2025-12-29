export type NotificationType = 'ORDER' | 'MESSAGE' | 'REVIEW' | 'AUTOMATED';

export type Notification = {
  id: string;
  userId: string;
  title: string;
  link: string | null;
  read: boolean;
  type: NotificationType;
  createdAt: Date;
};
