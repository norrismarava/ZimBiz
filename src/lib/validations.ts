import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^[+]?[\d\s-]+$/, "Invalid phone number"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  accountType: z.enum(["customer", "provider", "business"]),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const businessProfileSchema = z.object({
  name: z.string().min(2, "Business name must be at least 2 characters"),
  shortDescription: z.string().max(200, "Keep it under 200 characters").optional(),
  about: z.string().max(5000).optional(),
  profileType: z.enum(["FORMAL", "INFORMAL"]),
  primaryCategoryId: z.string().uuid().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  whatsappNumber: z.string().optional(),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  yearEstablished: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
});

export const providerProfileSchema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters"),
  bio: z.string().max(3000).optional(),
  skills: z.array(z.string()).default([]),
  experience: z.string().optional(),
  pricingGuidance: z.string().optional(),
  phone: z.string().optional(),
  whatsappNumber: z.string().optional(),
  profileType: z.enum(["FORMAL", "INFORMAL"]).default("INFORMAL"),
});

export const customerRequestSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().max(5000).optional(),
  categoryId: z.string().uuid().optional(),
  businessId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
  preferredDate: z.string().optional(),
  urgency: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  budgetMin: z.number().min(0).optional(),
  budgetMax: z.number().min(0).optional(),
  currency: z.string().default("USD"),
  quantity: z.string().optional(),
  specifications: z.string().optional(),
  siteConditions: z.string().optional(),
  preferredContact: z.enum(["in_app", "email", "phone", "whatsapp"]).default("in_app"),
});

export const quoteSchema = z.object({
  requestId: z.string().uuid().optional(),
  scopeOfWork: z.string().min(3, "Scope of work is required"),
  lineItems: z
    .array(
      z.object({
        description: z.string().min(1),
        quantity: z.number().min(0),
        unit: z.string().optional(),
        unitPrice: z.number().min(0),
        isLabour: z.boolean().default(false),
        isMaterial: z.boolean().default(false),
        isDelivery: z.boolean().default(false),
      })
    )
    .min(1, "At least one line item is required"),
  currency: z.string().default("USD"),
  validityPeriod: z.number().int().min(1).max(365).optional(),
  startDate: z.string().optional(),
  estimatedCompletion: z.string().optional(),
  warranty: z.string().optional(),
  paymentSchedule: z.string().optional(),
  exclusions: z.string().optional(),
  assumptions: z.string().optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
});

export const reviewSchema = z.object({
  businessId: z.string().uuid().optional(),
  providerId: z.string().uuid().optional(),
  workRecordId: z.string().uuid().optional(),
  eligibilityType: z.string(),
  overallRating: z.number().int().min(1).max(5),
  qualityRating: z.number().int().min(1).max(5).optional(),
  customerServiceRating: z.number().int().min(1).max(5).optional(),
  valueRating: z.number().int().min(1).max(5).optional(),
  reliabilityRating: z.number().int().min(1).max(5).optional(),
  communicationRating: z.number().int().min(1).max(5).optional(),
  timelinessRating: z.number().int().min(1).max(5).optional(),
  title: z.string().max(200).optional(),
  body: z.string().max(5000).optional(),
  dateOfExperience: z.string().optional(),
  serviceInvolved: z.string().optional(),
  wouldRecommend: z.boolean().optional(),
});

export const verificationSubmissionSchema = z.object({
  verificationTypeId: z.string().uuid(),
  evidenceType: z.enum(["document", "photo", "reference", "check"]),
  evidenceSource: z.string().optional(),
  verificationMethod: z.string().optional(),
  issuingAuthority: z.string().optional(),
  documentRef: z.string().optional(),
  issueDate: z.string().optional(),
  expiryDate: z.string().optional(),
  publicExplanation: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type BusinessProfileInput = z.infer<typeof businessProfileSchema>;
export type ProviderProfileInput = z.infer<typeof providerProfileSchema>;
export type CustomerRequestInput = z.infer<typeof customerRequestSchema>;
export type QuoteInput = z.infer<typeof quoteSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type VerificationSubmissionInput = z.infer<typeof verificationSubmissionSchema>;
