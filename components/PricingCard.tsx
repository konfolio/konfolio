import type { ReactNode } from "react";
import Link from "next/link";
import type { AddOn, Feature, Plan } from "@/lib/upgradePlans";
import InfoIcon from "@/components/icons/InfoIcon";


type PricingCardProps = {
  plan: Plan;
  // onUpgrade?: (planId: string) => void;
};

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-sub text-black">{children}</p>
      <hr className="border-t-[0.5px] border-[#D3D3D3]" />
    </div>
  );
}

function Tag({ muted }: { muted: boolean }) {
  return (
    <span
      className={`inline-flex h-6 shrink-0 items-center rounded-full border-[0.5px] bg-white/10 px-5 text-body-plus ${
        muted ? "border-[#D3D3D3] text-[#D3D3D3]" : "border-black-40 text-black"
      }`}
    >
      High Usage
    </span>
  );
}

function FeatureRow({ feature }: { feature: Feature }) {
  const muted = !feature.included;

  return (
    <li className="relative flex h-6 items-center gap-2.5">
      {feature.info && (
        <button
          type="button"
          aria-label={`About ${feature.label}`}
          className="absolute -left-[25px] top-0.5 size-4"
        >
          {/* <img src="components/icons/InfoIcon.tsx" alt="" width={16} height={16} /> */}
          <InfoIcon className="size-5"/>
        </button>
      )}
      <span className={`flex-1 text-sub ${muted ? "text-[#D3D3D3]" : "text-black"}`}>
        {feature.label}
        {muted && <span className="sr-only"> (not included)</span>}
      </span>
      {feature.highUsage && <Tag muted={muted} />}
    </li>
  );
}

function AddOnRow({ addOn }: { addOn: AddOn }) {
  const available = addOn.available ?? true;

  return (
    <li
      className={`flex h-[38px] items-center justify-between gap-4 rounded-full bg-[#F7F7F7] px-[22px] text-sub ${
        available ? "" : "text-[#D3D3D3]"
      }`}
    >
      <span className={available ? "text-black" : ""}>{addOn.label}</span>
      <span className={available ? "text-black" : ""}>{addOn.price}</span>
    </li>
  );
}

const buttonBase =
  "flex h-[57px] w-full items-center justify-center rounded-full px-10 text-header";

export function PricingCard({ plan }: PricingCardProps) {
  return (
    <article className="flex flex-col gap-[50px] rounded-[15px] bg-white px-[35px] pt-[50px] pb-[30px] shadow-card">
      <h3 className="text-card-title text-black">{plan.name}</h3>

      <div className="flex items-end gap-[5px] whitespace-nowrap">
        <p className="font-price text-price text-[32px] text-black">{plan.price}</p>
        {plan.period && <p className="text-sub text-[#999999]">/ {plan.period}</p>}
      </div>

      <section className="flex flex-col gap-5">
        <SectionLabel>Your tools...</SectionLabel>
        <div className="flex flex-col gap-5 px-[25px]">
          <ul className="flex flex-col gap-3">
            {plan.features.map((f) => (
              <FeatureRow key={f.label} feature={f} />
            ))}
          </ul>
          <ul className="flex flex-col gap-[15px]">
            {plan.addOns.map((a) => (
              <AddOnRow key={a.label} addOn={a} />
            ))}
          </ul>
        </div>
      </section>

      {plan.isCurrent ? (
        <button
          type="button"
          disabled
          className={`${buttonBase} border border-black text-black`}
        >
          Current Plan
        </button>
      ) : (
        <Link
          href={`/checkout?plan=${plan.id}`}
          className={`${buttonBase} bg-black text-white transition-opacity hover:opacity-90`}
        >
          Upgrade My Plan
        </Link>
      )}

      <section className="flex flex-col gap-5">
        <SectionLabel>Recommended for...</SectionLabel>
        <p className="text-body-plus text-[#999999]">{plan.recommendedFor}</p>
      </section>
    </article>
  );
}