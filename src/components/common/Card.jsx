import { forwardRef } from "react";
import { cn } from "../../utils/helpers";

const Card = forwardRef(function Card(
  { children, className = "", ...props },
  ref,
) {
  return (
    <div ref={ref} className={cn("stat-card", className)} {...props}>
      {children}
    </div>
  );
});

export default Card;
