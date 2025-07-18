import * as z from "zod";
import {
  CountryCallingCode,
  getCountries,
  getCountryCallingCode,
  isValidPhoneNumber,
} from "libphonenumber-js";
import { Role } from "@repo/database";

const getCountryCodes = (): string[] => {
  const countryCodes = getCountries();
  const callingCodes = countryCodes.map(
    (code) => `+${getCountryCallingCode(code)}`
  ) as CountryCallingCode[];
  return callingCodes;
};
export const RegisterSchema = z
  .object({
    name: z
      .string({ error: "İsim metin formatında olmalıdır" })
      .min(2, { abort: true, error: "İsim en az 2 karakter olmalıdır" })
      .max(50, { error: "İsim en fazla 50 karakter olabilir" }),
    surname: z
      .string({ error: "Soyisim metin formatında olmalıdır" })
      .min(2, {
        abort: true,
        error: "Soyisim en az 2 karakter olmalıdır",
      })
      .max(50, {
        error: "Soyisim en fazla 50 karakter olabilir",
      }),
    email: z
      .email({
        error: "Geçerli bir email adresi giriniz",
      })
      .optional()
      .nullable(),
    phone: z
      .string({ error: "Telefon numarası metin formatında olmalıdır" })
      .optional()
      .nullable(),
    password: z
      .string({
        error: "Şifre metin formatında olmalıdır",
      })
      .min(6, {
        abort: true,
        error: "Şifre en az 6 karakter olmalıdır",
      })
      .max(50, {
        error: "Şifre en fazla 50 karakter olabilir",
      }),
    confirmPassword: z
      .string({
        error: "Şifre tekrarı metin formatında olmalıdır",
      })
      .min(6, {
        abort: true,
        error: "Şifre tekrarı en az 6 karakter olmalıdır",
      })
      .max(50, {
        error: "Şifre tekrarı en fazla 50 karakter olabilir",
      }),
  })
  .check(({ value, issues }) => {
    // Şifre kontrolü
    if (value.password !== value.confirmPassword) {
      issues.push({
        code: "custom",
        input: value.confirmPassword,
        message: "Şifreler eşleşmiyor",
      });
    }

    // Email ve telefon kontrolü
    const isEmailProvided = value.email && value.email.trim() !== "";

    // Telefon kontrolü - calling code'ları boş sayarak
    const callingCodes = getCountryCodes();
    const phoneValue = value.phone?.trim() || "";

    // Telefon sadece calling code mu yoksa gerçek numara mı?
    const isPhoneJustCallingCode = callingCodes.includes(
      phoneValue as CountryCallingCode
    );
    const isPhoneEmpty = phoneValue === "";
    const isPhoneProvided = !isPhoneEmpty && !isPhoneJustCallingCode;

    // Ne email ne telefon varsa hata
    if (!isEmailProvided && !isPhoneProvided) {
      issues.push({
        code: "custom",
        input: value.email,
        message: "Email veya telefon numarası gereklidir",
      });
      return;
    }

    // Telefon numarası varsa geçerli olup olmadığını kontrol et
    if (isPhoneProvided) {
      try {
        if (!isValidPhoneNumber(phoneValue)) {
          issues.push({
            code: "custom",
            input: value.phone,
            message: "Geçerli bir telefon numarası giriniz",
          });
        }
      } catch (error) {
        issues.push({
          code: "custom",
          input: value.phone,
          message: "Geçerli bir telefon numarası giriniz",
        });
      }
    }

    // Email varsa geçerli olup olmadığını kontrol et
    if (isEmailProvided) {
      const emailRegex = z.email();
      if (!emailRegex.safeParse(value.email!).success) {
        issues.push({
          code: "custom",
          input: value.email,
          message: "Geçerli bir email adresi giriniz",
        });
      }
    }
  });

export type RegisterSchemaType = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("email"),
    email: z.email({
      error: "Geçerli bir email adresi giriniz",
    }),
    password: z
      .string({
        error: "Şifre metin formatında olmalıdır",
      })
      .min(6, {
        abort: true,
        error: "Şifre en az 6 karakter olmalıdır",
      })
      .max(50, {
        error: "Şifre en fazla 50 karakter olabilir",
      }),
  }),
  z.object({
    type: z.literal("phone"),
    phone: z
      .string({
        error: "Telefon numarası metin formatında olmalıdır",
      })
      .refine(
        (val) => {
          const isValidPhone = isValidPhoneNumber(val);
          if (!isValidPhone) {
            return false;
          }
          return true;
        },
        {
          error: "Geçerli bir telefon numarası giriniz",
        }
      ),
    password: z
      .string({
        error: "Şifre metin formatında olmalıdır",
      })
      .min(6, {
        abort: true,
        error: "Şifre en az 6 karakter olmalıdır",
      })
      .max(50, {
        error: "Şifre en fazla 50 karakter olabilir",
      }),
  }),
]);

export type LoginSchemaType = z.infer<typeof LoginSchema>;

export interface TokenPayload {
  id: string;
  name: string;
  verified: Date | null;
  role: Role;
  email?: string;
  phone?: string;
}
