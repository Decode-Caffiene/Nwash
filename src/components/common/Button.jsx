import { cn } from "../../utils/helpers";

function Button({
  children,
  variant = "primary",
  type = "button",
  className = "",
  ...props
}) {
  const variants = {
    primary: "bg-brand-primary text-white hover:bg-brand-secondary",
    secondary:
      "bg-white text-text-primary border border-surface-border hover:bg-surface",
    ghost: "bg-transparent text-white hover:bg-sidebar-active",
  };

  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant] || variants.primary,
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
