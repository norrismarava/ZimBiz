export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-[#111827] mb-6">Privacy Policy</h1>
      <div className="prose prose-sm max-w-none text-[#334155]">
        <p className="text-sm text-[#64748B]">
          Your privacy is important to us. This policy explains how we collect, use and protect your data.
        </p>
        <h2 className="text-lg font-semibold text-[#111827] mt-6 mb-2">1. Data We Collect</h2>
        <p>We collect your name, email, phone number, and activity on the platform such as requests and reviews.</p>
        <h2 className="text-lg font-semibold text-[#111827] mt-6 mb-2">2. How We Use Data</h2>
        <p>We use your data to provide search, quotation, and review services. We do not sell your personal information.</p>
        <h2 className="text-lg font-semibold text-[#111827] mt-6 mb-2">3. Data Security</h2>
        <p>We use industry-standard security practices including password hashing and encrypted connections.</p>
        <h2 className="text-lg font-semibold text-[#111827] mt-6 mb-2">4. Your Rights</h2>
        <p>You can request access to, correction of, or deletion of your personal data at any time.</p>
        <p className="text-xs text-[#64748B] mt-8">Last updated: {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}
