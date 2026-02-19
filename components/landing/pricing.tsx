"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { viewportFadeIn } from "@/lib/motion";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: [
      { label: "Alpha Card titles & categories", included: true },
      { label: "Momentum scores & direction", included: true },
      { label: "Entity tags", included: true },
      { label: "Full thesis & strategy", included: false },
      { label: "Risk factors & evidence", included: false },
      { label: "Build This blueprints", included: false },
    ],
    cta: "Start Free",
    href: "/signup",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/mo",
    features: [
      { label: "Everything in Free", included: true },
      { label: "Full thesis & strategy", included: true },
      { label: "Risk factors & evidence", included: true },
      { label: "Build This blueprints", included: true },
      { label: "Friction details & opportunity windows", included: true },
      { label: "Priority signal processing", included: true },
    ],
    cta: "Get Pro",
    href: "/signup",
    highlight: true,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="px-6 py-20 max-w-4xl mx-auto">
      <motion.div {...viewportFadeIn()}>
        <h2 className="text-3xl font-bold text-center mb-2">Simple pricing</h2>
        <p className="text-text-muted text-center mb-12 text-sm">
          Start free. Upgrade when you need the full picture.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              padding="spacious"
              className={`relative flex flex-col ${
                plan.highlight
                  ? "border-accent-green/40 shadow-glow"
                  : ""
              }`}
            >
              {plan.highlight && (
                <Badge
                  variant="success"
                  shape="pill"
                  className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent-green text-bg font-bold px-3"
                >
                  RECOMMENDED
                </Badge>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-text-muted text-sm">
                    {plan.period}
                  </span>
                </div>
              </div>

              <ul className="space-y-3 flex-1 mb-6">
                {plan.features.map((f) => (
                  <li
                    key={f.label}
                    className="flex items-start gap-2 text-sm"
                  >
                    {f.included ? (
                      <Check className="size-4 text-accent-green shrink-0 mt-0.5" />
                    ) : (
                      <X className="size-4 text-text-muted/40 shrink-0 mt-0.5" />
                    )}
                    <span
                      className={
                        f.included ? "text-text" : "text-text-muted/60"
                      }
                    >
                      {f.label}
                    </span>
                  </li>
                ))}
              </ul>

              <ButtonLink
                href={plan.href}
                variant={plan.highlight ? "primary" : "secondary"}
                className="w-full justify-center"
              >
                {plan.cta}
              </ButtonLink>
            </Card>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
