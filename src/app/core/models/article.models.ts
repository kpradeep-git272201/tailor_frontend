export interface FabricCategoryItem {
  id: string;
  fabricId?: string;
  name: string;
  fabricCategoryName?: string;
  imagePath?: string;
  imageUrl?: string;
  fabricCategoryImagePath?: string;
  pricePerMeter?: number;
  description?: string;
  selected?: boolean;
  isTrending?: boolean;
  isFeatured?: boolean;
  isDefault?: boolean;
  isVisible?: boolean;
}

export type ArticleMaterial = FabricCategoryItem;

export interface ArticleFabricItem {
  id: string;
  fabricId?: string;
  name: string;
  fabricName?: string;
  categoryName?: string;
  material: string;
  fabricCategory?: string;
  imagePath?: string;
  imageUrl?: string;
  price?: number;
  pricePerMeter?: number;
  rating?: number;
  isTrending?: boolean;
  isFeatured?: boolean;
  tag?: string;
  description?: string;
}

export interface ArticleFabricMapping {
  articleId: string;
  fabricIds: string[];
}

export interface ArticlePromoBanner {
  id: string;
  title: string;
  subtext?: string;
  imagePath?: string;
  imageUrl?: string;
  actionRoute?: string;
}

export interface ArticleDetail {
  id: string;
  articleId?: string;
  name: string;
  imagePath?: string;
  imageUrl?: string;
  category: string;
  startingPrice?: number;
  fabricIds?: string[];
  materials: FabricCategoryItem[];
  fabricCategory?: FabricCategoryItem[];
  banner?: ArticlePromoBanner;
  fabrics: ArticleFabricItem[];
  articlesCategories?: ArticleFabricItem[];
}
