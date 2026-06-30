import { prisma } from "../lib/prisma";

async function main() {
  const plans = [
    {
      code: "FREE" as const,
      name: "Starter",
      priceFcfa: 0,
      billingPeriod: "MONTHLY" as const,
      storageLimitMb: 100,
      maxPublications: 5,
      maxSondages: 2,
      maxAnnonces: 1,
      maxActions: 0,
      canCreateActions: false,
      includesCertification: false,
      isActive: true,
      features: [
        "5 publications / mois",
        "2 sondages / mois",
        "1 annonce / mois",
        "100 MB de stockage",
      ],
    },
    {
      code: "PRO" as const,
      name: "Pro",
      priceFcfa: 9900,
      billingPeriod: "MONTHLY" as const,
      storageLimitMb: 1024,
      maxPublications: 50,
      maxSondages: 20,
      maxAnnonces: 10,
      maxActions: 20,
      canCreateActions: true,
      includesCertification: false,
      isActive: true,
      features: [
        "50 publications / mois",
        "20 sondages / mois",
        "10 annonces / mois",
        "1 GB de stockage",
        "Création d'actions",
        "Support prioritaire",
      ],
    },
    {
      code: "BUSINESS" as const,
      name: "Business",
      priceFcfa: 29900,
      billingPeriod: "MONTHLY" as const,
      storageLimitMb: 10240,
      maxPublications: 9999,
      maxSondages: 9999,
      maxAnnonces: 9999,
      maxActions: 9999,
      canCreateActions: true,
      includesCertification: true,
      isActive: true,
      features: [
        "Publications illimitées",
        "Sondages illimités",
        "Annonces illimitées",
        "10 GB de stockage",
        "Actions avancées",
        "Certification incluse",
        "Support dédié",
      ],
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { code: plan.code },
      update: plan,
      create: plan,
    });
    console.log(`✓ Plan ${plan.name} (${plan.priceFcfa} FCFA)`);
  }

  console.log("\n✅ Plans seedés avec succès.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
