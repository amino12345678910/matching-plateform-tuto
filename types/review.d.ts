export type Review = {
  id: string;
  rating: number;
  comment: string;

  clientId: string;
  serviceId: string;
  client?: {id: string; name: string; avatar?: string; imageSource: User['imageSource']};
  service?: {slug: string; title: string};
  updatedAt: Date;
  createdAt: Date;
};
