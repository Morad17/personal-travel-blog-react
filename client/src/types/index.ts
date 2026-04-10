export interface CountryVisit {
  id: string;
  date: string;
  cities: string[];
}

export interface Country {
  id: string;
  name: string;
  slug: string;
  isoCode: string;
  flagEmoji: string;
  coverImageId: string | null;
  coverImageUrl: string | null;
  featured: boolean;
  visits: CountryVisit[];
  createdAt: string;
  updatedAt: string;
  _count?: { posts: number };
}

export interface PostMedia {
  id: string;
  publicId: string;
  secureUrl: string;
  resourceType: 'image' | 'video';
  caption: string | null;
  order: number;
  postId: string;
  createdAt: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageId: string | null;
  coverImageUrl: string | null;
  readTime: number;
  published: boolean;
  featured: boolean;
  tags: string[];
  countryId: string;
  country: Country;
  mediaItems?: PostMedia[];
  createdAt: string;
  updatedAt: string;
}

export interface GalleryItem {
  id: string;
  publicId: string;
  secureUrl: string;
  thumbnailUrl: string;
  resourceType: 'image' | 'video';
  width: number | null;
  height: number | null;
  caption: string | null;
  tags: string[];
  countryId: string | null;
  country?: Pick<Country, 'name' | 'slug' | 'flagEmoji'> | null;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface MapCountryVisit {
  date: string;
  cities: string[];
}

export interface MapCountry {
  isoCode: string;
  name: string;
  slug: string;
  flagEmoji: string;
  coverImageUrl: string | null;
  visitedAt: string | null;
  visits: MapCountryVisit[];
  postCount: number;
}

export interface PaginatedResponse<T> {
  items?: T[];
  posts?: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiError {
  error: string;
  message?: string;
}
