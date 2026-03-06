import { Bell, Globe, Monitor, Moon, Sun } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTheme, type Theme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

const THEME_OPTIONS: { value: Theme; label: string; icon: React.ElementType }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

function AppearanceSection() {
  const { theme, setTheme } = useTheme();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sun className="size-4 text-muted-foreground" />
          <CardTitle className="text-base">Appearance</CardTitle>
        </div>
        <CardDescription>Customize the look and feel of the application.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div>
          <p className="text-sm font-medium mb-3">Theme</p>
          <div className="grid grid-cols-3 gap-3">
            {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setTheme(value)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors hover:bg-accent",
                  theme === value
                    ? "border-primary bg-accent"
                    : "border-border",
                )}
              >
                <Icon className={cn("size-5", theme === value ? "text-primary" : "text-muted-foreground")} />
                <span className={cn("text-sm font-medium", theme === value ? "text-primary" : "text-muted-foreground")}>
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const PLACEHOLDER_SECTIONS = [
  {
    icon: Bell,
    title: "Notifications",
    description: "Manage how and when you receive notifications.",
    items: ["Email notifications", "In-app alerts"],
  },
  {
    icon: Globe,
    title: "Regional",
    description: "Timezone, date format, and currency preferences.",
    items: ["Timezone", "Date format", "Currency"],
  },
];

export const SettingsPage = () => {
  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your application preferences.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <AppearanceSection />

        {PLACEHOLDER_SECTIONS.map(({ icon: Icon, title, description, items }) => (
          <Card key={title}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Icon className="size-4 text-muted-foreground" />
                <CardTitle className="text-base">{title}</CardTitle>
              </div>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col divide-y">
                {items.map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                  >
                    <span className="text-sm">{item}</span>
                    <span className="text-xs text-muted-foreground italic">
                      Coming soon
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator />
      <p className="text-xs text-muted-foreground text-center">
        More settings will be available in a future release.
      </p>
    </div>
  );
};
