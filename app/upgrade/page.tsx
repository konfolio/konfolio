"use client";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { PricingCard } from "@/components/PricingCard";
import { organizerPlans, vendorPlans, type Plan } from "@/lib/upgradePlans";

type PlanSectionProps = {
  title: string;
  plans: Plan[];
  onUpgrade: (planId: string) => void;
};

function PlanSection({ title, plans, onUpgrade }: PlanSectionProps) {
  return (
    <section className="flex w-full flex-col gap-[20px]">
      <h2 className="text-section text-[28px] text-black">{title}</h2>
      <div className="grid gap-5 md:grid-cols-2">
        {plans.map((plan) => (
          <PricingCard key={plan.id} plan={plan} />
        ))}
      </div>
    </section>
  );
}

export default function UpgradePage() {
  const handleUpgrade = (planId: string) => {
    // TODO: route to checkout
    console.log("Upgrade to", planId);
  };

  return (
    <div className="flex min-h-screen flex-col items-center gap-[100px] bg-[#F7F7F7] font-sans">
      <Navbar />

      <main className="flex w-full max-w-[1212px] flex-col items-center gap-[100px] px-6 xl:px-0">
        <h1 className="text-center text-hero text-[35px] text-black">
          Bring your workflow to the <em className="font-semibold">next level</em>
        </h1>
        <PlanSection title="Event Organizer Plans" plans={organizerPlans} onUpgrade={handleUpgrade} />
        <PlanSection title="Vendor Plans" plans={vendorPlans} onUpgrade={handleUpgrade} />
      </main>

      <Footer />
    </div>
  );
}