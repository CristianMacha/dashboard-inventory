export type WorkshopPurchaseOrderStatus = "DRAFT" | "SENT" | "RECEIVED" | "CANCELLED";

export interface WorkshopPurchaseOrderItemDto {
  materialId: string;
  materialName: string;
  purchaseQuantity: number;
  requestedQuantity: number;
  unitCost: number;
  totalCost: number;
}

export interface WorkshopPurchaseOrderDto {
  id: string;
  supplierId: string;
  supplierName: string;
  status: WorkshopPurchaseOrderStatus;
  items: WorkshopPurchaseOrderItemDto[];
  notes: string | null;
  totalAmount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePurchaseOrderItemBody {
  materialId: string;
  materialName: string;
  purchaseQuantity: number;
  requestedQuantity: number;
  unitCost: number;
}

export interface CreateWorkshopPurchaseOrderBody {
  supplierId: string;
  items: CreatePurchaseOrderItemBody[];
  notes?: string;
}
