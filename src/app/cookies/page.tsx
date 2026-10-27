export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-[#111827] mb-6">Cookie Preferences</h1>
      <div className="prose prose-sm max-w-none text-[#334155]">
        <p className="text-sm text-[#64748B]">
          ZimBiz Connect uses cookies to keep you signed in and remember your preferences.
        </p>
        <h2 className="text-lg font-semibold text-[#111827] mt-6 mb-2">Essential Cookies</h2>
        <p>These cookies are required for the platform to function. They include your session cookie for authentication.</p>
        <h2 className="text-lg font-semibold text-[#111827] mt-6 mb-2">Analytics Cookies</h2>
        <p>We may use analytics cookies to understand how the platform is used. You can opt out at any time.</p>
        <p className="text-xs text-[#64748B] mt-8">Last updated: {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}
