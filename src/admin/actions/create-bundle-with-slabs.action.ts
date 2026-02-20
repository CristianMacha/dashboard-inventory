import { apiClient } from "@/api/apiClient";
import type {
  BundleWithSlabsCreate,
  BundleResponse,
} from "@/interfaces/bundle.response";

export const createBundleWithSlabsAction = async (
  bundle: BundleWithSlabsCreate,
): Promise<BundleResponse> => {
  const { data } = await apiClient.post<BundleResponse>(
    "/bundles/with-slabs",
    bundle,
  );
  return data;
};
