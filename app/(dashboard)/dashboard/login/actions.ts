"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DASH_COOKIE, passwordMatches, sessionToken } from "@/lib/dashboard/auth";

const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export type LoginState = { error?: string };

/** Validate the shared password and set the httpOnly session cookie. */
export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const submitted = String(formData.get("password") ?? "");

  if (!passwordMatches(submitted)) {
    return { error: "Incorrect password. Try again." };
  }

  const jar = await cookies();
  jar.set(DASH_COOKIE, await sessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });

  redirect("/dashboard");
}

/** Clear the session cookie and return to login. */
export async function logout(): Promise<void> {
  const jar = await cookies();
  jar.delete(DASH_COOKIE);
  redirect("/dashboard/login");
}
