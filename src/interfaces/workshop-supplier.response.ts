export interface WorkshopSupplierResponse {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkshopSupplierCreate {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export interface WorkshopSupplierUpdate {
  name?: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  isActive?: boolean;
}
