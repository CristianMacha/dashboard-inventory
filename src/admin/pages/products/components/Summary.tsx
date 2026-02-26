import { useQuery } from "@tanstack/react-query";
import { Package, Boxes, Box } from "lucide-react";
import { SummaryInformation } from "./Summary-information";
import { getSummaryAction } from "@/admin/actions/get-summary.action";
import { summaryKeys } from "@/admin/queryKeys";

export const Summary = () => {
  const { data } = useQuery({
    queryKey: summaryKeys.all,
    queryFn: getSummaryAction,
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <SummaryInformation
        title="Total Products"
        value={data?.inventory.totalProducts ?? 0}
        icon={Package}
        iconColor="text-blue-600"
        iconBg="bg-blue-50 dark:bg-blue-950/30"
      />
      <SummaryInformation
        title="Total Bundles"
        value={data?.inventory.totalBundles ?? 0}
        icon={Boxes}
        iconColor="text-violet-600"
        iconBg="bg-violet-50 dark:bg-violet-950/30"
      />
      <SummaryInformation
        title="Total Slabs"
        value={data?.inventory.totalSlabs ?? 0}
        icon={Box}
        iconColor="text-amber-600"
        iconBg="bg-amber-50 dark:bg-amber-950/30"
      />
    </div>
  );
};
