export interface ProductImage {
  id: number;
  url: string;
  sortOrder: number;
}

export interface Product {
  id: number;
  uuid: string;
  sku: string;
  slug: string;
  nameAr: string;
  nameFr: string;
  nameEn: string;
  descAr: string | null;
  descFr: string | null;
  descEn: string | null;
  category: string | null;
  price: string; // Decimal serialized as string
  stock: number;
  active: boolean;
  images: ProductImage[];
}

export interface ProductListMeta {
  total: number;
  page: number;
  limit: number;
}

export interface ProductListResponse {
  data: Product[];
  meta: ProductListMeta;
}

export interface ProductResponse {
  data: Product;
}

export type SortOption = 'default' | 'price_asc' | 'price_desc';
