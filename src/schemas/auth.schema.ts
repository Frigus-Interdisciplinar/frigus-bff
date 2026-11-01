import { z } from "zod";

// validacao do login de usuario
export const loginSchema = z.object({
  email: z.string().email("Email invalido"),
  rawPassword: z.string().min(1, "Senha deve ser preenchida"),
  rememberMe: z.boolean().default(false),
});

export const googleLoginSchema = z.object({
  idToken: z.string().trim().min(1).max(8192),
  rememberMe: z.boolean().default(false),
});

// validacao de registro de novo usuario
export const registerSchema = z.object({
  name: z.string().trim().min(1, "O nome e obrigatorio"),
  birthDate: z
    .string()
    .regex(
      /^\d{2}\/\d{2}\/\d{4}$/,
      "Data de nascimento deve seguir o formato dd/MM/yyyy",
    ),
  email: z.string().email("Email invalido"),
  rawPassword: z
    .string()
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,20}$/,
      "A senha deve conter de 8 a 20 caracteres, com letra maiuscula, minuscula, numero e caractere especial",
    ),
  accountType: z.enum(["DOMESTIC", "COMMERCIAL", "BUSINESS"]).default("DOMESTIC"),
});

export const refreshSchema = z.object({
  refreshToken: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email invalido"),
});

export const resetPasswordSchema = z.object({
  email: z.string().email("Email invalido"),
  code: z.string().regex(/^\d{6}$/, "O código deve ter 6 dígitos"),
  newPassword: registerSchema.shape.rawPassword,
});

export const verifyResetCodeSchema = resetPasswordSchema.pick({
  email: true,
  code: true,
});
