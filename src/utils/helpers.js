export const cn = (...classes) => classes.filter(Boolean).join(" ");

export const getInitials = (name = "Admin User") =>
  name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export default { cn, getInitials };
