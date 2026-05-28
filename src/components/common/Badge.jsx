import { cn } from "../../utils/helpers";

function Badge({ children, variant = "default", className = "" }) {
  const variants = {
    default: "bg-surface border border-surface-border text-text-secondary",
    success: "bg-brand-light text-brand-secondary",
    warning: "bg-amber-50 text-amber-700",
    info: "bg-blue-50 text-blue-700",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        variants[variant] || variants.default,
        className,
      )}
    >
      {children}
    </span>
  );
}

export default Badge;
