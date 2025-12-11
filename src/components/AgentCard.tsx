import { cn } from "@/lib/utils";
import { LucideIcon, Check, Loader2, Circle } from "lucide-react";

interface AgentCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  status: "idle" | "running" | "complete";
  index: number;
}

export const AgentCard = ({ icon: Icon, title, description, status, index }: AgentCardProps) => {
  return (
    <div 
      className={cn(
        "glass rounded-lg p-4 transition-all duration-500 animate-fade-in",
        status === "running" && "glow-primary border-primary/50",
        status === "complete" && "border-primary/30"
      )}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "p-2 rounded-md transition-colors",
          status === "running" && "bg-primary/20",
          status === "complete" && "bg-primary/10",
          status === "idle" && "bg-muted"
        )}>
          <Icon className={cn(
            "w-5 h-5 transition-colors",
            status === "running" && "text-primary animate-pulse",
            status === "complete" && "text-primary",
            status === "idle" && "text-muted-foreground"
          )} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-sm truncate">{title}</h3>
            <div className="flex-shrink-0">
              {status === "idle" && <Circle className="w-4 h-4 text-muted-foreground" />}
              {status === "running" && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
              {status === "complete" && <Check className="w-4 h-4 text-primary" />}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
};
