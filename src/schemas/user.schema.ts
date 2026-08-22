import { z } from "zod";

// validacao para atualizacao completa do perfil
export const userPutSchema = z.object({
  name: z.string().min(1, "O nome e obrigatorio"),
  birthDate: z
    .string()
    .regex(
      /^\d{2}\/\d{2}\/\d{4}$/,
      "Data de nascimento deve seguir o formato dd/MM/yyyy",
    ),
});

// validacao para atualizacao parcial do perfil
export const userPatchSchema = z.object({
  name: z.string().min(1, "O nome e obrigatorio").optional(),
  birthDate: z
    .string()
    .regex(
      /^\d{2}\/\d{2}\/\d{4}$/,
      "Data de nascimento deve seguir o formato dd/MM/yyyy",
    )
    .optional(),
});

// validacao para alteracao de senha
export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "A senha atual e obrigatoria"),
  newPassword: z
    .string()
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,20}$/,
      "A nova senha deve conter de 8 a 20 caracteres, com letra maiuscula, minuscula, numero e caractere especial",
    ),
});

// validacao para reset de senha feito pelo admin
export const adminResetPasswordSchema = z.object({
  newPassword: z.string().min(8, "A senha deve ter no minimo 8 caracteres"),
});

// validacao para atualizacao de role
export const userRoleUpdateSchema = z.object({
  role: z.enum(["USER", "ADMIN"]),
});

// validacao para atualizacao do tipo de conta
export const userAccountTypeUpdateSchema = z.object({
  accountType: z.enum(["DOMESTIC", "BUSINESS", "COMMERCIAL"]),
});
