import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Request } from "express";

export const PREVIEW_USER_ID = "preview-user";
export const PREVIEW_EMAIL = "narendernehla2026@gmail.com";

export function hasSupabaseConfig() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
}

export async function getRequestContext(req: Request): Promise<{
  userId: string;
  email: string;
  client: SupabaseClient | null;
  isPreview: boolean;
}> {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const token = req.header("authorization")?.replace(/^Bearer\s+/i, "");

  if (!url || !anonKey || !token) {
    return {
      userId: PREVIEW_USER_ID,
      email: PREVIEW_EMAIL,
      client: null,
      isPreview: true,
    };
  }

  const client = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data, error } = await client.auth.getUser(token);

  if (error || !data.user) {
    throw new Error("AUTHENTICATION_REQUIRED");
  }

  return {
    userId: data.user.id,
    email: data.user.email ?? PREVIEW_EMAIL,
    client,
    isPreview: false,
  };
}