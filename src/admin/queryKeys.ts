export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (params: {
    page: number;
    limit: number;
    search?: string;
    brandId?: string | string[];
    categoryId?: string | string[];
  }) => [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  fullDetails: () => [...productKeys.all, "full-detail"] as const,
  fullDetail: (id: string) => [...productKeys.fullDetails(), id] as const,
};

export const categoryKeys = {
  all: ["categories"] as const,
  active: ["categories", "active"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: () => [...categoryKeys.lists()] as const,
};

export const brandKeys = {
  all: ["brands"] as const,
  active: ["brands", "active"] as const,
  lists: () => [...brandKeys.all, "list"] as const,
  list: () => [...brandKeys.lists()] as const,
};

export const levelKeys = {
  all: ["levels"] as const,
  active: ["levels", "active"] as const,
  lists: () => [...levelKeys.all, "list"] as const,
  list: () => [...levelKeys.lists()] as const,
};

export const finishKeys = {
  all: ["finishes"] as const,
  active: ["finishes", "active"] as const,
  lists: () => [...finishKeys.all, "list"] as const,
  list: () => [...finishKeys.lists()] as const,
};

export const supplierKeys = {
  all: ["suppliers"] as const,
  active: ["suppliers", "active"] as const,
  lists: () => [...supplierKeys.all, "list"] as const,
  list: () => [...supplierKeys.lists()] as const,
};

export const summaryKeys = {
  all: ["summary"] as const,
};

export const bundleKeys = {
  all: ["bundles"] as const,
  lists: () => [...bundleKeys.all, "list"] as const,
  list: (params: { page: number; limit: number }) =>
    [...bundleKeys.lists(), params] as const,
  details: () => [...bundleKeys.all, "detail"] as const,
  detail: (id: string) => [...bundleKeys.details(), id] as const,
};

export const slabKeys = {
  all: ["slabs"] as const,
  lists: () => [...slabKeys.all, "list"] as const,
  list: (params: { page: number; limit: number; bundleId?: string }) =>
    [...slabKeys.lists(), params] as const,
  details: () => [...slabKeys.all, "detail"] as const,
  detail: (id: string) => [...slabKeys.details(), id] as const,
};

export const purchaseInvoiceKeys = {
  all: ["purchase-invoices"] as const,
  selects: () => [...purchaseInvoiceKeys.all, "select"] as const,
  select: (params: { supplierId?: string; status?: string }) =>
    [...purchaseInvoiceKeys.selects(), params] as const,
  lists: () => [...purchaseInvoiceKeys.all, "list"] as const,
  list: (params: {
    page: number;
    limit: number;
    search?: string;
    supplierId?: string;
    status?: string;
  }) => [...purchaseInvoiceKeys.lists(), params] as const,
  details: () => [...purchaseInvoiceKeys.all, "detail"] as const,
  detail: (id: string) => [...purchaseInvoiceKeys.details(), id] as const,
};

export const jobKeys = {
  all: ["jobs"] as const,
  lists: () => [...jobKeys.all, "list"] as const,
  list: (params: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
  }) => [...jobKeys.lists(), params] as const,
  details: () => [...jobKeys.all, "detail"] as const,
  detail: (id: string) => [...jobKeys.details(), id] as const,
};

export const supplierReturnKeys = {
  all: ["supplier-returns"] as const,
  lists: () => [...supplierReturnKeys.all, "list"] as const,
  list: (params: {
    page: number;
    limit: number;
    supplierId?: string;
    status?: string;
    purchaseInvoiceId?: string;
  }) => [...supplierReturnKeys.lists(), params] as const,
  details: () => [...supplierReturnKeys.all, "detail"] as const,
  detail: (id: string) => [...supplierReturnKeys.details(), id] as const,
};
