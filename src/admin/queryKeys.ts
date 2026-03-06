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
  list: (params: { page: number; limit: number; productId?: string }) =>
    [...bundleKeys.lists(), params] as const,
  details: () => [...bundleKeys.all, "detail"] as const,
  detail: (id: string) => [...bundleKeys.details(), id] as const,
};

export const productSelectKeys = {
  all: ["products", "select"] as const,
};

export const supplierReturnSelectKeys = {
  all: ["supplier-returns-select"] as const,
  list: (params: { supplierId?: string; purchaseInvoiceId?: string; status?: string }) =>
    [...supplierReturnSelectKeys.all, params] as const,
};

export const slabKeys = {
  all: ["slabs"] as const,
  lists: () => [...slabKeys.all, "list"] as const,
  list: (params: { page: number; limit: number; bundleId?: string; status?: string; search?: string; isRemnant?: boolean }) =>
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

export const invoicePaymentKeys = {
  all: ["invoice-payments"] as const,
  lists: () => [...invoicePaymentKeys.all, "list"] as const,
  list: (params: {
    invoiceId?: string;
    paymentMethod?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
  }) => [...invoicePaymentKeys.lists(), params] as const,
  byInvoice: (invoiceId: string) =>
    [...invoicePaymentKeys.all, "invoice", invoiceId] as const,
};

export const jobPaymentKeys = {
  all: ["job-payments"] as const,
  lists: () => [...jobPaymentKeys.all, "list"] as const,
  list: (params: {
    jobId?: string;
    paymentMethod?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
  }) => [...jobPaymentKeys.lists(), params] as const,
  byJob: (jobId: string) => [...jobPaymentKeys.all, "job", jobId] as const,
};

export const generalPaymentKeys = {
  all: ["general-payments"] as const,
  lists: () => [...generalPaymentKeys.all, "list"] as const,
  list: (params: {
    type?: string;
    category?: string;
    paymentMethod?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
  }) => [...generalPaymentKeys.lists(), params] as const,
};

export const cashflowKeys = {
  all: ["cashflow"] as const,
  summary: (params: { fromDate?: string; toDate?: string }) =>
    [...cashflowKeys.all, params] as const,
};

export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (params: { page: number; limit: number; search?: string; roleId?: string }) =>
    [...userKeys.lists(), params] as const,
};

export const roleKeys = {
  all: ["roles"] as const,
  lists: () => [...roleKeys.all, "list"] as const,
  list: (params: { page: number; limit: number; search?: string }) =>
    [...roleKeys.lists(), params] as const,
};

export const permissionKeys = {
  all: ["permissions"] as const,
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
