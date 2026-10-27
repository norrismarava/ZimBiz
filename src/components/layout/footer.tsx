import Link from "next/link";

const footerLinks = {
  Platform: [
    { href: "/search", label: "Find Businesses" },
    { href: "/categories", label: "Categories" },
    { href: "/request", label: "Request Quotes" },
    { href: "/how-it-works", label: "How It Works" },
  ],
  Trust: [
    { href: "/verification", label: "Verification Explained" },
    { href: "/review-policy", label: "Review Policy" },
    { href: "/safety", label: "Safety Centre" },
    { href: "/report", label: "Report a Concern" },
  ],
  Business: [
    { href: "/auth/register", label: "List Your Business" },
    { href: "/pricing", label: "Pricing" },
    { href: "/auth/register?type=provider", label: "Become a Provider" },
    { href: "/diaspora", label: "Diaspora Procurement" },
  ],
  Company: [
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/help", label: "Help Centre" },
    { href: "/terms", label: "Terms" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-[#DDE7E2] bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <img src="/logo.svg" alt="ZimBiz Connect" className="h-9 w-9" />
              <div>
                <span className="text-lg font-bold text-[#064E3B]">ZimBiz</span>
                <span className="text-lg font-semibold text-[#047857]"> Connect</span>
              </div>
            </Link>
            <p className="text-sm text-[#64748B] max-w-xs">
              Zimbabwe&apos;s trusted business network. Discover businesses, inspect
              verified information, compare quotations and learn from genuine customer
              experiences.
            </p>
            <p className="text-sm font-semibold text-[#047857] mt-3 tracking-wide">
              Discover · Verify · Connect
            </p>
          </div>

          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3 className="text-sm font-semibold text-[#111827] mb-3">{section}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#64748B] hover:text-[#047857] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-8 border-t border-[#DDE7E2] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[#64748B]">
            © {new Date().getFullYear()} ZimBiz Connect. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/privacy" className="text-xs text-[#64748B] hover:text-[#047857]">
              Privacy
            </Link>
            <Link href="/terms" className="text-xs text-[#64748B] hover:text-[#047857]">
              Terms
            </Link>
            <Link href="/cookies" className="text-xs text-[#64748B] hover:text-[#047857]">
              Cookie Preferences
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
