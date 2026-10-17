export interface HomeLocation {
  city: string;
  state?: string;
  country?: string;
}

export interface HomeBanner {
  id: string;
  title: string;
  subtext: string;
  imageUrl: string;
  actionRoute: string;
  accentColor?: string;
}

export interface HomeServiceCard {
  id: string;
  badge: string;
  actionLabel: string;
  imageUrl: string;
  theme: 'teal' | 'navy';
  route: string;
}

export interface TopRatedFabric {
  id: string;
  name: string;
  subtitle: string;
  rating: number;
  imageUrl: string;
  startingPrice?: number;
  material?: string;
  reviewCount?: number;
  tag?: string;
  colors?: string[];
}

export interface TopRatedTailor {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  distance: string;
  imageUrl: string;
  availability?: string;
  location?: string;
  reviewCount?: number;
  startingPrice?: number;
  badge?: string;
}

export interface ArticleItem {
  id: string;
  name: string;
  imageUrl: string;
  category?: string;
  startingPrice?: number;
}

export interface HomeData {
  location: HomeLocation;
  searchPlaceholder: string;
  articles?: ArticleItem[];
  banners: HomeBanner[];
  services: HomeServiceCard[];
  topRatedFabrics: TopRatedFabric[];
  topRatedTailors: TopRatedTailor[];
}
