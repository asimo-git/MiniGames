export interface CreateElementOptions {
  className?: string;
  textContent?: string;
  attributes?: Record<string, string>;
  children?: Node[];
}

export interface Game {
  slug: string;
  name: string;
  category: string;
  price: string;
  shortDescription: string;
  rating: number;
  likesCount: number;
  cardImage: string;
  featured: boolean;
}
