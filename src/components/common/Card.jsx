import { cn } from "../../utils/helpers";

function Card({ children, className = "", ...props }) {
  return (
    <div className={cn("stat-card", className)} {...props}>
      {children}
    </div>
  );
}

export default Card;
