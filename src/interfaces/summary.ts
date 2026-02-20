export interface IMetricsResponse {
  totalProducts: number;
  totalBrands: number;
  totalCategories: number;
  totalBundles: number;
  totalSlabs: number;
}

export interface ISummaryResponse {
  metrics: IMetricsResponse;
}
