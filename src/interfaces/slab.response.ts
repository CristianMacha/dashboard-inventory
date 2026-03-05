export type SlabStatus = "AVAILABLE" | "RESERVED" | "SOLD" | "RETURNED";

export interface SlabResponse {
  id: string;
  bundleId: string;
  code: string;
  widthCm: number;
  heightCm: number;
  dimensions: string;
  status: SlabStatus;
  description?: string;
  isRemnant: boolean;
  parentSlabId?: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface RemnantSlabCreate {
  code: string;
  widthCm: number;
  heightCm: number;
  description?: string;
}

export interface SlabCreate {
  bundleId: string;
  code: string;
  widthCm: number;
  heightCm: number;
  description?: string;
}

export interface SlabUpdate {
  status?: SlabStatus;
  description?: string;
}
