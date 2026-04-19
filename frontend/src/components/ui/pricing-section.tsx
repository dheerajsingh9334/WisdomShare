import * as React from "react";
import { Link } from "react-router-dom";
import { CircleCheck } from "lucide-react";

// shadcn/ui bits
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ---- minimal craft-ds inline (single-file helper) ----------------
import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

type SectionProps = { children: React.ReactNode; className?: string; id?: string };
type ContainerProps = { children: React.ReactNode; className?: string; id?: string };

const Section = ({ children, className, id }: SectionProps) => (
  <section className={cn("py-8 md:py-12", className)} id={id}>
    {children}
  </section>
);

const Container = ({ children, className, id }: ContainerProps) => (
  <div className={cn("mx-auto max-w-5xl p-6 sm:p-8", className)} id={id}>
    {children}
  </div>
);
// ------------------------------------------------------------------

type PlanTier = "Basic" | "Standard" | "Pro";

interface PricingCardProps {
  title: PlanTier;
  price: string;
  description?: string;
  features: string[];
  cta: string;
  href: string;
  featured?: boolean;
}

// Dummy pricing data
const pricingData: PricingCardProps[] = [
  {
    title: "Basic",
    price: "$29/month",
    description: "Perfect for small businesses and individuals.",
    features: ["3 Pages", "Basic SEO", "Email Support", "Responsive Design"],
    cta: "Choose Basic",
    href: "https://stripe.com/",
  },
  {
    title: "Standard",
    price: "$59/month",
    description: "Best for growing businesses with more needs.",
    features: ["10 Pages", "Advanced SEO", "CMS Integration", "24/7 Chat Support"],
    cta: "Choose Standard",
    href: "https://stripe.com/",
    featured: true,
  },
  {
    title: "Pro",
    price: "$99/month",
    description: "Ideal for larger businesses that need scalability.",
    features: ["Unlimited Pages", "E-commerce Integration", "Priority Support", "Custom API Integration"],
    cta: "Choose Pro",
    href: "https://stripe.com/",
  },
];

export default function Pricing() {
  return (
    <Section className="bg-black text-white">
      <Container className="flex flex-col items-center gap-4 text-center">
        <h2 className="!my-0 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Pricing</h2>
        <p className="max-w-[700px] text-lg opacity-70 md:text-xl">Select the plan that best suits your needs.</p>

        <div className="not-prose mt-12 grid grid-cols-1 divide-x divide-y divide-white/10 border border-white/10 min-[900px]:grid-cols-3 overflow-hidden bg-black/40 backdrop-blur-xl">
          {pricingData.map((plan) => (
            <PricingCard key={plan.title} plan={plan} />
          ))}
        </div>
      </Container>
    </Section>
  );
}

function PricingCard({ plan }: { plan: PricingCardProps }) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-none p-8 sm:p-12 text-left transition-all hover:bg-white/5",
        plan.featured && "bg-white/[0.03]"
      )}
      aria-label={`${plan.title} plan`}
    >
      <div className="text-center">
        <div className="inline-flex items-center gap-2">
          <Badge variant={plan.featured ? "default" : "secondary"} className="rounded-none">{plan.title}</Badge>
          {plan.featured && (
            <span className="rounded-none bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Most popular</span>
          )}
        </div>
        <h4 className="mb-2 mt-4 text-2xl font-bold text-white">{plan.price}</h4>
        {plan.description && <p className="text-sm opacity-70">{plan.description}</p>}
      </div>

      <div className="my-6 border-t border-white/10" />

      <ul className="space-y-4">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-center text-sm opacity-80">
            <CircleCheck className="mr-3 h-4 w-4 text-green-500" aria-hidden />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-8">
        <Link to={plan.href} target="_blank" rel="noreferrer noopener" className="w-full">
          <Button size="sm" className="w-full rounded-none" variant={plan.featured ? "default" : "secondary"}>
            {plan.cta}
          </Button>
        </Link>
      </div>
    </div>
  );
}
