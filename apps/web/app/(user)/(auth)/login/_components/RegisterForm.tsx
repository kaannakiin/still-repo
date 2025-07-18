"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Card,
  Group,
  LoadingOverlay,
  PasswordInput,
  SimpleGrid,
  Text,
  TextInput,
} from "@mantine/core";
import { RegisterSchema, RegisterSchemaType } from "@repo/types";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import CustomPhoneInput from "../../../../_components/CustomPhoneInput";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

const RegisterForm = () => {
  const {
    control,
    handleSubmit,
    setError,
    formState: { isSubmitting, errors },
  } = useForm<RegisterSchemaType>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      confirmPassword: "",
      email: "",
      name: "",
      password: "",
      phone: "",
      surname: "",
    },
  });

  const { push } = useRouter();
  const searchParams = useSearchParams();
  const onSubmit: SubmitHandler<RegisterSchemaType> = async (data) => {
    try {
      const registerReq = await fetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
      if (!registerReq.ok) {
        setError("root", {
          message: registerReq.statusText,
        });
      } else {
        const redirectUrl = searchParams.get("redirect") || "/";
        push(redirectUrl);
      }
    } catch {
      setError("root", {
        message:
          "Kayıt işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.",
      });
    }
  };

  return (
    <Card
      component="form"
      withBorder
      className="w-full max-w-sm sm:max-w-md gap-3"
      p="xl"
      onSubmit={handleSubmit(onSubmit)}
    >
      <LoadingOverlay
        visible={isSubmitting}
        overlayProps={{
          blur: 2,
          backgroundOpacity: 0.55,
        }}
      />
      <SimpleGrid cols={{ xs: 1, sm: 1, md: 2 }}>
        <Controller
          control={control}
          name="name"
          render={({ field, fieldState }) => (
            <TextInput
              {...field}
              error={fieldState.error?.message}
              label="İsim"
            />
          )}
        />
        <Controller
          control={control}
          name="surname"
          render={({ field, fieldState }) => (
            <TextInput
              {...field}
              error={fieldState.error?.message}
              label="Soyisim"
            />
          )}
        />
      </SimpleGrid>
      <Controller
        control={control}
        name="email"
        render={({ field, fieldState }) => (
          <TextInput
            {...field}
            value={field.value || ""}
            error={fieldState.error?.message}
            label="E-Posta"
            type="email"
          />
        )}
      />
      <Controller
        control={control}
        name="phone"
        render={({ field, fieldState }) => (
          <CustomPhoneInput
            {...field}
            error={fieldState.error?.message}
            label="Telefon Numarası"
            onBlur={field.onBlur}
            onChange={field.onChange}
            value={field.value || ""}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field, fieldState }) => (
          <PasswordInput
            {...field}
            error={fieldState.error?.message}
            label="Şifre"
            type="password"
          />
        )}
      />
      <Controller
        control={control}
        name="confirmPassword"
        render={({ field, fieldState }) => (
          <PasswordInput
            {...field}
            error={fieldState.error?.message}
            label="Şifre Tekrarı"
          />
        )}
      />
      {errors.root && (
        <Text c={"red"} fz={"sm"}>
          {errors.root.message}
        </Text>
      )}
      <Group justify="space-between">
        <Link href={"/login"} className="flex flex-row items-center gap-1">
          <Text fz="sm">Bir hesabınız var mı ?</Text>
          <Text fz={"sm"} fw={700}>
            Giriş Yap
          </Text>
        </Link>
        <Button type="submit">Kayıt Ol</Button>
      </Group>
    </Card>
  );
};

export default RegisterForm;
