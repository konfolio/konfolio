"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Plan } from "@/lib/upgradePlans";
import {
  addOnProducts,
  demoForms,
  getAudience,
  getFees,
  parsePrice,
  planDescription,
  planHighlights,
} from "@/lib/checkout";
import { CartSummary, type CartLine } from "./CartSummary";
import { Checkbox, ProductCard, QuantityStepper, SelectField } from "./ui";

type CheckoutProps = {
  plan: Plan;
};

export function Checkout({ plan }: CheckoutProps) {
  const router = useRouter();
  const addOns = addOnProducts[getAudience(plan)];
  const planPrice = parsePrice(plan.price);

  const [includePlan, setIncludePlan] = useState(true);
  const [billing, setBilling] = useState("monthly");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [formSelections, setFormSelections] = useState<Record<string, string[]>>({});

  const setQuantity = (id: string, qty: number) => {
    setQuantities((q) => ({ ...q, [id]: qty }));
    setFormSelections((s) => ({ ...s, [id]: (s[id] ?? []).slice(0, qty) }));
  };

  const setFormFor = (id: string, index: number, formId: string) => {
    setFormSelections((s) => {
      const next = [...(s[id] ?? [])];
      next[index] = formId;
      return { ...s, [id]: next };
    });
  };

  // One cart line per unit, matching the design
  const lines: CartLine[] = [];
  if (includePlan) lines.push({ key: plan.id, name: plan.name, price: planPrice });
  for (const addOn of addOns) {
    for (let i = 0; i < (quantities[addOn.id] ?? 0); i++) {
      lines.push({ key: `${addOn.id}-${i}`, name: addOn.name, price: addOn.price });
    }
  }

  const subtotal = lines.reduce((sum, l) => sum + l.price, 0);
  const fees = getFees(subtotal);
  const total = subtotal + fees.reduce((sum, f) => sum + (f.coveredByKonfolio ? 0 : f.amount), 0);

  // Every per-form unit needs a form picked before checkout
  const missingForm = addOns.some((a) => {
    if (!a.perForm) return false;
    const qty = quantities[a.id] ?? 0;
    const picked = (formSelections[a.id] ?? []).filter(Boolean).length;
    return picked < qty;
  });

  const handleContinue = () => {
    // TODO: create the order / payment session with your backend
    router.push("/payment");
  };

  return (
    <div className="mx-auto flex w-full max-w-[1212px] flex-col gap-[15px] px-6 py-[50px] lg:flex-row lg:items-start xl:px-0">
      <section className="flex min-w-0 flex-1 flex-col gap-5 pt-2.5">
        <h1 className="text-sub text-black">Select An Item*</h1>

        <div className="flex flex-col gap-[15px]">
          {/* Plan */}
          <ProductCard
            title={plan.name}
            price={planPrice}
            selected={includePlan}
            description={
              <>
                <p>{planDescription(plan)}</p>
                <ul className="list-disc pl-[22.5px]">
                  {planHighlights(plan).map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </>
            }
            action={
              <Checkbox checked={includePlan} onChange={setIncludePlan} label={`Include ${plan.name}`} />
            }
          >
            <SelectField aria-label="Billing period" value={billing} onChange={(e) => setBilling(e.target.value)}>
              <option value="monthly">Billed Monthly</option>
            </SelectField>
          </ProductCard>

          {/* Add-ons */}
          {addOns.map((addOn) => {
            const qty = quantities[addOn.id] ?? 0;
            const perForm = addOn.perForm;
            const selections = formSelections[addOn.id] ?? [];

            return (
              <ProductCard
                key={addOn.id}
                title={addOn.name}
                description={<p>{addOn.description}</p>}
                price={addOn.price}
                icon={addOn.icon}
                selected={qty > 0}
                action={
                  <QuantityStepper value={qty} onChange={(n) => setQuantity(addOn.id, n)} label={addOn.name} />
                }
              >
                {perForm && qty > 0 && (
                  <div className="flex flex-col gap-[5px]">
                    {Array.from({ length: qty }, (_, i) => {
                      const formId = selections[i] ?? "";
                      const form = demoForms.find((f) => f.id === formId);
                      // Stack the increase if the same form is picked more than once
                      const prior = selections.slice(0, i).filter((id) => id === formId).length;
                      const from = form ? form.applicationLimit + perForm.increase * prior : 0;

                      return (
                        <SelectField
                          key={i}
                          aria-label={`Form for ${addOn.name} ${i + 1}`}
                          value={formId}
                          onChange={(e) => setFormFor(addOn.id, i, e.target.value)}
                          hint={form ? `${from} → ${from + perForm.increase}` : undefined}
                        >
                          <option value="" disabled>
                            Select Form to Add {perForm.increase} Application Space
                          </option>
                          {demoForms.map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.name}
                            </option>
                          ))}
                        </SelectField>
                      );
                    })}
                  </div>
                )}
              </ProductCard>
            );
          })}
        </div>
      </section>

      <CartSummary
        lines={lines}
        fees={fees}
        total={total}
        canContinue={lines.length > 0 && !missingForm}
        onContinue={handleContinue}
      />
    </div>
  );
}