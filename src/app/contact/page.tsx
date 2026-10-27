import { Mail, Phone, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-[#111827] mb-6">Contact Us</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 text-center">
            <Mail className="h-8 w-8 text-[#047857] mx-auto mb-2" />
            <h2 className="font-semibold text-sm text-[#111827]">Email</h2>
            <p className="text-sm text-[#64748B] mt-1">hello@zimbiz.co.zw</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 text-center">
            <Phone className="h-8 w-8 text-[#047857] mx-auto mb-2" />
            <h2 className="font-semibold text-sm text-[#111827]">Phone</h2>
            <p className="text-sm text-[#64748B] mt-1">+263 242 000 000</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 text-center">
            <MapPin className="h-8 w-8 text-[#047857] mx-auto mb-2" />
            <h2 className="font-semibold text-sm text-[#111827]">Location</h2>
            <p className="text-sm text-[#64748B] mt-1">Harare, Zimbabwe</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
