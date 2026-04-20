export interface ProductSupplierResponse {
  id: string;
  supplierId: string;
  supplierName: string;
  supplierAbbreviation?: string | null;
  isPrimary: boolean;
}
