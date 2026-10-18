import { Recycle, Soup, Ticket, Wrench, LayoutGrid, type LucideProps } from "lucide-react";
import type { Category } from "@/lib/types";

const ICONS = {
  PRELOVED: Recycle,
  FOOD: Soup,
  TICKETS: Ticket,
  SERVICES: Wrench,
  ALL: LayoutGrid,
} as const;

export function CategoryIcon({ category, ...props }: { category: Category | "ALL" } & LucideProps) {
  const Icon = ICONS[category];
  return <Icon aria-hidden {...props} />;
}
