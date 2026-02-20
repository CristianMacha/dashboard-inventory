import { Loader2 } from "lucide-react";

export const CustomFullScreenLoading = () => {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-12 w-12 animate-spin" />
        <p>Please wait...</p>
      </div>
    </div>
  );
};