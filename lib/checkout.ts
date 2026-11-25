import { organizerPlans, vendorPlans, type Plan } from "@/lib/upgradePlans";

export type Audience = "organizer" | "vendor";

export type AddOnProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  icon?: string;
  /** Each unit gets applied to one of the user's forms */
  perForm?: { increase: number };
};

export type UserForm = {
  id: string;
  name: string;
  applicationLimit: number;
};

export type Fee = {
  id: string;
  label: string;
  amount: number;
  coveredByKonfolio: boolean;
};

export const addOnProducts: Record<Audience, AddOnProduct[]> = {
  organizer: [
    {
      id: "application-space",
      name: "Additional Application Space",
      description:
        "Raise the maximum limit of applications permanently by 100 for your selected form.",
      price: 9.99,
      perForm: { increase: 100 },
    },
    {
      id: "portfolio-template",
      name: "Customized Portfolio Template",
      description:
        "Your organization’s personal portfolio template. Applicants will get free access to your portfolio template by using the portfolio’s code. Only your events can accept your customized templates.",
      price: 199.99,
      icon: "/icons/image-alt.svg",
    },
  ],
  vendor: [
    {
      id: "portfolio-slot",
      name: "Additional Portfolio Slot",
      // Placeholder copy: no vendor checkout frame in the design
      description: "Add one more reusable portfolio slot to your account.",
      price: 14.99,
    },
  ],
};

// TODO: load the signed-in organizer's forms from your backend
export const demoForms: UserForm[] = [
  { id: "form-1", name: "Untitled Form", applicationLimit: 200 },
];

// TODO: replace with real fees from your payment processor
export function getFees(_subtotal: number): Fee[] {
  return [
    { id: "processor", label: "Processor Fee", amount: 0, coveredByKonfolio: true },
    { id: "transaction", label: "Transaction Fee", amount: 0, coveredByKonfolio: true },
  ];
}

const allPlans = [...organizerPlans, ...vendorPlans];

export function getPlan(id?: string) {
  return allPlans.find((p) => p.id === id);
}

export function getAudience(plan: Plan): Audience {
  return plan.id.startsWith("vendor") ? "vendor" : "organizer";
}

export function parsePrice(price: string) {
  const n = Number(price.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export function planDescription(plan: Plan) {
  return `A 30-day plan of the ${plan.name}. You will get access to the following:`;
}

export function planHighlights(plan: Plan) {
  return plan.features
    .filter((f) => f.included)
    .map((f) => (f.highUsage ? `${f.label} – High Usage` : f.label));
}