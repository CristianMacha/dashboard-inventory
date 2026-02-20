import type { LucideIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";

interface SummaryInformationProps {
  title: string;
  value: number;
  icon?: LucideIcon;
  iconColor?: string;
  iconBg?: string;
}

export const SummaryInformation = ({
  title,
  value,
  icon: Icon,
  iconColor = "text-primary",
  iconBg = "bg-primary/10",
}: SummaryInformationProps) => {
  return (
    <Card className="shadow-none">
      <CardContent className="pt-5 pb-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <CardDescription className="text-xs">{title}</CardDescription>
            <CardTitle className="text-2xl font-bold tabular-nums">
              {value}
            </CardTitle>
          </div>
          {Icon && (
            <div
              className={`inline-flex size-9 shrink-0 items-center justify-center rounded-lg ${iconBg}`}
            >
              <Icon className={`size-4 ${iconColor}`} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
