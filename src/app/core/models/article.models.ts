export interface ArticleMaterial {
  id: string;
  name: string;
  imageUrl: string;
  description?: string;
}

export interface ArticleFabricItem {
  id: string;
  name: string;
  material: string;
  imageUrl: string;
  price?: number;
  rating?: number;
  tag?: string;
  description?: string;
}

export interface ArticlePromoBanner {
  id: string;
  title: string;
  subtext?: string;
  imageUrl: string;
  actionRoute?: string;
}

export interface ArticleDetail {
  id: string;
  name: string;
  imageUrl: string;
  category: string;
  startingPrice?: number;
  materials: ArticleMaterial[];
  banner?: ArticlePromoBanner;
  fabrics: ArticleFabricItem[];
}
