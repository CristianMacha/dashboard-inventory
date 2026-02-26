export type PurchaseInvoiceStatus =
  | "DRAFT"
  | "RECEIVED"
  | "PARTIALLY_PAID"
  | "PAID"
  | "CANCELLED";

export type InvoiceItemConcept =
  | "MATERIAL"
  | "FREIGHT"
  | "CUSTOMS"
  | "ADJUSTMENT"
  | "OTHER";

export interface PurchaseInvoiceItem {
  id: string;
  bundleId: string;
  concept: InvoiceItemConcept;
  description?: string;
  unitCost: number;
  quantity: number;
  totalCost: number;
}

export interface PurchaseInvoiceResponse {
  id: string;
  invoiceNumber: string;
  supplierId: string;
  invoiceDate: string;
  dueDate?: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  status: PurchaseInvoiceStatus;
  notes?: string;
  itemCount: number;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseInvoiceDetailResponse extends PurchaseInvoiceResponse {
  items: PurchaseInvoiceItem[];
}

export interface PurchaseInvoiceCreate {
  invoiceNumber: string;
  supplierId: string;
  invoiceDate: string;
  dueDate?: string;
  notes?: string;
}

export interface InvoiceItemCreate {
  bundleId: string;
  concept: InvoiceItemConcept;
  description?: string;
  unitCost: number;
  quantity: number;
}

export interface PurchaseInvoiceSelectResponse {
  id: string;
  invoiceNumber: string;
  supplierId: string;
  invoiceDate: string;
  status: PurchaseInvoiceStatus;
}

export interface BundleCostBreakdown {
  concept: InvoiceItemConcept;
  total: number;
}

export interface BundleCostResponse {
  bundleId: string;
  totalCost: number;
  breakdown: BundleCostBreakdown[];
}
