export interface ProductImage {
  uuid: string;
  url: string;
  position: number;
}

export interface Product {
  uuid: string;
  slug: string;
  nameFr: string;
  nameAr: string;
  nameEn: string;
  descriptionFr?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  category?: string;
  images: ProductImage[];
}

export interface ListProductsResponse {
  data: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface FetchProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export interface CreateProductData {
  nameFr: string;
  nameAr?: string;
  nameEn?: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  category?: string;
  descriptionFr?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  isActive?: boolean;
  isFeatured?: boolean;
}

export type UpdateProductData = Partial<CreateProductData>;
