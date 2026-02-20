import { useMenusStore } from "@/auth/store/menus.store";
import { useAuthStore } from "@/auth/store/auth.store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RefreshCwIcon } from "lucide-react";

type MenusErrorScreenVariant = "error" | "empty";

const messages: Record<
  MenusErrorScreenVariant,
  { title: string; description: string }
> = {
  error: {
    title: "Could not load navigation",
    description:
      "The menu could not be loaded. Check your connection and try again.",
  },
  empty: {
    title: "No sections assigned",
    description:
      "Your account does not have access to any sections. Contact your administrator if you think this is an error.",
  },
};

type MenusErrorScreenProps = {
  variant?: MenusErrorScreenVariant;
};

export const MenusErrorScreen = ({
  variant = "error",
}: MenusErrorScreenProps) => {
  const { fetchMenus, status: menusStatus } = useMenusStore();
  const { logout } = useAuthStore();
  const { title, description } = messages[variant];
  const isRetrying = menusStatus === "loading";

  const handleRetry = () => {
    void fetchMenus();
  };

  const handleLogout = () => {
    void logout();
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {variant === "error" && (
            <Button
              onClick={handleRetry}
              disabled={isRetrying}
              className="w-full gap-2"
            >
              <RefreshCwIcon
                className={isRetrying ? "size-4 animate-spin" : "size-4"}
                aria-hidden
              />
              {isRetrying ? "Retrying…" : "Retry"}
            </Button>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button variant="outline" className="w-full" onClick={handleLogout}>
            Sign out
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
