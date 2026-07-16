export type VerificationTokenStatus =
  | "pending"
  | "expired"
  | "already-verified"
  | "invalid";

export type ResetPasswordTokenStatus =
  | "pending"
  | "expired"
  | "already-used"
  | "invalid";
