import { forwardRef } from "react";

const inputClasses =
  "w-full bg-bg border border-border rounded px-3 py-2 text-sm text-text placeholder:text-text-muted/60 focus:outline-none focus:border-accent-green/40 transition-colors";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { icon, className = "", ...props },
  ref,
) {
  if (icon) {
    return (
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
          {icon}
        </div>
        <input
          ref={ref}
          className={`${inputClasses} pl-10 ${className}`}
          {...props}
        />
      </div>
    );
  }

  return (
    <input
      ref={ref}
      className={`${inputClasses} ${className}`}
      {...props}
    />
  );
});
