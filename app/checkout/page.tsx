import Link from "next/link";
import Navbar from "@/components/Navbar";
import { redirect } from "next/navigation";
import { Checkout } from "@/components/checkout/Checkout";
import { getPlan } from "@/lib/checkout";

type CheckoutPageProps = {
  searchParams: Promise<{ plan?: string }>;
};

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const { plan: planId } = await searchParams;
  const plan = getPlan(planId);

  // No plan, unknown plan, or already on it → back to plans
  if (!plan || plan.isCurrent) redirect("/upgrade");

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F7F7] font-inter">
      <Navbar />
      <main className="flex-1">
        <Checkout plan={plan} />
      </main>
    </div>
  );
}