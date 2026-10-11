export type Product = {
  title: string;
  reviews: number;
  price: number;
  discountedPrice: number;
  id: number;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
  category?: string;
  material?: string;
  badge?: string;
  rating?: number;
  inStock?: boolean;
  isBespoke?: boolean;
  isPreorder?: boolean;
  description?: string;
};
