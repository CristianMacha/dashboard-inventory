import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface RejectRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
  isPending: boolean;
}

export const RejectRequestDialog = ({
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: RejectRequestDialogProps) => {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    if (!reason.trim()) return;
    onConfirm(reason.trim());
  };

  const handleOpenChange = (value: boolean) => {
    if (!isPending) {
      setReason("");
      onOpenChange(value);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="overflow-hidden gap-0">
        <SheetHeader className="border-b">
          <SheetTitle>Reject Request</SheetTitle>
          <SheetDescription>
            Provide a reason for rejecting this request.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="rejection-reason">Rejection Reason</Label>
            <Textarea
              id="rejection-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this request is being rejected…"
              className="min-h-[100px] resize-y"
              disabled={isPending}
            />
          </div>
        </div>
        <SheetFooter className="flex-row justify-end border-t">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isPending || !reason.trim()}
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            {isPending ? "Rejecting…" : "Reject"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
