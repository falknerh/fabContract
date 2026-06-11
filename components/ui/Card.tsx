import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, padding = "md", hover = false, onClick }: CardProps) {
  const paddings = { none: "", sm: "p-3", md: "p-5", lg: "p-6" };
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-xl border border-slate-200 shadow-card",
        paddings[padding],
        hover && "cursor-pointer hover:shadow-card-hover hover:border-slate-300 transition-all",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, actions }: { children: React.ReactNode; className?: string; actions?: React.ReactNode }) {
  return (
    <div className={cn("flex items-start justify-between gap-4 mb-4", className)}>
      <div>{children}</div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

export function CardTitle({ children, subtitle }: { children: React.ReactNode; subtitle?: string }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-900">{children}</h3>
      {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
  );
}
