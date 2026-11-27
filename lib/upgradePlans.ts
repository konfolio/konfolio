export type Feature = {
  label: string;
  included: boolean;
  highUsage?: boolean;
  info?: boolean;
};

export type AddOn = {
  label: string;
  price: string;
  href?: string;
  available?: boolean; // defaults to true
};

export type Plan = {
  id: string;
  name: string;
  price: string;
  period?: string;
  features: Feature[];
  addOns: AddOn[];
  recommendedFor: string;
  isCurrent?: boolean;
};

const organizerAddOns: AddOn[] = [
  { label: "100 permanent application space", price: "$9.99" },
  { label: "Customized portfolio template", price: "$73.99", href: "/custom-template" },
];

const vendorAddOns: AddOn[] = [
  { label: "Permanent portfolio slot", price: "$14.99" },
];

export const organizerPlans: Plan[] = [
  {
    id: "organizer-starter",
    name: "Organizer Starter Plan",
    price: "Free",
    isCurrent: true,
    features: [
      { label: "Unlimited form creation", included: true },
      { label: "Multi-tab organization", included: true },
      { label: "Payment in-form & invoice form", included: true, highUsage: true, info: true },
      { label: "200 applications per form", included: true },
      { label: "Unlimited applications per form", included: false },
      { label: "Unlimited form sharing", included: false, highUsage: true },
      { label: "Applicant lottery and raffle", included: false, highUsage: true },
    ],
    addOns: organizerAddOns,
    recommendedFor:
      "Small teams of organizers (≤5 people) who are serving a small, local community and is expecting ≤250 applications. You achieve the most even under a time constraint and bring careful consideration to every applicant.",
  },
  {
    id: "organizer-konvention",
    name: "Organizer Konvention Plan",
    price: "$23.99",
    period: "month",
    features: [
      { label: "Unlimited form creation", included: true },
      { label: "Multi-tab organization", included: true },
      { label: "Payment in-form & invoice form", included: true, highUsage: true, info: true },
      { label: "200 applications per form", included: true },
      { label: "Unlimited applications per form", included: true },
      { label: "Unlimited form sharing", included: true, highUsage: true },
      { label: "Applicant lottery and raffle", included: true, highUsage: true },
    ],
    addOns: organizerAddOns,
    recommendedFor:
      "Medium or large teams of organizers (5+ people) who are serving a local community and extending to people outside your community. You are expecting 300+ applications, and you want to ensure equal opportunity to all applicants.",
  },
];

export const vendorPlans: Plan[] = [
  {
    id: "vendor-starter",
    name: "Vendor Starter Plan",
    price: "Free",
    isCurrent: true,
    features: [
      { label: "Unlimited application autofill", included: true },
      { label: "3 permanent portfolio slots", included: true },
      { label: "Unlimited portfolio slots", included: false, highUsage: true },
      { label: "Organizer credibility", included: false },
      { label: "Form application count", included: false },
      { label: "Viewer statistics", included: false, highUsage: true },
      { label: "20% OFF All Fees", included: false, highUsage: true },
    ],
    addOns: vendorAddOns,
    recommendedFor:
      "Artists who are just starting up and is attending limited conventions and fairs. You have recognizable products representing your brand or are only marketing your best sellers.",
  },
  {
    id: "vendor-konfolio",
    name: "Vendor Konfolio Plan",
    price: "$16.99",
    period: "month",
    features: [
      { label: "Unlimited application autofill", included: true },
      { label: "3 permanent portfolio slots", included: true },
      { label: "Unlimited portfolio slots", included: true, highUsage: true },
      { label: "Organizer credibility", included: true },
      { label: "Form application count", included: true },
      { label: "Viewer statistics", included: true, highUsage: true },
      { label: "20% OFF All Fees", included: true, highUsage: true },
    ],
    addOns: vendorAddOns,
    recommendedFor:
      "Full-time artists who bring high customization to their portfolios or are attending many conventions and fairs. You try different types of products, so you need a portfolio that reflects your changing inventory.",
  },
];