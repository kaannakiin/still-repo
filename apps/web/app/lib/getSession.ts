"use server";
import { TokenPayload } from "@repo/types";
import { cookies } from "next/headers";

export async function getSession() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value || null;

    const authMe = await fetch(`${process.env.BACKEND_URL}/auth/me`, {
      method: "GET",
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
    });
    if (!authMe.ok) {
      return null;
    }
    const session = (await authMe.json()) as TokenPayload;
    return session;
  } catch (error) {
    console.error("Error fetching session:", error);
    return null;
  }
}
