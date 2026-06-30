model Action {
id String @id @default(cuid())
type ActionType

    businessId String
    business   Business @relation(fields: [businessId], references: [id], onDelete: Cascade)

    title       String
    description String?
    fields      Json

    status ActionStatus @default(OPEN)

    submissions ActionSubmission[]

    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt

    @@map("action")

}

model ActionSubmission {
id String @id @default(cuid())

    actionId String
    action   Action @relation(fields: [actionId], references: [id], onDelete: Cascade)

    userId String
    user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

    data   Json
    status SubmissionStatus @default(PENDING)

    createdAt DateTime @default(now())

    @@map("action_submission")

}

model Addon {
id String @id @default(cuid())
kind AddonKind
name String
description String?
quantity Int
priceFcfa Int

    purchases AddonPurchase[]

    isActive Boolean @default(true)

    @@map("addon")

}

model AddonPurchase {
id String @id @default(cuid())

    userId String
    user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

    addonId String
    addon   Addon  @relation(fields: [addonId], references: [id])

    subscriptionId String?
    subscription   Subscription? @relation(fields: [subscriptionId], references: [id])

    quantity    Int       @default(1)
    priceFcfa   Int
    purchasedAt DateTime  @default(now())
    expiresAt   DateTime?

    payment Payment?

    @@map("addon_purchase")

}

model Business {
id String @id @default(cuid())
ownerId String
owner User @relation(fields: [ownerId], references: [id], onDelete: Cascade)

    name        String
    description String?
    logo        String?
    coverImage  String?
    sector      String?
    address     String?
    city        String?
    phone       String?
    email       String?

    certificationStatus CertificationStatus @default(NONE)

    subscriptions  Subscription[]
    certifications Certification[]
    publications   Publication[]
    actions        Action[]
    storageFiles   StorageFile[]

    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt

    @@map("business")

}

model Certification {
id String @id @default(cuid())

    target     CertificationTarget
    userId     String?
    businessId String?

    user     User?     @relation(fields: [userId], references: [id], onDelete: Cascade)
    business Business? @relation(fields: [businessId], references: [id], onDelete: Cascade)

    status     CertificationStatus @default(PENDING)
    priceFcfa  Int
    documents  Json?
    reviewNote String?

    requestedAt DateTime  @default(now())
    reviewedAt  DateTime?

    payment Payment?

    @@map("certification")

}

enum Role {
ADMIN
USER
WORKSPACE
}

enum PlanCode {
FREE
PRO
BUSINESS
}

enum BillingPeriod {
MONTHLY
YEARLY
}

enum SubscriptionStatus {
ACTIVE
EXPIRED
CANCELLED
PENDING_PAYMENT
}

enum ContentType {
PUBLICATION
SONDAGE
ANNONCE
}

enum FileKind {
IMAGE
VIDEO
DOCUMENT
}

enum ActionType {
COMMANDER
RECRUTER
}

enum ActionStatus {
OPEN
CLOSED
ARCHIVED
}

enum SubmissionStatus {
PENDING
ACCEPTED
REJECTED
}

enum CertificationTarget {
USER
BUSINESS
}

enum CertificationStatus {
NONE
PENDING
APPROVED
REJECTED
}

enum AddonKind {
STORAGE
PUBLICATION
SONDAGE
ANNONCE
}

model Payment {
id String @id @default(cuid())

    userId String
    user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

    subscriptionId String?
    subscription   Subscription? @relation(fields: [subscriptionId], references: [id])

    addonPurchaseId String?        @unique
    addonPurchase   AddonPurchase? @relation(fields: [addonPurchaseId], references: [id])

    certificationId String?        @unique
    certification   Certification? @relation(fields: [certificationId], references: [id])

    amountFcfa Int
    provider   String
    reference  String @unique
    status     String

    createdAt DateTime @default(now())

    @@map("payment")

}

