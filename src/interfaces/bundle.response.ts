export interface BundleResponse {
  id: string;
  productId: string;
  productName: string;
  supplierId: string;
  supplierName: string;
  purchaseInvoiceId: string | null;
  invoiceNumber: string | null;
  imagePublicId: string | null;
  lotNumber?: string;
  thicknessCm?: number;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface BundleCreate {
  productId: string;
  supplierId?: string;
  purchaseInvoiceId?: string;
  lotNumber?: string;
  thicknessCm?: number;
}

export interface SlabInBundle {
  code: string;
  widthCm: number;
  heightCm: number;
  description?: string;
}

export interface BundleWithSlabsCreate extends BundleCreate {
  slabs: SlabInBundle[];
}

export interface SlabInBundleDetail {
  id: string;
  bundleId: string;
  code: string;
  widthCm: number;
  heightCm: number;
  dimensions: string;
  status: "AVAILABLE" | "RESERVED" | "SOLD" | "RETURNED";
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BundleDetailResponse extends BundleResponse {
  slabs: SlabInBundleDetail[];
}

export interface BundleUpdate {
  lotNumber?: string;
  thicknessCm?: number;
}
