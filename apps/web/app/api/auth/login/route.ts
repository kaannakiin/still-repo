import { LoginSchemaType } from "@repo/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as LoginSchemaType;

    const loginReq = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: body.type === "email" ? body.email : body.phone,
          password: body.password,
        }),
      }
    );

    if (!loginReq.ok) {
      return NextResponse.json(
        {
          success: false,
          message: `${body.type === "email" ? "E-Posta" : "Telefon Numarası"} veya şifre yanlış.`,
        },
        {
          status: loginReq.status,
          statusText: `${body.type === "email" ? "E-Posta" : "Telefon Numarası"} veya şifre yanlış.`,
        }
      );
    }

    const response = NextResponse.json(
      {
        success: true,
        message: "Başarıyla giriş yaptınız.",
      },
      { status: 200 }
    );

    const loginSetCookie = loginReq.headers.getSetCookie();
    if (loginSetCookie) {
      loginSetCookie.forEach((cookie) => {
        response.headers.append("Set-Cookie", cookie);
      });
    }

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Giriş işlemi sırasında bir hata oluştu.",
      },
      { status: 500, statusText: "Giriş işlemi sırasında bir hata oluştu." }
    );
  }
}