model Plan {
id String @id @default(cuid())
code PlanCode @unique
name String
priceFcfa Int
billingPeriod BillingPeriod @default(MONTHLY)

    storageLimitMb        Int
    maxPublications       Int
    maxSondages           Int
    maxAnnonces           Int
    maxActions            Int
    canCreateActions      Boolean @default(false)
    includesCertification Boolean @default(false)

    features Json?
    isActive Boolean @default(true)

    subscriptions Subscription[]

    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt

    @@map("plan")

}

model Publication {
id String @id @default(cuid())
type ContentType

    authorId String
    author   User   @relation(fields: [authorId], references: [id], onDelete: Cascade)

    businessId String?
    business   Business? @relation(fields: [businessId], references: [id], onDelete: Cascade)

    title   String?
    content String?

    pollOptions Json?

    files StorageFile[]

    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt

    @@map("publication")

}

model StorageFile {
id String @id @default(cuid())
kind FileKind
url String
sizeMb Float

    ownerId String
    owner   User   @relation(fields: [ownerId], references: [id], onDelete: Cascade)

    businessId String?
    business   Business? @relation(fields: [businessId], references: [id], onDelete: Cascade)

    publicationId String?
    publication   Publication? @relation(fields: [publicationId], references: [id], onDelete: Cascade)

    createdAt DateTime @default(now())

    @@map("storage_file")

}

model Subscription {
id String @id @default(cuid())
userId String
businessId String?

    planId String
    plan   Plan   @relation(fields: [planId], references: [id])

    status    SubscriptionStatus @default(ACTIVE)
    startDate DateTime           @default(now())
    endDate   DateTime
    autoRenew Boolean            @default(true)

    user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
    business Business? @relation(fields: [businessId], references: [id], onDelete: Cascade)

    quotas   UsageQuota[]
    payments Payment[]

    createdAt      DateTime        @default(now())
    updatedAt      DateTime        @updatedAt
    addonPurchases AddonPurchase[]

    @@map("subscription")

}

model UsageQuota {
id String @id @default(cuid())

    subscriptionId String
    subscription   Subscription @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)

    periodStart DateTime
    periodEnd   DateTime

    storageUsedMb    Int @default(0)
    publicationsUsed Int @default(0)
    sondagesUsed     Int @default(0)
    annoncesUsed     Int @default(0)
    actionsUsed      Int @default(0)

    bonusStorageMb    Int @default(0)
    bonusPublications Int @default(0)
    bonusSondages     Int @default(0)
    bonusAnnonces     Int @default(0)

    @@unique([subscriptionId, periodStart])
    @@map("usage_quota")

}

model User {
id String @id
role Role @default(USER)
firstname String
lastname String
name String
email String
phone String? @unique
emailVerified Boolean @default(false)
idVerified Boolean @default(false)
image String?

    country String?
    city    String?

    banned     Boolean   @default(false)
    banReason  String?
    banExpires DateTime?

    lastSeenAt         DateTime?
    suspiciousActivity Boolean   @default(false)

    subscriptions     Subscription[]
    accounts          Account[]
    sessions          Session[]
    ips               UserIp[]
    payments          Payment[]
    certifications    Certification[]
    businesses        Business[]
    publications      Publication[]
    storageFiles      StorageFile[]
    actionSubmissions ActionSubmission[]
    addonPurchases    AddonPurchase[]

    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt

    @@unique([email, phone])
    @@map("user")

}

voila mes schema pour le systeme de souscription a un plan, en gros je t explique un user a 3 role user, workspace et admin, le user c est celui quand tu cree ton compte il est free l admin c est pour l administrateur lui il peut tout faire et le workspace c est quand tu prend un abonnement, y en a 3 Starter Pro Business et chaque abonnement quotient ces aventages, je veux que tu me cree un systeme d abonnement avec elysia et que tu me cree un systeme de payement fake pour valider le payement et avoir access a l abonnement et a ces avantages j aimerais qu il soit complet pro et bien fais cree aussi un visuel de cela avec tanstack router et react ts pour pouvoir tester tout cela si tu dois completer ou ameliorer des chose fais le pour une meilleur securité et eviter les failles pour l auth en cas de besoin c est better auth
