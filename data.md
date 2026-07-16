model Verification {
id String @id
identifier String
value String
expiresAt DateTime
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

    @@index([identifier])
    @@map("verification")

}

model User {
id String @id
role Role @default(USER)
firstname String
lastname String
name String
email String @unique
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

    creationSource UserCreationSource @default(SELF_REGISTRATION)
    createdById    String?
    createdBy      User?              @relation("UserCreatedBy", fields: [createdById], references: [id], onDelete: SetNull)
    createdUsers   User[]             @relation("UserCreatedBy")
    createdByName  String?

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

    activityLogs           ActivityLog[]
    notifications          Notification[]
    notificationPreference NotificationPreference?

    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt

    @@unique([email, phone])
    @@map("user")

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

model VerificationTokenLog {
id String @id @default(cuid())
tokenHash String @unique
createdAt DateTime @default(now())

    @@index([createdAt])
    @@map("verification_token_log")

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

model Session {
id String @id
expiresAt DateTime
token String
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
ipAddress String?
userAgent String?
userId String
user User @relation(fields: [userId], references: [id], onDelete: Cascade)

    impersonatedBy String?

    @@unique([token])
    @@index([userId])
    @@map("session")

}

model RateLimit {
id String @id
key String
count Int
lastRequest BigInt

    @@unique([key])
    @@map("rate_limit")

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

model ActivityLog {
id String @id @default(cuid())

    userId String?
    user   User?   @relation(fields: [userId], references: [id], onDelete: SetNull)

    userRole Role?

    userName  String?
    userEmail String?

    action String

    status LogStatus
    level  LogLevel  @default(INFO)

    message String

    errorRaw Json?

    targetType String?
    targetId   String?

    metadata Json?

    ipAddress String?
    userAgent String?

    durationMs Int?

    createdAt DateTime @default(now())

    @@index([userId])
    @@index([status])
    @@index([level])
    @@index([action])
    @@index([targetType, targetId])
    @@index([createdAt])
    @@map("activity_log")

}

// ---------------------------------------------------------------------
// NOTIFICATIONS
// ---------------------------------------------------------------------

model Notification {
id String @id @default(cuid())

    userId String
    user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

    type     NotificationType
    category String? // regroupement libre, ex: "billing", "security", "social"

    title   String
    message String
    data    Json? // contexte structuré, ex: { "paymentId": "...", "amount": 100 }

    channel  NotificationChannel  @default(IN_APP)
    priority NotificationPriority @default(NORMAL)
    status   NotificationStatus   @default(PENDING)

    isRead Boolean   @default(false)
    readAt DateTime?

    actionUrl String? // lien vers lequel rediriger au clic
    icon      String?

    sentAt      DateTime?
    deliveredAt DateTime?
    failedAt    DateTime?
    failReason  String?

    expiresAt DateTime? // pour les notifs temporaires (promos, etc.)

    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt

    @@index([userId])
    @@index([userId, isRead])
    @@index([type])
    @@index([status])
    @@index([createdAt])
    @@map("notification")

}

model NotificationPreference {
id String @id @default(cuid())

    userId String @unique
    user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

    emailEnabled Boolean @default(true)
    smsEnabled   Boolean @default(false)
    pushEnabled  Boolean @default(true)
    inAppEnabled Boolean @default(true)

    mutedTypes      NotificationType[] // types de notifs désactivés par l'user
    mutedCategories String[] // catégories désactivées
    // ⚠️ Ces deux champs (listes scalaires) nécessitent PostgreSQL ou CockroachDB.
    // Si tu es en MySQL/SQLite, remplace-les par un champ unique `Json?` (ex: mutedTypes Json?)

    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt

    @@map("notification_preference")

}

model Ip {
id String @id @default(cuid())
ip String @unique
banned Boolean @default(false)
banReason String?
banExpires DateTime?
violations Int @default(0)

    users UserIp[]

    @@map("ip")

}

model UserIp {
userId String
ipId String

    firstSeen DateTime @default(now())
    lastSeen  DateTime @updatedAt

    user User @relation(fields: [userId], references: [id], onDelete: Cascade)
    ip   Ip   @relation(fields: [ipId], references: [id], onDelete: Cascade)

    @@id([userId, ipId])
    @@map("user_ip")

}

enum Role {
ADMIN
USER
WORKSPACE
}

enum PlanCode {
FREE
STARTER
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

enum UserCreationSource {
SELF_REGISTRATION
ADMIN
SYSTEM
IMPORT
OAUTH
API
}

enum LogStatus {
SUCCESS
ERROR
WARNING
PENDING
}

enum LogLevel {
DEBUG
INFO
WARNING
ERROR
CRITICAL
}

enum NotificationType {
INFO
SUCCESS
WARNING
ERROR
SECURITY
PAYMENT
SUBSCRIPTION
PROMOTION
SYSTEM
}

enum NotificationChannel {
IN_APP
EMAIL
SMS
PUSH
}

enum NotificationPriority {
LOW
NORMAL
HIGH
URGENT
}

enum NotificationStatus {
PENDING
SENT
DELIVERED
FAILED
READ
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

model Account {
id String @id
accountId String
providerId String
userId String
user User @relation(fields: [userId], references: [id], onDelete: Cascade)
accessToken String?
refreshToken String?
idToken String?
accessTokenExpiresAt DateTime?
refreshTokenExpiresAt DateTime?
scope String?
password String?
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

    @@index([userId])
    @@map("account")

}
