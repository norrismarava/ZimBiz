"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FileText, Plus, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input, Textarea, Select, Label, Field } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Location {
  id: string;
  name: string;
  type: string;
}

function CreateRequestForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/locations").then((r) => r.json()),
    ]).then(([cats, locs]) => {
      if (cats.data) setCategories(cats.data);
      if (locs.data) setLocations(locs.data);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const payload = {
      title: formData.get("title"),
      description: formData.get("description"),
      categoryId: formData.get("categoryId") || undefined,
      businessId: searchParams.get("businessId") || undefined,
      locationId: formData.get("locationId") || undefined,
      urgency: formData.get("urgency"),
      budgetMin: formData.get("budgetMin") ? Number(formData.get("budgetMin")) : undefined,
      budgetMax: formData.get("budgetMax") ? Number(formData.get("budgetMax")) : undefined,
      preferredDate: formData.get("preferredDate") || undefined,
      preferredContact: formData.get("preferredContact"),
      specifications: formData.get("specifications") || undefined,
      siteConditions: formData.get("siteConditions") || undefined,
    };

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create request");
        if (data.details) {
          const detailMsg = Object.entries(data.details)
            .map(([k, v]) => `${k}: ${(v as string[]).join(", ")}`)
            .join("; ");
          setError(`${data.error} — ${detailMsg}`);
        }
        return;
      }

      router.push(`/request/${data.id}`);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827]">Request Quotations</h1>
        <p className="text-sm text-[#64748B] mt-1">
          Describe what you need. Verified businesses will respond with structured quotations.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>What do you need?</CardTitle>
            <CardDescription>Be specific so businesses can give accurate quotes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Title" required hint="A clear summary of what you need">
              <Input
                name="title"
                placeholder="e.g. 5kW solar installation with battery backup"
                required
                minLength={3}
              />
            </Field>

            <Field label="Description" hint="Include any details that would help businesses quote accurately">
              <Textarea
                name="description"
                placeholder="Describe your requirements in detail..."
                rows={5}
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Category">
                <Select name="categoryId" defaultValue={searchParams.get("categoryId") || ""}>
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Location">
                <Select name="locationId" defaultValue={searchParams.get("locationId") || ""}>
                  <option value="">Select a location</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <Field label="Urgency">
              <Select name="urgency" defaultValue="normal">
                <option value="low">Low — within a month</option>
                <option value="normal">Normal — within 2 weeks</option>
                <option value="high">High — within a few days</option>
                <option value="urgent">Urgent — ASAP</option>
              </Select>
            </Field>
          </CardContent>
        </Card>

        {/* Budget & Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Budget & Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Budget minimum (USD)" hint="Optional — helps filter responses">
                <Input
                  name="budgetMin"
                  type="number"
                  min={0}
                  placeholder="0"
                />
              </Field>
              <Field label="Budget maximum (USD)" hint="Optional — helps filter responses">
                <Input
                  name="budgetMax"
                  type="number"
                  min={0}
                  placeholder="5000"
                />
              </Field>
            </div>

            <Field label="Preferred date" hint="When would you like this done?">
              <Input
                name="preferredDate"
                type="date"
              />
            </Field>
          </CardContent>
        </Card>

        {/* Additional Details */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Details</CardTitle>
            <CardDescription>Help businesses give you the most accurate quotation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Specifications" hint="Brand preferences, model numbers, sizes, quantities, etc.">
              <Textarea
                name="specifications"
                placeholder="e.g. 12 x 450W panels, 5kW inverter, 10kWh lithium battery..."
                rows={3}
              />
            </Field>

            <Field label="Site conditions" hint="Access, roof type, existing wiring, etc.">
              <Textarea
                name="siteConditions"
                placeholder="e.g. Single storey, tile roof, existing DB board..."
                rows={3}
              />
            </Field>

            <Field label="Preferred contact method">
              <Select name="preferredContact" defaultValue="in_app">
                <option value="in_app">In-app messages</option>
                <option value="email">Email</option>
                <option value="phone">Phone call</option>
                <option value="whatsapp">WhatsApp</option>
              </Select>
            </Field>
          </CardContent>
        </Card>

        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-[#DC2626]/10 border border-[#DC2626]/20 px-4 py-3 text-sm text-[#DC2626]">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} size="lg">
            <FileText className="h-5 w-5" />
            Submit Request
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function CreateRequestPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-[#64748B]">Loading...</p></div>}>
      <CreateRequestForm />
    </Suspense>
  );
}
