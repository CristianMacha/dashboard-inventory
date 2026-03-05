import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QueryErrorProps {
  onRetry?: () => void;
}

export const QueryError = ({ onRetry }: QueryErrorProps) => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 py-12 text-center">
    <AlertCircle className="size-8 text-destructive" />
    <div>
      <p className="font-medium text-sm">Failed to load data</p>
      <p className="text-xs text-muted-foreground mt-0.5">
        Something went wrong. Please try again.
      </p>
    </div>
    {onRetry && (
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RefreshCw className="size-3.5" />
        Retry
      </Button>
    )}
  </div>
);
