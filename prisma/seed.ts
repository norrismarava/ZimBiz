import "dotenv/config";
import { PrismaClient, ProfileType, VerificationStatus, BusinessStatus, FreshnessLabel } from "../src/generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import bcrypt from "bcryptjs";

neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // ── Roles & Permissions ──
  const roles = [
    { name: "ADMIN", description: "Full platform access", isSystem: true },
    { name: "VERIFICATION_OFFICER", description: "Review verification submissions", isSystem: true },
    { name: "MODERATOR", description: "Moderate reviews and content", isSystem: true },
    { name: "BUSINESS_OWNER", description: "Owns and manages businesses", isSystem: true },
    { name: "INDIVIDUAL_PROVIDER", description: "Freelance/informal provider", isSystem: true },
    { name: "CUSTOMER", description: "Searches, requests and reviews", isSystem: true },
  ];

  for (const role of roles) {
    const existing = await prisma.role.findUnique({ where: { name: role.name } });
    if (!existing) {
      await prisma.role.create({ data: role });
    }
  }
  console.log("✓ Roles created");

  // ── Permissions ──
  const permissions = [
    { name: "verify:submit", description: "Submit verification documents" },
    { name: "verify:review", description: "Review verification cases" },
    { name: "verify:approve", description: "Approve/reject verification" },
    { name: "business:create", description: "Create business profiles" },
    { name: "business:edit:own", description: "Edit own business profiles" },
    { name: "business:edit:any", description: "Edit any business profile" },
    { name: "quote:create", description: "Submit quotations" },
    { name: "quote:accept", description: "Accept quotations" },
    { name: "review:create", description: "Create reviews" },
    { name: "review:moderate", description: "Moderate reviews" },
    { name: "admin:access", description: "Access admin panel" },
    { name: "category:manage", description: "Manage categories" },
    { name: "location:manage", description: "Manage locations" },
  ];

  for (const perm of permissions) {
    const existing = await prisma.permission.findUnique({ where: { name: perm.name } });
    if (!existing) {
      await prisma.permission.create({ data: perm });
    }
  }

  // Assign all permissions to ADMIN via many-to-many
  const adminRole = await prisma.role.findUnique({ where: { name: "ADMIN" } });
  const allPerms = await prisma.permission.findMany();
  if (adminRole) {
    await prisma.role.update({
      where: { id: adminRole.id },
      data: { permissions: { connect: allPerms.map((p) => ({ id: p.id })) } },
    });
  }

  // Assign verify permissions to VERIFICATION_OFFICER
  const officerRole = await prisma.role.findUnique({ where: { name: "VERIFICATION_OFFICER" } });
  if (officerRole) {
    const verifyPerms = await prisma.permission.findMany({
      where: { name: { in: ["verify:review", "verify:approve"] } },
    });
    await prisma.role.update({
      where: { id: officerRole.id },
      data: { permissions: { connect: verifyPerms.map((p) => ({ id: p.id })) } },
    });
  }
  console.log("✓ Permissions created and assigned");

  // ── Countries & Locations ──
  const zimbabwe = await prisma.country.upsert({
    where: { code: "ZW" },
    update: {},
    create: { name: "Zimbabwe", code: "ZW", currency: "USD", phoneCode: "+263" },
  });

  const harareRegion = await prisma.region.create({
    data: { name: "Harare", countryId: zimbabwe.id, type: "province" },
  });

  const bulawayoRegion = await prisma.region.create({
    data: { name: "Bulawayo", countryId: zimbabwe.id, type: "province" },
  });

  const locationData = [
    { name: "Harare", type: "city", regionId: harareRegion.id, countryId: zimbabwe.id },
    { name: "Bulawayo", type: "city", regionId: bulawayoRegion.id, countryId: zimbabwe.id },
    { name: "Chitungwiza", type: "city", regionId: harareRegion.id, countryId: zimbabwe.id },
    { name: "Mutare", type: "city", countryId: zimbabwe.id },
    { name: "Gweru", type: "city", countryId: zimbabwe.id },
    { name: "Kwekwe", type: "city", countryId: zimbabwe.id },
    { name: "Kadoma", type: "city", countryId: zimbabwe.id },
    { name: "Masvingo", type: "city", countryId: zimbabwe.id },
    { name: "Marondera", type: "town", countryId: zimbabwe.id },
    { name: "Norton", type: "town", countryId: zimbabwe.id },
    { name: "Ruwa", type: "town", countryId: zimbabwe.id },
    { name: "Epworth", type: "town", countryId: zimbabwe.id },
  ];

  const locations: { id: string; name: string }[] = [];
  for (const loc of locationData) {
    const existing = await prisma.location.findFirst({ where: { name: loc.name, countryId: loc.countryId } });
    if (existing) {
      locations.push(existing);
    } else {
      const created = await prisma.location.create({ data: loc });
      locations.push(created);
    }
  }
  const harare = locations.find((l) => l.name === "Harare");
  const bulawayo = locations.find((l) => l.name === "Bulawayo");
  console.log("✓ Locations created");

  // ── Categories ──
  const categories = [
    { name: "Solar & Electrical", slug: "solar-electrical", icon: "sun" },
    { name: "Construction & Boreholes", slug: "construction", icon: "hard-hat" },
    { name: "Automotive", slug: "automotive", icon: "wrench" },
    { name: "Events & Catering", slug: "events", icon: "party-popper" },
  ];

  for (const cat of categories) {
    const existing = await prisma.category.findUnique({ where: { slug: cat.slug } });
    if (!existing) {
      await prisma.category.create({ data: cat });
    }
  }
  console.log("✓ Categories created");

  // ── Verification Types ──
  const verificationTypes = [
    {
      name: "Business Registration",
      slug: "business-registration",
      description: "Company registered with the Companies Registry (CIDO/deeds)",
      publicExplanation: "This business is registered with the Zimbabwean Companies Registry.",
      isFormal: true,
      defaultExpiryMonths: 24,
    },
    {
      name: "Tax Compliance Certificate",
      slug: "tax-compliance",
      description: "Valid ZIMRA tax clearance certificate",
      publicExplanation: "This business has a valid ZIMRA tax clearance certificate.",
      isFormal: true,
      defaultExpiryMonths: 12,
    },
    {
      name: "Phone Verified",
      slug: "phone-verified",
      description: "Phone number confirmed via OTP or call",
      publicExplanation: "This phone number has been confirmed as active.",
      isFormal: false,
      defaultExpiryMonths: 6,
    },
    {
      name: "Location Confirmed",
      slug: "location-confirmed",
      description: "Physical premises visited and confirmed",
      publicExplanation: "A verification officer has visited and confirmed this business location.",
      isFormal: false,
      defaultExpiryMonths: 12,
    },
    {
      name: "Identity Verified",
      slug: "identity-verified",
      description: "National ID or passport confirmed",
      publicExplanation: "The provider's identity has been confirmed.",
      isFormal: false,
      defaultExpiryMonths: 24,
    },
  ];

  for (const vt of verificationTypes) {
    const existing = await prisma.verificationType.findUnique({ where: { slug: vt.slug } });
    if (!existing) {
      await prisma.verificationType.create({ data: vt });
    }
  }
  console.log("✓ Verification types created");

  // ── Demo Users ──
  const passwordHash = await bcrypt.hash("Password123", 12);

  async function createUser(email: string, phone: string, name: string, roleName: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return existing;

    const user = await prisma.user.create({
      data: {
        email,
        phone,
        name,
        passwordHash,
        emailVerified: new Date(),
        phoneVerified: new Date(),
        profile: { create: { displayName: name } },
        notificationPrefs: { create: {} },
      },
    });

    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (role) {
      await prisma.userRole.create({
        data: { userId: user.id, roleId: role.id, scope: "global" },
      }).catch(() => {});
    }
    return user;
  }

  await createUser("admin@zimbiz.co.zw", "+263 77 000 0001", "Admin User", "ADMIN");
  await createUser("officer@zimbiz.co.zw", "+263 77 000 0002", "Verification Officer", "VERIFICATION_OFFICER");
  await createUser("customer@zimbiz.co.zw", "+263 77 999 8888", "Nyasha Customer", "CUSTOMER");
  console.log("✓ Admin, officer and customer users created");

  // ── Demo Businesses ──
  const solarCat = await prisma.category.findUnique({ where: { slug: "solar-electrical" } });
  const constructionCat = await prisma.category.findUnique({ where: { slug: "construction" } });
  const autoCat = await prisma.category.findUnique({ where: { slug: "automotive" } });
  const eventsCat = await prisma.category.findUnique({ where: { slug: "events" } });

  const demoBusinesses = [
    {
      name: "Sunshine Solar Solutions",
      slug: "sunshine-solar-solutions",
      ownerEmail: "owner1@zimbiz.co.zw",
      ownerName: "Tendai Mukamuri",
      ownerPhone: "+263 77 234 5678",
      shortDescription: "Professional solar installations, battery backup systems and electrical repairs across Harare.",
      about: "Sunshine Solar Solutions has been installing solar power systems in Zimbabwe since 2018. We specialize in residential and commercial solar installations, battery backup systems, inverters, and electrical repairs. Our team is certified and we provide warranties on all installations.",
      profileType: ProfileType.FORMAL,
      yearEstablished: 2018,
      phone: "+263 242 234 567",
      email: "info@sunshinesolar.co.zw",
      whatsappNumber: "+263 77 234 5678",
      websiteUrl: "https://sunshinesolar.co.zw",
      primaryCategoryId: solarCat?.id,
      locationId: harare?.id,
      verificationStatus: VerificationStatus.VERIFIED,
      status: BusinessStatus.PUBLISHED,
      averageRating: 4.5,
      reviewCount: 12,
      profileFreshness: FreshnessLabel.RECONFIRMED_THIS_MONTH,
    },
    {
      name: "Bvumai Borehole Drillers",
      slug: "bvumai-borehole-drillers",
      ownerEmail: "owner2@zimbiz.co.zw",
      ownerName: "Chipo Bvumai",
      ownerPhone: "+263 78 345 6789",
      shortDescription: "Borehole drilling, pump installation and water solutions in Harare and surrounding areas.",
      about: "Bvumai Borehole Drillers provides professional borehole drilling services, pump installation, and water testing. We serve residential, commercial, and agricultural clients across Mashonaland.",
      profileType: ProfileType.FORMAL,
      yearEstablished: 2015,
      phone: "+263 242 345 678",
      email: "info@bvumaiboreholes.co.zw",
      whatsappNumber: "+263 78 345 6789",
      primaryCategoryId: constructionCat?.id,
      locationId: harare?.id,
      verificationStatus: VerificationStatus.VERIFIED,
      status: BusinessStatus.PUBLISHED,
      averageRating: 4.2,
      reviewCount: 8,
      profileFreshness: FreshnessLabel.RECONFIRMED_THIS_WEEK,
    },
    {
      name: "Mafaro Auto Workshop",
      slug: "mafaro-auto-workshop",
      ownerEmail: "owner3@zimbiz.co.zw",
      ownerName: "Dumisani Mafaro",
      ownerPhone: "+263 71 456 7890",
      shortDescription: "Mobile mechanic and auto repair services in Bulawayo. Toyota, Nissan, Mazda specialists.",
      about: "Mafaro Auto Workshop offers reliable automotive repair services in Bulawayo. We specialize in Toyota, Nissan, and Mazda vehicles but work on all makes. Mobile service available.",
      profileType: ProfileType.FORMAL,
      yearEstablished: 2019,
      phone: "+263 29 456 789",
      whatsappNumber: "+263 71 456 7890",
      primaryCategoryId: autoCat?.id,
      locationId: bulawayo?.id,
      verificationStatus: VerificationStatus.PENDING,
      status: BusinessStatus.PUBLISHED,
      averageRating: 4.0,
      reviewCount: 5,
      profileFreshness: FreshnessLabel.UPDATED_QUARTER_AGO,
    },
    {
      name: "Tariro Catering Services",
      slug: "tariro-catering-services",
      ownerEmail: "owner4@zimbiz.co.zw",
      ownerName: "Tariro Ncube",
      ownerPhone: "+263 77 567 8901",
      shortDescription: "Events catering, wedding coordination and equipment hire in Harare.",
      about: "Tariro Catering Services provides full-service catering for weddings, corporate events, and private functions. We also offer event equipment hire including tents, chairs, and tables.",
      profileType: ProfileType.INFORMAL,
      yearEstablished: 2020,
      phone: "+263 77 567 8901",
      whatsappNumber: "+263 77 567 8901",
      primaryCategoryId: eventsCat?.id,
      locationId: harare?.id,
      verificationStatus: VerificationStatus.NOT_SUBMITTED,
      status: BusinessStatus.PUBLISHED,
      averageRating: 4.8,
      reviewCount: 15,
      profileFreshness: FreshnessLabel.RECONFIRMED_THIS_MONTH,
    },
  ];

  for (const biz of demoBusinesses) {
    const { ownerEmail, ownerName, ownerPhone, locationId, ...bizData } = biz;

    const owner = await createUser(ownerEmail, ownerPhone, ownerName, "BUSINESS_OWNER");

    const address = locationId
      ? await prisma.address.create({
          data: {
            line1: "TBD",
            locationId,
          },
        })
      : null;

    const existing = await prisma.business.findUnique({ where: { slug: bizData.slug } });
    if (!existing) {
      await prisma.business.create({
        data: {
          ...bizData,
          ownerId: owner.id,
          addressId: address?.id,
          isClaimed: true,
        },
      });
    }
  }
  console.log("✓ Demo businesses created");

  console.log("🌱 Seed complete!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Demo accounts (password: Password123):");
  console.log("  Admin:    admin@zimbiz.co.zw");
  console.log("  Officer:  officer@zimbiz.co.zw");
  console.log("  Customer: customer@zimbiz.co.zw");
  console.log("  Owners:   owner1-4@zimbiz.co.zw");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
