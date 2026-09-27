import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function requireAdmin() {
  const session = await getSession();
  if (!session) {
    return { session: null, response: NextResponse.json({ error: "Ruxsat berilmagan." }, { status: 401 }) };
  }
  return { session, response: null };
}
