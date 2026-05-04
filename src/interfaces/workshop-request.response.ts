export type WorkshopRequestType = "tool" | "material";
export type WorkshopRequestPriority = "normal" | "urgent";
export type WorkshopRequestStatus = "pending" | "approved" | "rejected";

export interface WorkshopRequestDto {
  id: string;
  requestType: WorkshopRequestType;
  itemId: string;
  quantity: number | null;
  jobId: string | null;
  priority: WorkshopRequestPriority;
  status: WorkshopRequestStatus;
  notes: string | null;
  requestedBy: string;
  resolvedBy: string | null;
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
