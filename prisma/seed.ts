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
    { name: "Solar & Electrical", slug: "solar-electrical", icon: "sun", imageUrl: "/images/solar-electrical.jpg", sortOrder: 1, description: "Solar installers, backup power, generators, electrical repairs" },
    { name: "Construction & Boreholes", slug: "construction", icon: "hard-hat", imageUrl: "/images/construction.jpg", sortOrder: 2, description: "Builders, borehole drillers, renovations and maintenance" },
    { name: "Automotive", slug: "automotive", icon: "wrench", imageUrl: "/images/automotive.jpg", sortOrder: 3, description: "Workshops, mobile mechanics, spare parts, detailing" },
    { name: "Events & Catering", slug: "events", icon: "party-popper", imageUrl: "/images/events.jpg", sortOrder: 4, description: "Caterers, decorators, equipment hire, coordinators" },
    { name: "Plumbing & Water", slug: "plumbing", icon: "droplets", imageUrl: "/images/plumbing.jpg", sortOrder: 5, description: "Plumbers, borehole pumps, water tanks and reticulation" },
    { name: "Agriculture & Farming", slug: "agriculture", icon: "wheat", imageUrl: "/images/agriculture.jpg", sortOrder: 6, description: "Farm supplies, horticulture, poultry and livestock" },
    { name: "Beauty & Grooming", slug: "beauty", icon: "scissors", imageUrl: "/images/beauty.jpg", sortOrder: 7, description: "Salons, barbershops, spas and cosmetics" },
    { name: "Health & Wellness", slug: "health", icon: "heart-pulse", imageUrl: "/images/health.jpg", sortOrder: 8, description: "Clinics, pharmacies, therapists and wellness" },
    { name: "Education & Tutoring", slug: "education", icon: "graduation-cap", imageUrl: "/images/education.jpg", sortOrder: 9, description: "Tutors, driving schools, training centres" },
    { name: "IT & Tech Services", slug: "it-services", icon: "laptop", imageUrl: "/images/it-services.jpg", sortOrder: 10, description: "Web design, computer repairs, networking, software" },
    { name: "Cleaning & Fumigation", slug: "cleaning", icon: "sparkles", imageUrl: "/images/cleaning.jpg", sortOrder: 11, description: "Home & office cleaning, pest control, laundry" },
    { name: "Transport & Logistics", slug: "transport", icon: "truck", imageUrl: "/images/transport.jpg", sortOrder: 12, description: "Movers, couriers, freight and vehicle hire" },
    { name: "Property & Real Estate", slug: "real-estate", icon: "building", imageUrl: "/images/real-estate.jpg", sortOrder: 13, description: "Estate agents, conveyancers, property valuers" },
    { name: "Fashion & Tailoring", slug: "fashion", icon: "shirt", imageUrl: "/images/fashion.jpg", sortOrder: 14, description: "Tailors, boutiques, alterations, uniforms" },
    { name: "Security Services", slug: "security", icon: "shield", imageUrl: "/images/security.jpg", sortOrder: 15, description: "Guards, alarms, CCTV, access control" },
    { name: "Photography & Media", slug: "photography", icon: "camera", imageUrl: "/images/photography.jpg", sortOrder: 16, description: "Photographers, videographers, drone operators" },
    { name: "Hospitality & Food", slug: "hospitality", icon: "utensils", imageUrl: "/images/hospitality.jpg", sortOrder: 17, description: "Restaurants, cafes, takeaways, lodges" },
    { name: "Legal & Finance", slug: "legal", icon: "scale", imageUrl: "/images/legal.jpg", sortOrder: 18, description: "Lawyers, accountants, insurance, consultants" },
  ];

  for (const cat of categories) {
    const existing = await prisma.category.findUnique({ where: { slug: cat.slug } });
    if (!existing) {
      await prisma.category.create({ data: cat });
    } else if (!existing.imageUrl || !existing.description) {
      await prisma.category.update({
        where: { id: existing.id },
        data: { imageUrl: cat.imageUrl, description: cat.description, sortOrder: cat.sortOrder },
      });
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

  // ── Subscription Plans ──
  const plans = [
    {
      name: "Free",
      description: "Get listed and start receiving requests",
      priceMonthly: 0,
      priceAnnual: 0,
      currency: "USD",
      sortOrder: 0,
      features: [
        "Business listing with contact details",
        "Respond to customer requests",
        "Collect verified reviews",
        "Basic profile freshness tracking",
      ],
    },
    {
      name: "Business Pro",
      description: "For providers who want to grow faster",
      priceMonthly: 15,
      priceAnnual: 150,
      currency: "USD",
      sortOrder: 1,
      features: [
        "Everything in Free",
        "Priority placement in search results",
        "Verified badge fast-track",
        "Unlimited quotes per month",
        "Portfolio gallery (up to 20 photos)",
        "View customer phone numbers directly",
      ],
    },
    {
      name: "Enterprise",
      description: "For multi-branch businesses and agencies",
      priceMonthly: 45,
      priceAnnual: 450,
      currency: "USD",
      sortOrder: 2,
      features: [
        "Everything in Business Pro",
        "Up to 5 branches under one account",
        "Team seats for staff",
        "Featured category placement",
        "Analytics dashboard",
        "Priority support",
      ],
    },
  ];

  for (const plan of plans) {
    const existing = await prisma.subscriptionPlan.findUnique({ where: { name: plan.name } });
    if (!existing) {
      await prisma.subscriptionPlan.create({ data: plan });
    }
  }
  console.log("✓ Subscription plans created");

  // ── Demo Businesses ──
  const allCats = await prisma.category.findMany();
  const catId = Object.fromEntries(allCats.map((c) => [c.slug, c.id]));
  const locId = Object.fromEntries(locations.map((l) => [l.name, l.id]));
  const streetByLoc: Record<string, string> = {
    Harare: "12 Samora Machel Avenue",
    Bulawayo: "14 Fife Street",
    Mutare: "7 Herbert Chitepo Street",
    Gweru: "11 Robert Mugabe Way",
    Kwekwe: "5 Nelson Mandela Way",
    Masvingo: "18 Simon Mazorodze Road",
    Chitungwiza: "3 Town Centre",
    Marondera: "9 The Green",
  };

  type DemoBiz = {
    name: string;
    slug: string;
    ownerEmail: string;
    ownerName: string;
    ownerPhone: string;
    shortDescription: string;
    about: string;
    cat: string;
    loc: string;
    img: string;
    verified: VerificationStatus;
    rating: number;
    reviews: number;
    year: number;
    phone: string;
    whatsapp: string;
    profileType?: ProfileType;
    freshness?: FreshnessLabel;
  };

  const demoBusinesses: DemoBiz[] = [
    {
      name: "Sunshine Solar Solutions", slug: "sunshine-solar-solutions",
      ownerEmail: "owner1@zimbiz.co.zw", ownerName: "Tendai Mukamuri", ownerPhone: "+263 77 234 5678",
      shortDescription: "Professional solar installations, battery backup systems and electrical repairs across Harare.",
      about: "Sunshine Solar Solutions has been installing solar power systems in Zimbabwe since 2018. We specialize in residential and commercial solar installations, battery backup systems, inverters, and electrical repairs. Our team is certified and we provide warranties on all installations.",
      cat: "solar-electrical", loc: "Harare", img: "solar-electrical",
      verified: VerificationStatus.VERIFIED, rating: 4.5, reviews: 12, year: 2018,
      phone: "+263 242 234 567", whatsapp: "+263 77 234 5678",
      freshness: FreshnessLabel.RECONFIRMED_THIS_MONTH,
    },
    {
      name: "PowerUp Energy Systems", slug: "powerup-energy-systems",
      ownerEmail: "owner5@zimbiz.co.zw", ownerName: "Nyasha Gumbo", ownerPhone: "+263 77 111 2233",
      shortDescription: "Lithium batteries, inverters and complete solar packages for homes and SMEs.",
      about: "PowerUp Energy Systems supplies and installs lithium batteries, inverters, solar panels and full backup systems. We offer site assessments, financing options and after-sales support across Harare.",
      cat: "solar-electrical", loc: "Harare", img: "solar-electrical",
      verified: VerificationStatus.VERIFIED, rating: 4.7, reviews: 18, year: 2019,
      phone: "+263 242 111 223", whatsapp: "+263 77 111 2233",
      freshness: FreshnessLabel.RECONFIRMED_THIS_WEEK,
    },
    {
      name: "VoltZim Electricals", slug: "voltzim-electricals",
      ownerEmail: "owner6@zimbiz.co.zw", ownerName: "Farai Zhou", ownerPhone: "+263 78 222 3344",
      shortDescription: "Domestic and industrial electrical installations, fault finding and COC certificates.",
      about: "VoltZim Electricals handles new wiring, repairs, compliance certificates and generator changeover systems in the Midlands region.",
      cat: "solar-electrical", loc: "Gweru", img: "solar-electrical",
      verified: VerificationStatus.PENDING, rating: 4.1, reviews: 6, year: 2021,
      phone: "+263 54 222 334", whatsapp: "+263 78 222 3344",
      freshness: FreshnessLabel.UPDATED_QUARTER_AGO,
    },
    {
      name: "Bvumai Borehole Drillers", slug: "bvumai-borehole-drillers",
      ownerEmail: "owner2@zimbiz.co.zw", ownerName: "Chipo Bvumai", ownerPhone: "+263 78 345 6789",
      shortDescription: "Borehole drilling, pump installation and water solutions in Harare and surrounding areas.",
      about: "Bvumai Borehole Drillers provides professional borehole drilling services, pump installation, and water testing. We serve residential, commercial, and agricultural clients across Mashonaland.",
      cat: "construction", loc: "Harare", img: "construction",
      verified: VerificationStatus.VERIFIED, rating: 4.2, reviews: 8, year: 2015,
      phone: "+263 242 345 678", whatsapp: "+263 78 345 6789",
      freshness: FreshnessLabel.RECONFIRMED_THIS_WEEK,
    },
    {
      name: "BuildRight Contractors", slug: "buildright-contractors",
      ownerEmail: "owner7@zimbiz.co.zw", ownerName: "Takura Moyo", ownerPhone: "+263 77 333 4455",
      shortDescription: "New builds, extensions, roofing and renovations — residential and commercial.",
      about: "BuildRight Contractors is a registered building company delivering quality construction projects across Harare. From plans to handover, we manage the full build.",
      cat: "construction", loc: "Harare", img: "construction",
      verified: VerificationStatus.VERIFIED, rating: 4.6, reviews: 21, year: 2014,
      phone: "+263 242 333 445", whatsapp: "+263 77 333 4455",
      freshness: FreshnessLabel.RECONFIRMED_THIS_MONTH,
    },
    {
      name: "AquaDrill Boreholes", slug: "aquadrill-boreholes",
      ownerEmail: "owner8@zimbiz.co.zw", ownerName: "Rudo Chikafu", ownerPhone: "+263 78 444 5566",
      shortDescription: "Borehole siting, drilling, casing and pump fitting in Manicaland.",
      about: "AquaDrill Boreholes covers Mutare and surrounds with surveying, drilling and solar pump installations. Free quotations within Manicaland.",
      cat: "construction", loc: "Mutare", img: "construction",
      verified: VerificationStatus.NOT_SUBMITTED, rating: 4.3, reviews: 9, year: 2017,
      phone: "+263 20 444 556", whatsapp: "+263 78 444 5566",
      freshness: FreshnessLabel.UPDATED_QUARTER_AGO,
    },
    {
      name: "Mafaro Auto Workshop", slug: "mafaro-auto-workshop",
      ownerEmail: "owner3@zimbiz.co.zw", ownerName: "Dumisani Mafaro", ownerPhone: "+263 71 456 7890",
      shortDescription: "Mobile mechanic and auto repair services in Bulawayo. Toyota, Nissan, Mazda specialists.",
      about: "Mafaro Auto Workshop offers reliable automotive repair services in Bulawayo. We specialize in Toyota, Nissan, and Mazda vehicles but work on all makes. Mobile service available.",
      cat: "automotive", loc: "Bulawayo", img: "automotive",
      verified: VerificationStatus.PENDING, rating: 4.0, reviews: 5, year: 2019,
      phone: "+263 29 456 789", whatsapp: "+263 71 456 7890",
      freshness: FreshnessLabel.UPDATED_QUARTER_AGO,
    },
    {
      name: "Torque Motors Garage", slug: "torque-motors-garage",
      ownerEmail: "owner9@zimbiz.co.zw", ownerName: "Sipho Nkomo", ownerPhone: "+263 71 555 6677",
      shortDescription: "Full-service garage: engine diagnostics, suspension, brakes and auto-electrical.",
      about: "Torque Motors Garage is a Bulawayo institution for diagnostics, servicing and repairs on all makes. Dealer-level diagnostics without dealer prices.",
      cat: "automotive", loc: "Bulawayo", img: "automotive",
      verified: VerificationStatus.VERIFIED, rating: 4.4, reviews: 14, year: 2012,
      phone: "+263 29 555 667", whatsapp: "+263 71 555 6677",
      freshness: FreshnessLabel.RECONFIRMED_THIS_MONTH,
    },
    {
      name: "ZimSpares Auto Parts", slug: "zimspares-auto-parts",
      ownerEmail: "owner10@zimbiz.co.zw", ownerName: "Kuda Marowa", ownerPhone: "+263 77 666 7788",
      shortDescription: "Genuine and aftermarket spares for Japanese and European vehicles.",
      about: "ZimSpares stocks engine parts, suspension, brake components and service kits. We source hard-to-find parts on order within 7 days.",
      cat: "automotive", loc: "Harare", img: "motorspares",
      verified: VerificationStatus.PENDING, rating: 4.0, reviews: 7, year: 2018,
      phone: "+263 242 666 778", whatsapp: "+263 77 666 7788",
      freshness: FreshnessLabel.UPDATED_QUARTER_AGO,
    },
    {
      name: "Sudz Car Wash & Detailing", slug: "sudz-car-wash",
      ownerEmail: "owner11@zimbiz.co.zw", ownerName: "Blessing Chuma", ownerPhone: "+263 78 777 8899",
      shortDescription: "Premium wash, interior detailing, polishing and ceramic coatings.",
      about: "Sudz Car Wash & Detailing keeps Chitungwiza cars showroom-fresh with hand washes, machine polishing and protective coatings.",
      cat: "automotive", loc: "Chitungwiza", img: "carwash",
      verified: VerificationStatus.VERIFIED, rating: 4.6, reviews: 11, year: 2020,
      phone: "+263 70 777 889", whatsapp: "+263 78 777 8899",
      freshness: FreshnessLabel.RECONFIRMED_THIS_WEEK,
    },
    {
      name: "Tariro Catering Services", slug: "tariro-catering-services",
      ownerEmail: "owner4@zimbiz.co.zw", ownerName: "Tariro Ncube", ownerPhone: "+263 77 567 8901",
      shortDescription: "Events catering, wedding coordination and equipment hire in Harare.",
      about: "Tariro Catering Services provides full-service catering for weddings, corporate events, and private functions. We also offer event equipment hire including tents, chairs, and tables.",
      cat: "events", loc: "Harare", img: "events",
      verified: VerificationStatus.NOT_SUBMITTED, rating: 4.8, reviews: 15, year: 2020,
      phone: "+263 77 567 8901", whatsapp: "+263 77 567 8901",
      profileType: ProfileType.INFORMAL,
      freshness: FreshnessLabel.RECONFIRMED_THIS_MONTH,
    },
    {
      name: "Elegant Events Zim", slug: "elegant-events-zim",
      ownerEmail: "owner12@zimbiz.co.zw", ownerName: "Rutendo Zvareka", ownerPhone: "+263 77 888 9900",
      shortDescription: "Weddings, lobola ceremonies and corporate functions — decor, coordination, hire.",
      about: "Elegant Events Zim designs and coordinates memorable events. Full decor packages, tents, catering partnerships and day-of coordination.",
      cat: "events", loc: "Harare", img: "events",
      verified: VerificationStatus.VERIFIED, rating: 4.9, reviews: 23, year: 2016,
      phone: "+263 242 888 990", whatsapp: "+263 77 888 9900",
      freshness: FreshnessLabel.RECONFIRMED_THIS_WEEK,
    },
    {
      name: "FlowRight Plumbing", slug: "flowright-plumbing",
      ownerEmail: "owner13@zimbiz.co.zw", ownerName: "Givemore Dube", ownerPhone: "+263 71 999 0011",
      shortDescription: "Emergency plumbing, geyser repairs, blocked drains and new installations.",
      about: "FlowRight Plumbing offers 24/7 emergency callouts across Harare. Geysers, burst pipes, bathroom renovations and solar water heating.",
      cat: "plumbing", loc: "Harare", img: "plumbing",
      verified: VerificationStatus.VERIFIED, rating: 4.5, reviews: 13, year: 2017,
      phone: "+263 242 999 001", whatsapp: "+263 71 999 0011",
      freshness: FreshnessLabel.RECONFIRMED_THIS_MONTH,
    },
    {
      name: "BlueDrop Water Solutions", slug: "bluedrop-water-solutions",
      ownerEmail: "owner14@zimbiz.co.zw", ownerName: "Memory Sithole", ownerPhone: "+263 78 000 1122",
      shortDescription: "Water tank installation, booster pumps and filtration systems.",
      about: "BlueDrop keeps Midlands homes supplied with tank stands, pressure pumps, filtration and borehole-to-tank plumbing.",
      cat: "plumbing", loc: "Kwekwe", img: "plumbing",
      verified: VerificationStatus.PENDING, rating: 4.2, reviews: 5, year: 2021,
      phone: "+263 55 000 112", whatsapp: "+263 78 000 1122",
      freshness: FreshnessLabel.UPDATED_QUARTER_AGO,
    },
    {
      name: "GreenHarvest Farm Supplies", slug: "greenharvest-farm-supplies",
      ownerEmail: "owner15@zimbiz.co.zw", ownerName: "Josphat Manyame", ownerPhone: "+263 77 112 2334",
      shortDescription: "Seed, fertilizer, agro-chemicals and irrigation equipment in Marondera.",
      about: "GreenHarvest supplies smallholder and commercial farmers with certified seed, fertilizers, chemicals, dripline and knapsack sprayers.",
      cat: "agriculture", loc: "Marondera", img: "agriculture",
      verified: VerificationStatus.VERIFIED, rating: 4.7, reviews: 16, year: 2013,
      phone: "+263 65 112 233", whatsapp: "+263 77 112 2334",
      freshness: FreshnessLabel.RECONFIRMED_THIS_MONTH,
    },
    {
      name: "PoultryPro Zimbabwe", slug: "poultrypro-zimbabwe",
      ownerEmail: "owner16@zimbiz.co.zw", ownerName: "Vimbai Katsande", ownerPhone: "+263 78 223 3445",
      shortDescription: "Point-of-lay chickens, feed, vaccines and poultry equipment.",
      about: "PoultryPro supplies layers and broilers, feed, vaccines and drinkers/feeders to Midlands poultry projects, with beginner training included.",
      cat: "agriculture", loc: "Gweru", img: "agriculture",
      verified: VerificationStatus.NOT_SUBMITTED, rating: 4.1, reviews: 4, year: 2022,
      phone: "+263 54 223 344", whatsapp: "+263 78 223 3445",
      freshness: FreshnessLabel.MAY_BE_OUTDATED,
    },
    {
      name: "GlamGlow Salon", slug: "glamglow-salon",
      ownerEmail: "owner17@zimbiz.co.zw", ownerName: "Chiedza Rusike", ownerPhone: "+263 77 334 4556",
      shortDescription: "Braids, weaves, nails and makeup — walk-ins welcome in the CBD.",
      about: "GlamGlow Salon offers hair styling, braiding, nail care and bridal makeup in central Harare. Book online or walk in.",
      cat: "beauty", loc: "Harare", img: "beauty",
      verified: VerificationStatus.VERIFIED, rating: 4.8, reviews: 27, year: 2019,
      phone: "+263 242 334 455", whatsapp: "+263 77 334 4556",
      profileType: ProfileType.INFORMAL,
      freshness: FreshnessLabel.RECONFIRMED_THIS_WEEK,
    },
    {
      name: "SharpCuts Barbershop", slug: "sharpcuts-barbershop",
      ownerEmail: "owner18@zimbiz.co.zw", ownerName: "Talent Mpofu", ownerPhone: "+263 71 445 5667",
      shortDescription: "Precision cuts, fades, beard trims and kids' cuts in Bulawayo.",
      about: "SharpCuts is Bulawayo's go-to for clean fades and classic cuts. Walk-ins welcome, appointments for weekends recommended.",
      cat: "beauty", loc: "Bulawayo", img: "barber",
      verified: VerificationStatus.VERIFIED, rating: 4.6, reviews: 19, year: 2018,
      phone: "+263 29 445 566", whatsapp: "+263 71 445 5667",
      profileType: ProfileType.INFORMAL,
      freshness: FreshnessLabel.RECONFIRMED_THIS_MONTH,
    },
    {
      name: "VitaCare Clinic", slug: "vitacare-clinic",
      ownerEmail: "owner19@zimbiz.co.zw", ownerName: "Dr. Tanya Chirume", ownerPhone: "+263 77 556 6778",
      shortDescription: "Private GP consultations, wellness checks and chronic care management.",
      about: "VitaCare Clinic provides affordable private consultations, health screenings, mother-and-child services and chronic medication management in Avondale, Harare.",
      cat: "health", loc: "Harare", img: "health",
      verified: VerificationStatus.VERIFIED, rating: 4.5, reviews: 17, year: 2017,
      phone: "+263 242 556 677", whatsapp: "+263 77 556 6778",
      freshness: FreshnessLabel.RECONFIRMED_THIS_MONTH,
    },
    {
      name: "WellMed Pharmacy", slug: "wellmed-pharmacy",
      ownerEmail: "owner20@zimbiz.co.zw", ownerName: "Pharmacist John Banda", ownerPhone: "+263 78 667 7889",
      shortDescription: "Prescription dispensing, supplements and free blood pressure checks.",
      about: "WellMed Pharmacy serves Masvingo with genuine medication, supplements, baby care and free BP screening every weekday.",
      cat: "health", loc: "Masvingo", img: "pharmacy",
      verified: VerificationStatus.PENDING, rating: 4.3, reviews: 8, year: 2020,
      phone: "+263 39 667 788", whatsapp: "+263 78 667 7889",
      freshness: FreshnessLabel.UPDATED_QUARTER_AGO,
    },
    {
      name: "ExcelTuition Centre", slug: "exceltuition-centre",
      ownerEmail: "owner21@zimbiz.co.zw", ownerName: "Mrs. Rudo Makoni", ownerPhone: "+263 77 778 8990",
      shortDescription: "O & A Level tutoring in Maths, Sciences and English — small classes.",
      about: "ExcelTuition Centre offers after-school and holiday lessons for O and A Level students, with proven pass rates and exam technique coaching in Harare.",
      cat: "education", loc: "Harare", img: "education",
      verified: VerificationStatus.VERIFIED, rating: 4.9, reviews: 31, year: 2015,
      phone: "+263 242 778 899", whatsapp: "+263 77 778 8990",
      freshness: FreshnessLabel.RECONFIRMED_THIS_WEEK,
    },
    {
      name: "SafeDrive Driving School", slug: "safedrive-driving-school",
      ownerEmail: "owner22@zimbiz.co.zw", ownerName: "Instructor Mike Dlamini", ownerPhone: "+263 71 889 9001",
      shortDescription: "Learner lessons, provisional test prep and defensive driving in Bulawayo.",
      about: "SafeDrive Driving School has a 90% first-time pass rate. Dual-control vehicles, patient instructors and refresher courses available.",
      cat: "education", loc: "Bulawayo", img: "education",
      verified: VerificationStatus.VERIFIED, rating: 4.4, reviews: 12, year: 2016,
      phone: "+263 29 889 900", whatsapp: "+263 71 889 9001",
      freshness: FreshnessLabel.RECONFIRMED_THIS_MONTH,
    },
    {
      name: "ByteFix Computers", slug: "bytefix-computers",
      ownerEmail: "owner23@zimbiz.co.zw", ownerName: "Tanaka Mutsau", ownerPhone: "+263 77 990 0112",
      shortDescription: "Laptop & phone repairs, screen replacements, data recovery and upgrades.",
      about: "ByteFix Computers repairs laptops, phones and tablets — screens, batteries, boards, software. Same-day service for most repairs in Harare.",
      cat: "it-services", loc: "Harare", img: "phone-repair",
      verified: VerificationStatus.VERIFIED, rating: 4.6, reviews: 15, year: 2019,
      phone: "+263 242 990 011", whatsapp: "+263 77 990 0112",
      freshness: FreshnessLabel.RECONFIRMED_THIS_WEEK,
    },
    {
      name: "NetLink Solutions", slug: "netlink-solutions",
      ownerEmail: "owner24@zimbiz.co.zw", ownerName: "Panashe Gondo", ownerPhone: "+263 78 001 1223",
      shortDescription: "Wi-Fi installation, CCTV networks and small business IT support.",
      about: "NetLink Solutions installs home and office networks, Starlink setups, CCTV systems and provides monthly IT support contracts.",
      cat: "it-services", loc: "Chitungwiza", img: "it-services",
      verified: VerificationStatus.PENDING, rating: 4.2, reviews: 6, year: 2021,
      phone: "+263 70 001 122", whatsapp: "+263 78 001 1223",
      freshness: FreshnessLabel.UPDATED_QUARTER_AGO,
    },
    {
      name: "SparkleClean Services", slug: "sparkleclean-services",
      ownerEmail: "owner25@zimbiz.co.zw", ownerName: "Esther Marowa", ownerPhone: "+263 77 112 3344",
      shortDescription: "Office cleaning, post-construction cleanup and deep home cleans.",
      about: "SparkleClean Services offers scheduled office cleaning, move-in/move-out deep cleans and post-build cleanup across Harare. Vetted, uniformed staff.",
      cat: "cleaning", loc: "Harare", img: "cleaning",
      verified: VerificationStatus.VERIFIED, rating: 4.7, reviews: 20, year: 2018,
      phone: "+263 242 112 334", whatsapp: "+263 77 112 3344",
      freshness: FreshnessLabel.RECONFIRMED_THIS_MONTH,
    },
    {
      name: "PestAway Fumigation", slug: "pestaway-fumigation",
      ownerEmail: "owner26@zimbiz.co.zw", ownerName: "Obert Sibanda", ownerPhone: "+263 71 223 4455",
      shortDescription: "Cockroaches, termites, rodents — safe fumigation for homes and food premises.",
      about: "PestAway Fumigation uses approved, pet-safe chemicals to eliminate pests in homes, restaurants and warehouses across Bulawayo.",
      cat: "cleaning", loc: "Bulawayo", img: "cleaning",
      verified: VerificationStatus.VERIFIED, rating: 4.5, reviews: 10, year: 2017,
      phone: "+263 29 223 445", whatsapp: "+263 71 223 4455",
      freshness: FreshnessLabel.UPDATED_QUARTER_AGO,
    },
    {
      name: "SwiftMove Logistics", slug: "swiftmove-logistics",
      ownerEmail: "owner27@zimbiz.co.zw", ownerName: "Courage Tshuma", ownerPhone: "+263 77 334 5566",
      shortDescription: "Household moves, office relocations and same-city courier runs.",
      about: "SwiftMove Logistics handles home and office moves with packing crews and insured transport. Same-day courier service within Harare.",
      cat: "transport", loc: "Harare", img: "transport",
      verified: VerificationStatus.VERIFIED, rating: 4.3, reviews: 9, year: 2019,
      phone: "+263 242 334 556", whatsapp: "+263 77 334 5566",
      freshness: FreshnessLabel.RECONFIRMED_THIS_MONTH,
    },
    {
      name: "HomeFind Properties", slug: "homefind-properties",
      ownerEmail: "owner28@zimbiz.co.zw", ownerName: "Shamiso Ziyambi", ownerPhone: "+263 77 445 6677",
      shortDescription: "Rentals, sales and property management in Harare's northern suburbs.",
      about: "HomeFind Properties lists vetted rentals and sales in Borrowdale, Mount Pleasant and Avondale. Tenant screening and full management available.",
      cat: "real-estate", loc: "Harare", img: "real-estate",
      verified: VerificationStatus.VERIFIED, rating: 4.5, reviews: 18, year: 2014,
      phone: "+263 242 445 667", whatsapp: "+263 77 445 6677",
      freshness: FreshnessLabel.RECONFIRMED_THIS_WEEK,
    },
    {
      name: "KeyStone Realty", slug: "keystone-realty",
      ownerEmail: "owner29@zimbiz.co.zw", ownerName: "Tonderai Nyamuda", ownerPhone: "+263 78 556 7788",
      shortDescription: "Residential stands, farmland and commercial property in Manicaland.",
      about: "KeyStone Realty markets titled stands, smallholdings and commercial premises across Mutare and Penhalonga. Documentation assistance provided.",
      cat: "real-estate", loc: "Mutare", img: "real-estate",
      verified: VerificationStatus.PENDING, rating: 4.0, reviews: 3, year: 2022,
      phone: "+263 20 556 778", whatsapp: "+263 78 556 7788",
      freshness: FreshnessLabel.MAY_BE_OUTDATED,
    },
    {
      name: "StitchPerfect Tailors", slug: "stitchperfect-tailors",
      ownerEmail: "owner30@zimbiz.co.zw", ownerName: "Mai Chikwava", ownerPhone: "+263 77 667 8899",
      shortDescription: "Custom suits, wedding dresses, school uniforms and alterations.",
      about: "StitchPerfect Tailors has dressed Harare for over a decade — bespoke suits, bridal wear, uniforms and expert alterations with quick turnaround.",
      cat: "fashion", loc: "Harare", img: "tailor",
      verified: VerificationStatus.VERIFIED, rating: 4.8, reviews: 22, year: 2011,
      phone: "+263 242 667 889", whatsapp: "+263 77 667 8899",
      profileType: ProfileType.INFORMAL,
      freshness: FreshnessLabel.RECONFIRMED_THIS_MONTH,
    },
    {
      name: "GuardForce Security", slug: "guardforce-security",
      ownerEmail: "owner31@zimbiz.co.zw", ownerName: "Innocent Makwara", ownerPhone: "+263 77 778 9900",
      shortDescription: "Manned guarding, alarm response and CCTV installation.",
      about: "GuardForce Security provides trained guards, rapid alarm response and CCTV/Access control installations for homes and businesses in Harare.",
      cat: "security", loc: "Harare", img: "security",
      verified: VerificationStatus.VERIFIED, rating: 4.4, reviews: 11, year: 2016,
      phone: "+263 242 778 990", whatsapp: "+263 77 778 9900",
      freshness: FreshnessLabel.RECONFIRMED_THIS_MONTH,
    },
    {
      name: "LensCraft Studios", slug: "lenscraft-studios",
      ownerEmail: "owner32@zimbiz.co.zw", ownerName: "Takudzwa Chigumba", ownerPhone: "+263 78 889 0011",
      shortDescription: "Wedding photography, corporate shoots and drone coverage.",
      about: "LensCraft Studios captures weddings, graduations and corporate events with cinematic photo and video packages. Drone coverage available.",
      cat: "photography", loc: "Harare", img: "photography",
      verified: VerificationStatus.VERIFIED, rating: 4.9, reviews: 25, year: 2019,
      phone: "+263 242 889 001", whatsapp: "+263 78 889 0011",
      freshness: FreshnessLabel.RECONFIRMED_THIS_WEEK,
    },
    {
      name: "FlameGrill Restaurant", slug: "flamegrill-restaurant",
      ownerEmail: "owner33@zimbiz.co.zw", ownerName: "Chef Arnold Gatsi", ownerPhone: "+263 77 990 1122",
      shortDescription: "Flame-grilled meats, traditional dishes and takeaway platters.",
      about: "FlameGrill serves Zimbabwean grills, sadza nenyama and takeaway platters for offices and events in central Harare.",
      cat: "hospitality", loc: "Harare", img: "hospitality",
      verified: VerificationStatus.VERIFIED, rating: 4.6, reviews: 29, year: 2017,
      phone: "+263 242 990 112", whatsapp: "+263 77 990 1122",
      freshness: FreshnessLabel.RECONFIRMED_THIS_MONTH,
    },
    {
      name: "BrewCulture Coffee", slug: "brewculture-coffee",
      ownerEmail: "owner34@zimbiz.co.zw", ownerName: "Linda Khumalo", ownerPhone: "+263 71 001 2233",
      shortDescription: "Specialty coffee, brunch and co-working friendly space in Bulawayo.",
      about: "BrewCulture Coffee roasts local beans and serves specialty drinks, brunch and pastries with free Wi-Fi in Bulawayo city centre.",
      cat: "hospitality", loc: "Bulawayo", img: "coffee",
      verified: VerificationStatus.VERIFIED, rating: 4.7, reviews: 21, year: 2020,
      phone: "+263 29 001 223", whatsapp: "+263 71 001 2233",
      freshness: FreshnessLabel.RECONFIRMED_THIS_MONTH,
    },
    {
      name: "Chikore & Partners Attorneys", slug: "chikore-partners-attorneys",
      ownerEmail: "owner35@zimbiz.co.zw", ownerName: "Advocate F. Chikore", ownerPhone: "+263 77 112 4455",
      shortDescription: "Conveyancing, company registration, wills and civil litigation.",
      about: "Chikore & Partners is a Harare law firm handling conveyancing, company registrations, estate planning and civil matters for individuals and SMEs.",
      cat: "legal", loc: "Harare", img: "legal",
      verified: VerificationStatus.VERIFIED, rating: 4.8, reviews: 13, year: 2010,
      phone: "+263 242 112 445", whatsapp: "+263 77 112 4455",
      freshness: FreshnessLabel.RECONFIRMED_THIS_MONTH,
    },
    {
      name: "LedgerLine Accountants", slug: "ledgerline-accountants",
      ownerEmail: "owner36@zimbiz.co.zw", ownerName: "Patricia Ndebele", ownerPhone: "+263 71 223 5566",
      shortDescription: "Bookkeeping, ZIMRA returns, payroll and annual financials for SMEs.",
      about: "LedgerLine Accountants keeps Bulawayo small businesses compliant — monthly books, tax returns, payroll and year-end financials.",
      cat: "legal", loc: "Bulawayo", img: "legal",
      verified: VerificationStatus.VERIFIED, rating: 4.5, reviews: 9, year: 2018,
      phone: "+263 29 223 556", whatsapp: "+263 71 223 5566",
      freshness: FreshnessLabel.UPDATED_QUARTER_AGO,
    },
  ];

  for (const biz of demoBusinesses) {
    const { ownerEmail, ownerName, ownerPhone, cat, loc, img, verified, rating, reviews, year, phone, whatsapp, profileType, freshness, ...bizData } = biz;

    const owner = await createUser(ownerEmail, whatsapp, ownerName, "BUSINESS_OWNER");

    const street = streetByLoc[loc] ?? "123 Main Street";
    const address = locId[loc]
      ? await prisma.address.create({
          data: {
            line1: street,
            locationId: locId[loc],
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
          coverImageUrl: `/images/${img}.jpg`,
          primaryCategoryId: catId[cat],
          verificationStatus: verified,
          status: BusinessStatus.PUBLISHED,
          averageRating: rating,
          reviewCount: reviews,
          yearEstablished: year,
          phone,
          whatsappNumber: whatsapp,
          profileType: profileType ?? ProfileType.FORMAL,
          profileFreshness: freshness ?? FreshnessLabel.RECONFIRMED_THIS_MONTH,
        },
      });
    } else {
      if (!existing.coverImageUrl) {
        await prisma.business.update({
          where: { id: existing.id },
          data: { coverImageUrl: `/images/${img}.jpg` },
        });
      }
      if (existing.addressId) {
        await prisma.address
          .update({ where: { id: existing.addressId }, data: { line1: street } })
          .catch(() => {});
      }
    }
  }
  console.log("✓ Demo businesses created");
  // ── Demo Subscriptions ──
  const proPlan = await prisma.subscriptionPlan.findUnique({ where: { name: "Business Pro" } });
  const entPlan = await prisma.subscriptionPlan.findUnique({ where: { name: "Enterprise" } });
  const now = new Date();
  const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const subsToCreate = [
    { slug: "elegant-events-zim", plan: proPlan },
    { slug: "sunshine-solar-solutions", plan: entPlan },
  ];
  let invSeq = 0;
  for (const { slug, plan } of subsToCreate) {
    if (!plan) continue;
    const biz = await prisma.business.findUnique({ where: { slug } });
    if (!biz) continue;
    const sub = await prisma.subscription.upsert({
      where: { businessId: biz.id },
      update: {},
      create: {
        businessId: biz.id,
        planId: plan.id,
        status: "ACTIVE",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
    });
    const invoiceNumber = `INV-2026-${String(++invSeq).padStart(4, "0")}`;
    const hasInvoice = await prisma.invoice.findUnique({ where: { invoiceNumber } });
    if (!hasInvoice) {
      await prisma.invoice.create({
        data: {
          subscriptionId: sub.id,
          businessId: biz.id,
          invoiceNumber,
          amount: plan.priceMonthly,
          currency: "USD",
          status: "PAID",
          paidAt: now,
        },
      });
    }
  }
  console.log("✓ Demo subscriptions created");

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
