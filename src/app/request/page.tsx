import { redirect } from "next/navigation";

export default async function RequestPage({
  searchParams,
}: {
  searchParams: Promise<{ businessId?: string }>;
}) {
  const params = await searchParams;
  const qs = params.businessId ? `?businessId=${params.businessId}` : "";
  redirect(`/request/new${qs}`);
}
