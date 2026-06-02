import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { WorkshopRequestDto } from "@/interfaces/workshop-request.response";

interface ApproveRequestDialogProps {
  request: WorkshopRequestDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (approvedQuantity?: number) => void;
  isPending: boolean;
}

export const ApproveRequestDialog = ({
  request,
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: ApproveRequestDialogProps) => {
  const [quantityStr, setQuantityStr] = useState("");

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuantityStr(request?.quantity?.toString() ?? "");
  }, [open, request?.quantity]);

  const isMaterial = request?.requestType === "material";
  const parsedQty = quantityStr.trim() !== "" ? Number(quantityStr) : undefined;
  const isValidQty = parsedQty == null || (Number.isFinite(parsedQty) && parsedQty > 0);

  const handleConfirm = () => {
    if (!isValidQty) return;
    onConfirm(isMaterial ? parsedQty : undefined);
  };

  const handleOpenChange = (value: boolean) => {
    if (!isPending) onOpenChange(value);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="overflow-hidden gap-0">
        <SheetHeader className="border-b">
          <SheetTitle>Approve Request</SheetTitle>
          <SheetDescription>
            {isMaterial
              ? "Optionally adjust the approved quantity before confirming."
              : "Confirm approval of this tool request."}
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-4">
          {request && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1 text-sm">
                <span className="text-muted-foreground">Item</span>
                <span className="font-medium">{request.itemName}</span>
              </div>
              {isMaterial && (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="approved-quantity">Approved Quantity</Label>
                  <Input
                    id="approved-quantity"
                    type="number"
                    min={1}
                    value={quantityStr}
                    onChange={(e) => setQuantityStr(e.target.value)}
                    placeholder={request.quantity?.toString() ?? "—"}
                    disabled={isPending}
                  />
                  {!isValidQty && (
                    <p className="text-xs text-destructive">Must be a positive number.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        <SheetFooter className="flex-row justify-end border-t">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isPending || !isValidQty}>
            {isPending && <Loader2 className="size-4 animate-spin" />}
            {isPending ? "Approving…" : "Approve"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
