export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  // ── Register ───────────────────────────────────────────────────────────────
  USER_ALREADY_EXISTS: "Un compte existe déjà avec cette adresse email.",
  EMAIL_NOT_VALID: "L'adresse email saisie n'est pas valide.",
  PASSWORD_TOO_SHORT: "Le mot de passe doit contenir au moins 8 caractères.",
  PASSWORD_TOO_LONG: "Le mot de passe est trop long (maximum 128 caractères).",
  FAILED_TO_CREATE_USER: "Impossible de créer le compte. Réessayez.",
  FAILED_TO_CREATE_SESSION:
    "Compte créé mais connexion échouée. Connectez-vous manuellement.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:
    "Cette adresse email est deja utilisée.",
  PHONE_ALREADY_EXISTS: "Un compte existe déjà avec ce numéro de téléphone.",
  YOU_ARE_NOT_ALLOWED_TO_CREATE_USERS:
    "Vous n'êtes pas autorisé à créer des utilisateurs.",

  // ── Sign in ────────────────────────────────────────────────────────────────
  INVALID_EMAIL_OR_PASSWORD: "Email ou mot de passe incorrect.",
  USER_NOT_FOUND: "Aucun compte trouvé avec cette adresse email.",
  EMAIL_NOT_VERIFIED:
    "Votre email n'est pas encore vérifié. Consultez votre boîte mail.",
  ACCOUNT_NOT_FOUND: "Compte introuvable. Vérifiez vos informations.",
  INVALID_PASSWORD: "Mot de passe incorrect.",
  PASSWORD_COMPROMISED:
    "Ce mot de passe est compromis. Veuillez en choisir un autre.",

  // ── OTP ────────────────────────────────────────────────────────────────────
  INVALID_OTP: "Code incorrect. Vérifiez le code reçu par email.",
  OTP_EXPIRED: "Ce code a expiré. Demandez-en un nouveau.",
  OTP_NOT_FOUND: "Code introuvable. Demandez un nouveau code.",
  TOO_MANY_ATTEMPTS:
    "Trop de tentatives. Veuillez patienter avant de réessayer.",
  FAILED_TO_SEND_OTP: "Impossible d'envoyer le code. Réessayez.",

  // ── Session ────────────────────────────────────────────────────────────────
  SESSION_EXPIRED: "Votre session a expiré. Reconnectez-vous.",
  SESSION_NOT_FOUND: "Session introuvable. Reconnectez-vous.",
  UNAUTHORIZED: "Vous devez être connecté pour accéder à cette page.",
  FAILED_TO_GET_SESSION:
    "Impossible de récupérer la session. Reconnectez-vous.",
  FAILED_TO_UPDATE_USER: "Impossible de mettre à jour vos informations.",

  // ── Mot de passe oublié ────────────────────────────────────────────────────
  INVALID_TOKEN: "Lien invalide ou expiré. Faites une nouvelle demande.",
  TOKEN_EXPIRED:
    "Ce lien a expiré. Faites une nouvelle demande de réinitialisation.",
  FAILED_TO_RESET_PASSWORD:
    "Impossible de réinitialiser le mot de passe. Réessayez.",
  SAME_PASSWORD: "Le nouveau mot de passe doit être différent de l'ancien.",

  // ── Social / OAuth ─────────────────────────────────────────────────────────
  OAUTH_ACCOUNT_NOT_LINKED:
    "Ce compte social est lié à un autre compte Lokale.",
  PROVIDER_ERROR: "Erreur lors de la connexion avec ce service. Réessayez.",
  ACCOUNT_NOT_LINKED: "Ce compte social n'est lié à aucun compte Lokale.",
  FAILED_TO_LINK_ACCOUNT: "Impossible de lier ce compte social. Réessayez.",
  FAILED_TO_UNLINK_ACCOUNT: "Impossible de délier ce compte social. Réessayez.",
  PROVIDER_NOT_FOUND: "Ce service de connexion n'est pas disponible.",

  // ── Rate limit ─────────────────────────────────────────────────────────────
  RATE_LIMIT_EXCEEDED: "Trop de tentatives. Réessayez dans  minutes.",

  // ── Générique ──────────────────────────────────────────────────────────────
  INTERNAL_SERVER_ERROR:
    "Une erreur serveur est survenue. Réessayez dans un moment.",
  BAD_REQUEST: "Requête invalide. Vérifiez les informations saisies.",
  FORBIDDEN:
    "Vous avez effectué trop de tentatives. Veuillez réessayer plus tard.",
} as const;

export type AuthErrorCode = keyof typeof AUTH_ERROR_MESSAGES;

interface AuthError {
  code?: string;
  status?: number;
  message?: string;
  retryAfter?: number;
}

export function getAuthErrorMessage(error: {
  code?: string;
  status?: number;
  message?: string;
}): string {
  if (error.status === 429) {
    return AUTH_ERROR_MESSAGES.RATE_LIMIT_EXCEEDED!;
  }
  if (error.status === 403) return AUTH_ERROR_MESSAGES.FORBIDDEN!;
  if (error.status === 500) return AUTH_ERROR_MESSAGES.INTERNAL_SERVER_ERROR!;
  if (error.code) {
    return (
      AUTH_ERROR_MESSAGES[error.code as AuthErrorCode] ??
      error.message ??
      "Une erreur est survenue."
    );
  }
  return error.message ?? "Une erreur est survenue. Veuillez réessayer.";
}
