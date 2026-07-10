import { cn } from "@/lib/utils"

export function FormBadge({ form }: { form: string }) {
  if (!form) return null
  return (
    <div className="flex gap-1" aria-label={`Forma reciente: ${form}`}>
      {form.split("").map((r, i) => (
        <span
          key={i}
          className={cn(
            "flex size-5 items-center justify-center rounded text-[10px] font-bold text-white",
            r === "W" && "bg-primary",
            r === "D" && "bg-muted-foreground",
            r === "L" && "bg-destructive",
          )}
        >
          {r}
        </span>
      ))}
    </div>
  )
}
