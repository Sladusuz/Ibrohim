import {
  Code2,
  Smartphone,
  Palette,
  ShoppingCart,
  Server,
  Sparkles,
  Globe,
  Rocket,
  ShieldCheck,
  LineChart,
  Layers,
  Bot,
  type LucideIcon,
} from "lucide-react";

export const ICON_MAP: Record<string, LucideIcon> = {
  "code-2": Code2,
  smartphone: Smartphone,
  palette: Palette,
  "shopping-cart": ShoppingCart,
  server: Server,
  sparkles: Sparkles,
  globe: Globe,
  rocket: Rocket,
  shield: ShieldCheck,
  chart: LineChart,
  layers: Layers,
  bot: Bot,
};

export function getIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? Code2;
}
