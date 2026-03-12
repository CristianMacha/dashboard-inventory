export type WorkshopToolStatus = "available" | "in_use" | "in_repair" | "retired";

export interface ChangeToolStatusDto {
  newStatus: WorkshopToolStatus;
  jobId?: string;
  notes?: string;
}

export interface ToolMovementDto {
  id: string;
  toolId: string;
  previousStatus: WorkshopToolStatus;
  newStatus: WorkshopToolStatus;
  jobId?: string | null;
  notes?: string | null;
  createdBy: string;
  createdAt: string;
}

export interface WorkshopToolResponse {
  id: string;
  name: string;
  description?: string | null;
  status: WorkshopToolStatus;
  categoryId?: string | null;
  supplierId?: string | null;
  imagePublicId?: string | null;
  purchasePrice?: number | null;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkshopToolCreate {
  name: string;
  description?: string;
  categoryId?: string;
  supplierId?: string;
  purchasePrice?: number;
}

export interface WorkshopToolUpdate {
  name?: string;
  description?: string | null;
  categoryId?: string | null;
  supplierId?: string | null;
  purchasePrice?: number | null;
}
