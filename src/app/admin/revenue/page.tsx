import { redirect } from "next/navigation";
import Link from "next/link";
import { DollarSign, Users, CreditCard, Layers, TrendingUp, Tag, PhoneCall } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminRevenuePage() {
  const user = await getCurrentUser().catch(() => null);
  if (!user) redirect("/auth/login");

  const isAdmin = user.userRoles.some(
    (ur: { role: { name: string } }) => ur.role.name === "ADMIN"
  );
  if (!isAdmin) redirect("/dashboard");

  const [plans, subscriptions, paidInvoices, pendingInvoices, promotions, leads] =
    await Promise.all([
      prisma.subscriptionPlan.findMany({
        orderBy: { sortOrder: "asc" },
        include: { _count: { select: { subscriptions: true } } },
      }),
      prisma.subscription.findMany({
        include: {
          business: { select: { name: true, slug: true } },
          plan: true,
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.invoice.aggregate({
        _sum: { amount: true },
        _count: true,
        where: { status: "PAID" },
      }),
      prisma.invoice.count({ where: { status: "PENDING" } }),
      prisma.promotion.count(),
      prisma.lead.count(),
    ]);

  const activeSubs = subscriptions.filter((s) => s.status === "ACTIVE");
  const mrr = activeSubs.reduce((sum, s) => sum + Number(s.plan.priceMonthly), 0);
  const paidTotal = Number(paidInvoices._sum.amount ?? 0);

  const stats = [
    { icon: DollarSign, label: "Monthly recurring revenue", value: `$${mrr.toFixed(2)}`, sub: `${activeSubs.length} active subscriptions` },
    { icon: CreditCard, label: "Collected (paid invoices)", value: `$${paidTotal.toFixed(2)}`, sub: `${paidInvoices._count} paid, ${pendingInvoices} pending` },
    { icon: Users, label: "Total subscribers", value: subscriptions.length.toString(), sub: "across all plans" },
    { icon: TrendingUp, label: "Other revenue levers", value: `${promotions + leads}`, sub: `${promotions} promotions · ${leads} leads` },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Badge variant="success" className="mb-2">Admin</Badge>
        <h1 className="text-2xl font-bold text-[#111827]">Revenue Console</h1>
        <p className="text-sm text-[#64748B] mt-1">
          Subscriptions, invoices and monetization levers
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#047857]/10 text-[#047857] mb-3">
                <s.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="text-xs font-medium text-[#64748B]">{s.label}</p>
              <p className="text-2xl font-bold text-[#111827] mt-1">{s.value}</p>
              <p className="text-xs text-[#64748B] mt-1">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Plans */}
      <Card className="mb-10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-[#047857]" aria-hidden="true" />
            Subscription plans
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#DDE7E2] text-left text-xs text-[#64748B]">
                  <th className="px-5 py-3 font-medium">Plan</th>
                  <th className="px-5 py-3 font-medium">Monthly</th>
                  <th className="px-5 py-3 font-medium">Annual</th>
                  <th className="px-5 py-3 font-medium">Subscribers</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((p) => (
                  <tr key={p.id} className="border-b border-[#DDE7E2] last:border-0">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-[#111827]">{p.name}</p>
                      <p className="text-xs text-[#64748B]">{p.description}</p>
                    </td>
                    <td className="px-5 py-3 font-medium text-[#111827]">
                      ${Number(p.priceMonthly).toFixed(2)}
                    </td>
                    <td className="px-5 py-3 text-[#334155]">
                      {p.priceAnnual ? `$${Number(p.priceAnnual).toFixed(2)}` : "—"}
                    </td>
                    <td className="px-5 py-3 text-[#334155]">{p._count.subscriptions}</td>
                    <td className="px-5 py-3">
                      <Badge variant={p.isActive ? "success" : "neutral"}>
                        {p.isActive ? "Active" : "Disabled"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PhoneCall className="h-5 w-5 text-[#047857]" aria-hidden="true" />
            Subscriptions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {subscriptions.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-[#64748B]">
                No subscriptions yet. Payments integration (Paynow/Stripe) is the next
                step — once a business upgrades, it appears here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#DDE7E2] text-left text-xs text-[#64748B]">
                    <th className="px-5 py-3 font-medium">Business</th>
                    <th className="px-5 py-3 font-medium">Plan</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Period ends</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((s) => (
                    <tr key={s.id} className="border-b border-[#DDE7E2] last:border-0">
                      <td className="px-5 py-3">
                        {s.business ? (
                          <Link href={`/business/${s.business.slug}`} className="font-medium text-[#047857] hover:underline">
                            {s.business.name}
                          </Link>
                        ) : (
                          <span className="text-[#64748B]">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3 font-medium text-[#111827]">{s.plan.name}</td>
                      <td className="px-5 py-3">
                        <Badge variant={s.status === "ACTIVE" ? "success" : "neutral"}>
                          {s.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-[#334155]">
                        {s.currentPeriodEnd
                          ? s.currentPeriodEnd.toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
