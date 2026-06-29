import { z } from "zod";
import { Role } from "../../types/user";

export const userSchema = z.object({
  lastname: z
    .string({ error: "Le nom est invalide." })
    .trim()
    .min(2, { error: "Le nom doit contenir au moins 2 caractères." }),
  firstname: z
    .string({ error: "Le prénom est invalide." })
    .trim()
    .min(2, { error: "Le prénom doit contenir au moins 2 caractères." }),
  email: z
    .email({ error: "Adresse email invalide." })
    .trim()
    .min(1, { error: "L'email est requis." }),
  phone: z
    .string({ error: "Le numéro de téléphone est invalide." })
    .trim()
    .length(9, { error: "Le numéro de téléphone doit contenir 9 chiffres." }),
  city: z.string().optional(),
  role: z.enum(["ADMIN", "USER", "WORKSPACE"], {
    error: "Le role de l'utilisateur est obligatoire.",
  }),
  emailVerified: z.boolean(),
});
