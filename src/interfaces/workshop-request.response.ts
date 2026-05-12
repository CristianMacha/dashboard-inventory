export interface WorkshopItemSelectDto {
  id: string;
  name: string;
}

export type WorkshopRequestType = "tool" | "material";
export type WorkshopRequestPriority = "normal" | "urgent";
export type WorkshopRequestStatus = "pending" | "approved" | "rejected" | "delivered";

export interface WorkshopRequestDto {
  id: string;
  requestType: WorkshopRequestType;
  itemId: string;
  itemName: string;
  quantity: number | null;
  jobId: string | null;
  priority: WorkshopRequestPriority;
  status: WorkshopRequestStatus;
  notes: string | null;
  requestedBy: string;
  requestedByName: string;
  resolvedBy: string | null;
  resolvedByName: string | null;
  resolvedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkshopRequestBody {
  requestType: WorkshopRequestType;
  itemId: string;
  quantity?: number;
  jobId?: string;
  priority?: WorkshopRequestPriority;
  notes?: string;
}

export interface RejectWorkshopRequestBody {
  rejectionReason: string;
}

export interface MaterialBelowMinStockDto {
  materialId: string;
  materialName: string;
  unit: string;
  currentStock: number;
  minStock: number;
  deficit: number;
  supplierId: string | null;
}

export interface UnfulfilledRequestDto {
  requestId: string;
  requestedQuantity: number;
  availableStock: number;
  shortfall: number;
  priority: WorkshopRequestPriority;
  requestedBy: string;
  requestedByName: string;
  createdAt: string;
}

export interface ApprovedRequestStockGapDto {
  materialId: string;
  materialName: string;
  unit: string;
  totalShortfall: number;
  unfulfilledRequests: UnfulfilledRequestDto[];
}

export interface ToolInRepairDto {
  toolId: string;
  toolName: string;
  categoryId: string | null;
}

export interface ProcurementNeedsDto {
  materialsBelowMinStock: MaterialBelowMinStockDto[];
  approvedRequestsWithInsufficientStock: ApprovedRequestStockGapDto[];
  toolsInRepair: ToolInRepairDto[];
}
