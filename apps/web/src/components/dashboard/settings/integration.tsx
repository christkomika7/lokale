import Heading from "#/components/typography/heading";
import { Button } from "#/components/ui/button";
import { Cog } from "lucide-react";
import { useState } from "react";
import {
  FacebookIcon,
  InstagramIcon,
  SmsIcon,
  WhatsAppIcon,
} from "#/components/icons/icon";
import { Switch } from "#/components/ui/switch";

type IntegrationKey = "sms" | "whatsapp" | "facebook" | "instagram";

const integrationConfig: Record<
  IntegrationKey,
  {
    label: string;
    desc: string;
    icon: React.ElementType;
    activeIcon: string;
    activeBg: string;
    inactiveIcon: string;
    inactiveBg: string;
  }
> = {
  sms: {
    label: "SMS",
    desc: "Notifications & vérifications par SMS",
    icon: SmsIcon,
    activeIcon: "text-violet-500 dark:text-violet-400",
    activeBg: "bg-violet-50 dark:bg-violet-500/10",
    inactiveIcon: "text-neutral-400 dark:text-neutral-500",
    inactiveBg: "bg-neutral-100 dark:bg-neutral-800",
  },
  whatsapp: {
    label: "WhatsApp",
    desc: "Messagerie & alertes via WABA",
    icon: WhatsAppIcon,
    activeIcon: "text-emerald-500 dark:text-emerald-400",
    activeBg: "bg-emerald-50 dark:bg-emerald-500/10",
    inactiveIcon: "text-neutral-400 dark:text-neutral-500",
    inactiveBg: "bg-neutral-100 dark:bg-neutral-800",
  },
  facebook: {
    label: "Facebook",
    desc: "Publications & pages Facebook",
    icon: FacebookIcon,
    activeIcon: "text-blue-500 dark:text-blue-400",
    activeBg: "bg-blue-50 dark:bg-blue-500/10",
    inactiveIcon: "text-neutral-400 dark:text-neutral-500",
    inactiveBg: "bg-neutral-100 dark:bg-neutral-800",
  },
  instagram: {
    label: "Instagram",
    desc: "Publications & stories Instagram",
    icon: InstagramIcon,
    activeIcon: "text-pink-500 dark:text-pink-400",
    activeBg: "bg-pink-50 dark:bg-pink-500/10",
    inactiveIcon: "text-neutral-400 dark:text-neutral-500",
    inactiveBg: "bg-neutral-100 dark:bg-neutral-800",
  },
};

export default function Integrations() {
  const [integrations, setIntegrations] = useState<
    Record<IntegrationKey, boolean>
  >({
    sms: false,
    whatsapp: false,
    facebook: true,
    instagram: false,
  });

  return (
    <div>
      <Heading>Services connectés</Heading>

      <div className="space-y-2">
        {(Object.keys(integrationConfig) as IntegrationKey[]).map((key: IntegrationKey) => {
          const cfg = integrationConfig[key];
          const active = integrations[key];
          const Icon = cfg.icon;

          return (
            <div
              key={key}
              className="flex items-center gap-3 p-3 rounded-md border transition-all duration-150 border-input dark:border-neutral-700/60 bg-white dark:bg-neutral-900/30 hover:border-neutral-300 dark:hover:border-neutral-600"
            >
              <div
                className={`size-9 rounded-md flex items-center justify-center shrink-0 transition-colors ${active ? cfg.activeBg : cfg.inactiveBg}`}
              >
                <Icon
                  className={`size-[18px] transition-colors ${active ? cfg.activeIcon : cfg.inactiveIcon}`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-neutral-700 dark:text-neutral-200 leading-tight">
                  {cfg.label}
                </p>
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5 truncate">
                  {cfg.desc}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {active && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="size-9! rounded-md "
                  >
                    <Cog className="size-4.5" />
                  </Button>
                )}
                <Switch
                  checked={active}
                  onCheckedChange={(v) =>
                    setIntegrations((i) => ({ ...i, [key]: v }))
                  }
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
