import { Star, MessageSquare, ShieldCheck, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReviewPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-[#111827] mb-6">Review Policy</h1>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="h-5 w-5 text-[#D4A017]" />
              Interaction-Linked Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[#334155]">
              Reviews on ZimBiz Connect are linked to real interactions between customers and businesses.
              This means reviews reflect actual experiences, not anonymous opinions.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-[#047857]" />
              Multi-Dimensional Ratings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[#334155]">
              Reviews include multiple dimensions such as quality, communication, timeliness and value.
              This gives a more complete picture than a single star rating.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#047857]" />
              Business Responses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[#334155]">
              Businesses can respond to reviews publicly. This creates transparency and helps resolve
              disputes constructively.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-[#D4A017]" />
              Moderation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[#334155]">
              Reviews that contain hate speech, personal attacks, or false information may be removed
              after moderation. Businesses can flag reviews for review by our moderation team.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
