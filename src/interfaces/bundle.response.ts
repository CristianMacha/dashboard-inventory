export interface BundleResponse {
  id: string;
  productId: string;
  productName: string;
  supplierId: string;
  supplierName: string;
  lotNumber?: string;
  thicknessCm?: number;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface BundleCreate {
  productId: string;
  supplierId: string;
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

export interface BundleUpdate {
  lotNumber?: string;
  thicknessCm?: number;
}
