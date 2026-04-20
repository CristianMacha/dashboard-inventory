export interface SlabStatusCount {
  available: number;
  reserved: number;
  sold: number;
  returning: number;
  returned: number;
}

export interface ProductInventorySummary {
  productId: string;
  productName: string;
  bundleCount: number;
  totalSlabs: number;
  slabsByStatus: SlabStatusCount;
  availableAreaM2: number;
  totalAreaM2: number;
}

export interface InventorySummaryResponse {
  products: ProductInventorySummary[];
  totalProducts: number;
  totalBundles: number;
  totalSlabs: number;
  totalAvailableAreaM2: number;
}
