import { Bell, Palette, Globe } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const SETTING_SECTIONS = [
  {
    icon: Palette,
    title: "Appearance",
    description: "Customize the look and feel of the application.",
    items: ["Theme (light / dark)", "Language & locale"],
  },
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
        {SETTING_SECTIONS.map(({ icon: Icon, title, description, items }) => (
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
