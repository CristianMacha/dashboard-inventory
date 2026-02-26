export type JobStatus =
  | "QUOTED"
  | "APPROVED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export interface JobItem {
  id: string;
  slabId: string;
  description?: string;
  unitPrice: number;
  totalPrice: number;
}

export interface JobResponse {
  id: string;
  projectName: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  clientAddress?: string;
  status: JobStatus;
  scheduledDate?: string;
  completedDate?: string;
  notes?: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  itemCount: number;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobDetailResponse extends JobResponse {
  items: JobItem[];
}

export interface JobCreate {
  projectName: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  clientAddress?: string;
  notes?: string;
  scheduledDate?: string;
}

export interface JobItemCreate {
  slabId: string;
  description?: string;
  unitPrice: number;
}
