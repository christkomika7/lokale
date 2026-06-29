import { Eye, EyeOff, X, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { Input as I } from "../ui/input";
import { cn } from "#/lib/utils";

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  const parts = [
    digits.slice(0, 2),
    digits.slice(2, 5),
    digits.slice(5, 7),
    digits.slice(7, 9),
  ].filter(Boolean);
  return parts.join(" ");
}

function unformatPhone(formatted: string): string {
  return formatted.replace(/\s/g, "");
}

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
  phonePrefix?: string;
  formatPhoneNumber?: boolean;
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
  phonePrefix = "+242",
  formatPhoneNumber = true,
}: InputProps) {
  const [show, setShow] = useState(false);

  const isPassword = type === "password";
  const isPhone = type === "tel";

  const pos = isPassword || isPhone ? "left" : position;
  const inputType = isPassword
    ? show
      ? "text"
      : "password"
    : isPhone
      ? "tel"
      : type;

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

  const displayValue =
    isPhone && formatPhoneNumber ? formatPhone(value) : value;

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = unformatPhone(e.target.value);
    const clamped = raw.slice(0, 9);
    onChange({
      ...e,
      target: { ...e.target, value: clamped },
    });
  }

  const leftPadding = isPhone
    ? Icon
      ? "pl-[4.5rem]"
      : "pl-14"
    : pos === "left"
      ? "pl-9"
      : pos === "right"
        ? "pr-9"
        : "";

  return (
    <>
      <div className="relative">
        {isPhone && (
          <div className="absolute left-0 top-0 h-full flex items-center">
            <span className="flex items-center gap-1 pl-2.5 pr-2 h-full text-xs text-neutral-700 dark:text-neutral-400 font-medium select-none whitespace-nowrap">
              {Icon && (
                <Icon
                  className={cn(
                    "size-3.5 shrink-0 text-neutral-400 dark:text-neutral-500",
                    iconClassName,
                  )}
                />
              )}
              {phonePrefix}
            </span>
          </div>
        )}

        {Icon && !isPhone && !isPassword && (
          <div
            className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground dark:text-neutral-200 ${
              pos === "left" ? "left-3" : "right-3"
            }`}
          >
            <Icon
              className={cn("size-4 dark:text-neutral-500", iconClassName)}
            />
          </div>
        )}

        {isPassword && Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Icon
              className={cn("size-4 dark:text-neutral-500", iconClassName)}
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
            "min-w-sm rounded-md! w-full border-input dark:placeholder-neutral-300",
            leftPadding,
            className,
            { "pl-15!": isPhone },
          )}
          id={id}
          name={name}
          type={inputType}
          placeholder={
            isPhone && formatPhoneNumber ? "06 856 80 32" : placeholder
          }
          value={displayValue}
          aria-invalid={hasError}
          onBlur={onBlur}
          autoComplete={autoComplete}
          onChange={isPhone ? handlePhoneChange : onChange}
          inputMode={isPhone ? "numeric" : undefined}
        />

        {!isPassword && !isPhone && clearButton && value && (
          <button
            type="button"
            onClick={() =>
              onChange({
                target: { value: "" },
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
