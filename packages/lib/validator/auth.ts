import { z } from "zod";

export const signInSchema = z.object({
  email: z
    .email({ error: "Adresse email invalide." })
    .trim()
    .min(1, { error: "L'email est requis." }),
  password: z
    .string({ error: "Le mot de passe est invalide." })
    .min(8, { error: "Le mot de passe doit contenir au moins 8 caractères." }),
});

export const signUpSchema = z.object({
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
  password: z
    .string({ error: "Le mot de passe est invalide." })
    .min(8, { error: "Le mot de passe doit contenir au moins 8 caractères." }),
});

export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "Le code doit contenir exactement 6 chiffres.")
    .regex(/^\d+$/, "Le code ne doit contenir que des chiffres."),
});
