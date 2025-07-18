"use client";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { LoginSchemaType, LoginSchema } from "@repo/types";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Card,
  Group,
  LoadingOverlay,
  PasswordInput,
  Text,
  TextInput,
} from "@mantine/core";
import { IconMail, IconPhone } from "@tabler/icons-react";
import CustomPhoneInput from "../../../../_components/CustomPhoneInput";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

const LoginForm = () => {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
    setError,
    reset,
    watch,
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { type: "email", email: "", password: "" },
  });

  const type = watch("type") || "email";
  const { push } = useRouter();
  const params = useSearchParams();
  const onSubmit: SubmitHandler<LoginSchemaType> = async (data) => {
    try {
      const loginReq = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!loginReq.ok) {
        setError("root", {
          message: loginReq.statusText,
        });
      } else {
        const redirectUrl = params.get("redirect") || "/";
        push(redirectUrl);
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("root", {
        message:
          "Giriş işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.",
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
      {type === "email" ? (
        <Controller
          control={control}
          name="email"
          render={({ field, fieldState }) => (
            <TextInput
              type="email"
              {...field}
              error={fieldState.error?.message}
              label="E-Posta"
            />
          )}
        />
      ) : (
        <Controller
          control={control}
          name="phone"
          render={({ field, fieldState }) => (
            <CustomPhoneInput
              label="Telefon Numarası"
              onChange={field.onChange}
              value={field.value || ""}
              error={fieldState.error?.message}
              onBlur={field.onBlur}
            />
          )}
        />
      )}
      <Button
        variant="subtle"
        fullWidth
        justify="center"
        leftSection={
          type === "email" ? <IconPhone size={16} /> : <IconMail size={16} />
        }
        onClick={() => {
          if (type == "email") {
            reset({
              type: "phone",
              phone: "",
              password: "",
            });
          } else {
            reset({
              type: "email",
              email: "",
              password: "",
            });
          }
        }}
      >
        {type === "email" ? "Telefon ile Giriş Yap" : "E-Posta ile Giriş Yap"}
      </Button>
      <Controller
        control={control}
        name="password"
        render={({ field, fieldState }) => (
          <PasswordInput
            {...field}
            error={fieldState.error?.message}
            label="Şifre"
          />
        )}
      />
      {errors.root && (
        <Text c="red" fz={"sm"}>
          {errors.root.message}
        </Text>
      )}
      <Group justify="space-between">
        <Link href={"/register"} className="flex flex-row gap-1 items-center">
          <Text fz={"sm"}>Hesabınız yok mu?</Text>
          <Text fz={"sm"} fw={700}>
            Kayıt Ol
          </Text>
        </Link>
        <Button type="submit">Giriş Yap</Button>
      </Group>
    </Card>
  );
};

export default LoginForm;
