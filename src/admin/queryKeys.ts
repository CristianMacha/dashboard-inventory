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
};

export const categoryKeys = {
  all: ["categories"] as const,
};

export const brandKeys = {
  all: ["brands"] as const,
};

export const levelKeys = {
  all: ["levels"] as const,
};

export const finishKeys = {
  all: ["finishes"] as const,
};

export const supplierKeys = {
  all: ["suppliers"] as const,
};

export const summaryKeys = {
  all: ["summary"] as const,
};

export const bundleKeys = {
  all: ["bundles"] as const,
  lists: () => [...bundleKeys.all, "list"] as const,
  list: (params: { page: number; limit: number }) =>
    [...bundleKeys.lists(), params] as const,
};

export const slabKeys = {
  all: ["slabs"] as const,
  lists: () => [...slabKeys.all, "list"] as const,
  list: (params: { page: number; limit: number; bundleId?: string }) =>
    [...slabKeys.lists(), params] as const,
};
