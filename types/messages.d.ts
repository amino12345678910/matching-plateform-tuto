export type MessageType = {
  AUTOMATED;
  NORMAL;
  FILE;
};
export type Message = {
  id: string;
  roomId: string;
  senderId: string;
  text: string;
  contentType: MessageType | string;
  linkedUrls: string[] | [];
  createdAt: Date;
};
