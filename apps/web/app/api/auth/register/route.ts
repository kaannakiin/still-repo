import { RegisterSchemaType } from "@repo/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RegisterSchemaType;
    const registerReq = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/register`,
      {
        method: "POST",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      }
    );
    if (!registerReq.ok) {
      return NextResponse.json(
        { success: false },
        { status: registerReq.status, statusText: registerReq.statusText }
      );
    }

    const emailOrPhoneLogin = body.email ? body.email : body.phone;

    const loginReq = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`,
      {
        method: "POST",
        body: JSON.stringify({
          username: emailOrPhoneLogin,
          password: body.password,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!loginReq.ok) {
      return NextResponse.json(
        { success: false },
        { status: loginReq.status, statusText: loginReq.statusText }
      );
    }

    const setCookies = loginReq.headers.getSetCookie();
    const response = NextResponse.json(
      { success: true },
      {
        status: 200,
      }
    );
    if (setCookies) {
      setCookies.forEach((cookie) => {
        response.headers.append("Set-Cookie", cookie);
      });
    }
    return response;
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        message:
          "Kayıt işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.",
      },
      {
        status: 500,
      }
    );
  }
}
