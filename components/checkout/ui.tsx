import type { ReactNode, SelectHTMLAttributes } from "react";
import MinusCircleIcon from "../icons/MinusCircleIcon";
import AddCircleIcon from "../icons/AddCircleIcon";
import ArrowDown from "../icons/ArrowDown";

/* ---------- Price ($ shown small, top-aligned) ---------- */
type PriceProps = {
  amount: number;
  size?: "sub" | "body-plus";
};

export function Price({ amount, size = "sub" }: PriceProps) {
  return (
    <p
      className={`flex items-start justify-end whitespace-nowrap text-black ${
        size === "sub" ? "text-sub" : "text-body-plus"
      }`}
    >
      <span className="text-[11px] leading-[1.4]">$</span>
      <span>{amount.toFixed(2)}</span>
    </p>
  );
}

/* ---------- Quantity stepper ---------- */
type QuantityStepperProps = {
  value: number;
  onChange: (value: number) => void;
  label: string;
  min?: number;
  max?: number;
};

export function QuantityStepper({ value, onChange, label, min = 0, max = 99 }: QuantityStepperProps) {
  return (
    <div className="flex items-center gap-[15px]">
      <button
        type="button"
        aria-label={`Remove one ${label}`}
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
        className="size-6 text-black hover:opacity-80 disabled:cursor-not-allowed disabled:text-[#d3d3d3]"
      >
        <MinusCircleIcon />
      </button>
      <span aria-live="polite" className="w-[15px] text-center text-sub text-black">
        {value}
      </span>
      <button
        type="button"
        aria-label={`Add one ${label}`}
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
        className="size-6 text-black hover:opacity-80 disabled:cursor-not-allowed disabled:text-[#d3d3d3]"
      >
        <AddCircleIcon />
      </button>
    </div>
  );
}

/* ---------- Checkbox ---------- */
type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
};

export function Checkbox({ checked, onChange, label }: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`flex size-5 items-center justify-center rounded-[5px] ${
        checked ? "bg-black" : "border border-[#999999] bg-white"
      }`}
    >
      {checked && (
        <svg viewBox="0 0 16 16" className="size-3.5 text-white" fill="none" stroke="currentColor"
          strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M3.5 8.5l3 3 6-7" />
        </svg>
      )}
    </button>
  );
}

/* ---------- Select (dropdown) ---------- */
type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  hint?: string;
};

export function SelectField({ hint, children, ...props }: SelectFieldProps) {
  const isPlaceholder = props.value === "";

  return (
    <div className="relative w-full">
      <select
        {...props}
        className={`h-11 w-full cursor-pointer appearance-none rounded-[15px] border-[0.5px] border-[#d3d3d3] bg-white pl-5 text-sub ${
          hint ? "pr-[130px]" : "pr-[59px]"
        } ${isPlaceholder ? "text-[#d3d3d3]" : "text-black"}`}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-5 flex items-center gap-[15px]">
        {hint && <span className="text-body text-[#d3d3d3]">{hint}</span>}
        <ArrowDown />
      </div>
    </div>
  );
}

/* ---------- Product card ---------- */
type ProductCardProps = {
  title: string;
  description: ReactNode;
  price: number;
  selected: boolean;
  action: ReactNode;
  icon?: string;
  children?: ReactNode;
};

export function ProductCard({
  title,
  description,
  price,
  selected,
  action,
  icon = "/icons/image.svg",
  children,
}: ProductCardProps) {
  return (
    <article
      className={`flex min-h-[120px] gap-[15px] rounded-[15px] border bg-white p-5 drop-shadow-[2px_4px_12.5px_rgba(165,165,165,0.1)] ${
        selected ? "border-[#999999]" : "border-transparent"
      }`}
    >
      <div className="flex size-[102px] shrink-0 items-center justify-center rounded-[10px] bg-[#d3d3d3] max-sm:hidden">
        <img src={icon} alt="" width={40} height={40} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-5 pt-[5px]">
        <div className="flex flex-col gap-[5px]">
          <h3 className="text-sub text-black">{title}</h3>
          <div className="text-body-plus text-[#999999]">{description}</div>
        </div>
        {children}
      </div>

      <div className="flex w-[93px] shrink-0 flex-col items-end justify-between pt-[5px]">
        <Price amount={price} />
        {action}
      </div>
    </article>
  );
}