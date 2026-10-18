import { cn, formatRM } from "@/lib/format";

/** The punched swing-tag used for every price on the site. */
export function PriceTag({
  price,
  unit,
  muted,
  size = "md",
  className,
}: {
  price: number;
  unit?: string;
  muted?: boolean;
  size?: "md" | "lg";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "price-tag",
        size === "lg" ? "text-2xl" : "text-lg",
        muted && "!bg-muted/60 !text-bg",
        className,
      )}
    >
      {price === 0 ? "Free" : formatRM(price)}
      {price > 0 && unit && unit !== "per item" && (
        <span className="text-[0.55em] font-semibold opacity-75">/{unit.replace(/^per /, "")}</span>
      )}
    </span>
  );
}
