import { cn } from "@/lib/utils";

interface FieldWrapProps {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  active?: boolean;
  filled?: boolean;
  htmlFor: string;
}

export const FieldWrap = ({ label, required, hint, error, children, active, filled, htmlFor }: FieldWrapProps) => {
  return (
    <div className="group relative">
      <label
        htmlFor={htmlFor}
        className={cn(
          "block text-[11px] font-semibold tracking-[0.08em] mb-2 transition-colors duration-150",
          error ? "text-destructive" : active ? "text-accent" : filled ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {label}
        {required && <span className="text-accent ml-1">*</span>}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="mt-1.5 text-[11px] font-medium text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-[11px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
};

export const borderCls = (active: boolean, invalid: boolean) => {
  if (invalid) return "border-destructive";
  return active ? "border-accent" : "border-border hover:border-foreground/30";
};

export const inputCls = (active: boolean, invalid = false) => {
  return cn(
    "w-full h-11 bg-transparent font-sans text-sm text-foreground",
    "border-0 border-b-2 outline-none transition-all duration-200",
    "placeholder:text-muted-foreground/40",
    borderCls(active, invalid)
  );
};

export const selectCls = (active: boolean, empty: boolean, invalid = false) => {
  return cn(
    "w-full h-11 bg-transparent font-sans text-sm appearance-none pr-8",
    "border-0 border-b-2 outline-none transition-all duration-200 cursor-pointer",
    borderCls(active, invalid),
    empty ? "text-muted-foreground/40" : "text-foreground"
  );
};
