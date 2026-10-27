import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: [
      "Business profile with basic information",
      "Appear in search results",
      "Receive customer requests",
      "Respond to reviews",
    ],
    highlight: false,
  },
  {
    name: "Verified",
    price: "$15",
    period: "per month",
    features: [
      "Everything in Free",
      "Submit verification documents",
      "Trust Passport badge on profile",
      "Priority in search ranking",
      "Freshness reconfirmation reminders",
    ],
    highlight: true,
  },
  {
    name: "Premium",
    price: "$35",
    period: "per month",
    features: [
      "Everything in Verified",
      "Promoted placement in search",
      "Analytics dashboard",
      "Multiple team members",
      "API access for integrations",
      "Dedicated support",
    ],
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-10">
        <h1 className="text-2xl font-bold text-[#111827]">Pricing</h1>
        <p className="text-sm text-[#64748B] mt-2">
          Simple, transparent pricing for Zimbabwean businesses
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.name} className={plan.highlight ? "border-[#047857]" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                {plan.highlight && <Badge variant="success">Popular</Badge>}
              </div>
              <div className="mt-2">
                <span className="text-3xl font-bold text-[#111827]">{plan.price}</span>
                <span className="text-sm text-[#64748B]"> /{plan.period}</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-[#334155]">
                    <CheckCircle2 className="h-4 w-4 text-[#059669] flex-shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-center text-xs text-[#64748B] mt-8">
        All prices in USD. Pricing for the Zimbabwean market may vary. Contact us for enterprise plans.
      </p>
    </div>
  );
}
