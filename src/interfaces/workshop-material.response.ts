export type MaterialMovementReason =
  | "compra"
  | "uso_job"
  | "devolucion"
  | "ajuste_inventario"
  | "otro";

export interface WorkshopMaterialResponse {
  id: string;
  name: string;
  description?: string | null;
  unit: string;
  currentStock: number;
  minStock: number;
  unitPrice?: number | null;
  categoryId?: string | null;
  supplierId?: string | null;
  imagePublicId?: string | null;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkshopMaterialCreate {
  name: string;
  unit: string;
  description?: string;
  minStock?: number;
  unitPrice?: number;
  categoryId?: string;
  supplierId?: string;
}

export interface WorkshopMaterialUpdate {
  name?: string;
  description?: string | null;
  unit?: string;
  minStock?: number;
  unitPrice?: number | null;
  categoryId?: string | null;
  supplierId?: string | null;
}

export interface RegisterMaterialMovementDto {
  delta: number;
  reason: MaterialMovementReason;
  jobId?: string;
  notes?: string;
}

export interface MaterialMovementDto {
  id: string;
  materialId: string;
  delta: number;
  reason: MaterialMovementReason;
  jobId?: string | null;
  notes?: string | null;
  createdBy: string;
  createdAt: string;
}
