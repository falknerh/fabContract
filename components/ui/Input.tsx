import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  label?: string;
  error?: string;
  hint?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label, error, hint, prefix, suffix, className, id, ...props
}, ref) => {
  const inputId = id ?? label?.toLowerCase().replace(/\s/g, "-");
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-slate-600">
          {label}
          {props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className={cn(
        "flex items-center border rounded-lg bg-white transition-colors",
        error ? "border-red-300 focus-within:border-red-400" : "border-slate-200 focus-within:border-blue-400",
        props.disabled && "bg-slate-50 opacity-60"
      )}>
        {prefix && <span className="pl-3 text-slate-400 text-sm shrink-0">{prefix}</span>}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "flex-1 px-3 py-2 text-sm text-slate-900 bg-transparent outline-none placeholder-slate-400 rounded-lg",
            prefix && "pl-1.5",
            suffix && "pr-1.5",
            className
          )}
          {...props}
        />
        {suffix && <span className="pr-3 text-slate-400 text-sm shrink-0">{suffix}</span>}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
});
Input.displayName = "Input";

interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const SelectInput = forwardRef<HTMLSelectElement, SelectInputProps>(({
  label, error, options, className, id, ...props
}, ref) => {
  const inputId = id ?? label?.toLowerCase().replace(/\s/g, "-");
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-slate-600">
          {label}
          {props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <select
        ref={ref}
        id={inputId}
        className={cn(
          "px-3 py-2 text-sm text-slate-900 bg-white border rounded-lg outline-none transition-colors focus:border-blue-400",
          error ? "border-red-300" : "border-slate-200",
          props.disabled && "bg-slate-50 opacity-60",
          className
        )}
        {...props}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
});
SelectInput.displayName = "SelectInput";
