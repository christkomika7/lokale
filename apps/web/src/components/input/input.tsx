import { Eye, EyeOff, X, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { Input as I } from "../ui/input";
import { cn } from "#/lib/utils";

interface InputProps {
  id?: string;
  name?: string;
  type?: string;
  value: string;
  hasError?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  className?: string;
  autoComplete?: string;
  placeholder: string;
  icon?: LucideIcon;
  position?: "left" | "right";
  iconClassName?: string;
  clearButton?: boolean;
}

export default function Input({
  id,
  name,
  className,
  hasError = false,
  placeholder,
  icon: Icon,
  position,
  iconClassName,
  clearButton,
  value,
  autoComplete,
  type = "text",
  onChange,
  onBlur,
}: InputProps) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const pos = isPassword ? "left" : position;
  const inputType = isPassword ? (show ? "text" : "password") : type;

  function getPasswordStrength(pwd: string): {
    level: 0 | 1 | 2 | 3;
    label: string;
    color: string;
  } {
    if (!pwd) return { level: 0, label: "", color: "" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { level: 1, label: "Faible", color: "bg-red-400" };
    if (score === 2) return { level: 2, label: "Moyen", color: "bg-amber-400" };
    return { level: 3, label: "Fort", color: "bg-green-400" };
  }

  const strength = getPasswordStrength(value);

  return (
    <>
      <div className="relative">
        {Icon && (
          <div
            className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground dark:text-neutral-200  ${pos === "left" ? "left-3" : "right-3"}`}
          >
            <Icon
              className={cn("size-4  dark:text-neutral-500", iconClassName)}
            />
          </div>
        )}
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShow(!show)}
            className="absolute cursor-pointer right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
        <I
          className={cn(
            `min-w-sm rounded-full w-full border-input dark:placeholder-neutral-300 ${pos === "left" ? "pl-9" : "pr-9"}`,
            className,
          )}
          id={id}
          name={name}
          type={inputType}
          placeholder={placeholder}
          value={value}
          aria-invalid={hasError}
          onBlur={onBlur}
          autoComplete={autoComplete}
          onChange={onChange}
        />
        {!isPassword && clearButton && value && (
          <button
            onClick={() =>
              onChange({
                target: {
                  value: "",
                },
              } as React.ChangeEvent<HTMLInputElement>)
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
          >
            <X className="size-3" />
          </button>
        )}
      </div>
      {isPassword && value.length > 0 && (
        <div className="space-y-1 px-0.5">
          <div className="flex gap-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  i <= strength.level
                    ? strength.color
                    : "bg-neutral-100 dark:bg-neutral-700"
                }`}
              />
            ))}
          </div>
          <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
            Force :{" "}
            <span
              className={
                strength.level === 1
                  ? "text-red-500"
                  : strength.level === 2
                    ? "text-amber-500"
                    : "text-green-500"
              }
            >
              {strength.label}
            </span>
          </p>
        </div>
      )}
    </>
  );
}
