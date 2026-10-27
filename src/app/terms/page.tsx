export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-[#111827] mb-6">Terms of Service</h1>
      <div className="prose prose-sm max-w-none text-[#334155]">
        <p className="text-sm text-[#64748B]">
          These terms govern your use of ZimBiz Connect. By using the platform, you agree to these terms.
        </p>
        <h2 className="text-lg font-semibold text-[#111827] mt-6 mb-2">1. Acceptable Use</h2>
        <p>You agree to use ZimBiz Connect lawfully and not to post false or misleading information.</p>
        <h2 className="text-lg font-semibold text-[#111827] mt-6 mb-2">2. Business Listings</h2>
        <p>Businesses are responsible for the accuracy of their profile information. ZimBiz Connect verifies specific claims but does not guarantee the quality of services.</p>
        <h2 className="text-lg font-semibold text-[#111827] mt-6 mb-2">3. Reviews</h2>
        <p>Reviews must reflect genuine experiences. Fake or malicious reviews may be removed.</p>
        <h2 className="text-lg font-semibold text-[#111827] mt-6 mb-2">4. Liability</h2>
        <p>ZimBiz Connect is a directory platform. We are not liable for transactions between users and businesses.</p>
        <p className="text-xs text-[#64748B] mt-8">Last updated: {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}
