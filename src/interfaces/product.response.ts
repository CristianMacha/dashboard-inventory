export interface ProductRelation {
  id: string;
  name: string;
}

export interface ProductImageResponse {
  id: string;
  publicId: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductResponse {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  brand?: ProductRelation;
  category?: ProductRelation;
  level?: ProductRelation;
  finish?: ProductRelation;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SlabInDetail {
  id: string;
  bundleId: string;
  code: string;
  widthCm: number;
  heightCm: number;
  dimensions: string;
  status: "AVAILABLE" | "RESERVED" | "SOLD";
  description?: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface BundleInDetail {
  id: string;
  supplierId: string;
  supplierName: string;
  lotNumber?: string;
  thicknessCm?: number;
  slabs: SlabInDetail[];
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductDetailResponse extends ProductResponse {
  bundles: BundleInDetail[];
  images: ProductImageResponse[];
}
