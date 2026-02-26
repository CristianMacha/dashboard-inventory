export interface InventoryMetrics {
  totalProducts: number;
  totalBrands: number;
  totalCategories: number;
  totalBundles: number;
  totalSlabs: number;
}

export interface ProjectsMetrics {
  totalJobs: number;
}

export interface PurchasingMetrics {
  totalPurchaseInvoices: number;
}

export interface ISummaryResponse {
  inventory: InventoryMetrics;
  projects: ProjectsMetrics;
  purchasing: PurchasingMetrics;
}
