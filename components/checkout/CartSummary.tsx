import type { Fee } from "@/lib/checkout";
import { Price } from "./ui";
import InfoIcon from "../icons/InfoIcon";

export type CartLine = {
  key: string;
  name: string;
  price: number;
};

type CartSummaryProps = {
  lines: CartLine[];
  fees: Fee[];
  total: number;
  canContinue: boolean;
  onContinue: () => void;
};

export function CartSummary({ lines, fees, total, canContinue, onContinue }: CartSummaryProps) {
  return (
    <aside className="flex w-full flex-col justify-between gap-10 rounded-[15px] bg-white p-5 shadow-card lg:sticky lg:top-[50px] lg:h-[min(800px,calc(100vh-100px))] lg:w-[430px] lg:shrink-0">
      <div className="flex min-h-0 flex-1 flex-col gap-2.5">
        {/* TODO: payment processor options (blank placeholders in the design) */}
        <div className="flex h-[45px] gap-2.5">
          <div className="flex-1 rounded-[10px] bg-[#d9d9d9]" />
          <div className="flex-1 rounded-[10px] bg-[#d9d9d9]" />
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-[50px] overflow-y-auto py-2.5">
          <ul className="flex flex-col gap-[15px]">
            {lines.length === 0 && (
              <li className="text-body-plus text-[#999999]">Your cart is empty.</li>
            )}
            {lines.map((line) => (
              <li key={line.key} className="flex items-center gap-[15px]">
                <img
                  src="/images/cart-thumb.png"
                  alt=""
                  width={50}
                  height={50}
                  className="size-[50px] shrink-0 rounded-[10px] object-cover"
                />
                <p className="flex-1 text-body-plus text-black">{line.name}</p>
                <Price amount={line.price} size="body-plus" />
              </li>
            ))}
          </ul>

          <ul className="flex flex-col gap-[15px]">
            {fees.map((fee) => (
              <li key={fee.id} className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-[5px]">
                    <InfoIcon className="size-5"/>
                    <p className="text-body-plus text-black">{fee.label}</p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Price amount={fee.coveredByKonfolio ? 0 : fee.amount} size="body-plus" />
                    {fee.coveredByKonfolio && (
                      <p className="text-body-plus text-[#D3D3D3] line-through">
                        {fee.amount.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
                {fee.coveredByKonfolio && (
                  <p className="text-body text-[#D3D3D3]">Konfolio will cover this fee for you.</p>
                )}
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between">
            <p className="text-body-plus text-black">Total</p>
            <Price amount={total} size="body-plus" />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onContinue}
        disabled={!canContinue}
        className="h-[55px] w-full rounded-[10px] bg-black text-header text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Continue to Payment
      </button>
    </aside>
  );
}