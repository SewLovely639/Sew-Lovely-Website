export type Product = {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  image: string;
  imageAlt: string;
  badge?: string;
};

export type Collection = {
  name: string;
  description: string;
  image: string;
  imageAlt: string;
  priceFrom: number;
};
