export type SupplierReturnStatus = "DRAFT" | "SENT" | "CREDITED" | "CANCELLED";

export type ReturnItemReason = "DEFECTIVE" | "BROKEN" | "WRONG_ITEM" | "OTHER";

export interface SupplierReturnItem {
  id: string;
  supplierReturnId: string;
  slabId: string;
  bundleId: string;
  reason: ReturnItemReason;
  description?: string;
  unitCost: number;
  totalCost: number;
}

export interface SupplierReturnResponse {
  id: string;
  purchaseInvoiceId: string;
  supplierId: string;
  supplierName: string;
  invoiceNumber: string;
  returnDate: string;
  status: SupplierReturnStatus;
  notes?: string;
  creditAmount: number;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierReturnDetailResponse extends SupplierReturnResponse {
  items: SupplierReturnItem[];
}

export interface SupplierReturnCreate {
  purchaseInvoiceId: string;
  supplierId: string;
  returnDate: string;
  notes?: string;
}

export interface SupplierReturnSelectResponse {
  id: string;
  supplierId: string;
  purchaseInvoiceId: string;
  returnDate: string;
  status: SupplierReturnStatus;
  creditAmount: number;
}

export interface ReturnItemCreate {
  slabId: string;
  bundleId: string;
  reason: ReturnItemReason;
  description?: string;
  unitCost: number;
}
