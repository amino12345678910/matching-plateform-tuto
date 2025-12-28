export type Review = {
  id: string;
  rating: number;
  comment: string;

  clientId: string;
  serviceId: string;
  client?: {id: string; name: string; avatar?: string; imageSource: User['imageSource']};
  updatedAt: Date;
  createdAt: Date;
};
