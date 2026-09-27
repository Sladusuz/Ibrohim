import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(2, "Ismingizni kiriting").max(120),
  email: z.string().email("Email manzilini to'g'ri kiriting"),
  phone: z.string().max(40).optional().or(z.literal("")),
  budget: z.string().max(60).optional().or(z.literal("")),
  service: z.string().max(120).optional().or(z.literal("")),
  message: z.string().min(10, "Xabar kamida 10 belgidan iborat bo'lishi kerak").max(4000),
  // honeypot field — bots fill it, humans never see it
  website: z.string().max(0).optional().or(z.literal("")),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Ma'lumotlar noto'g'ri.";
    return NextResponse.json({ error: firstError }, { status: 400 });
  }

  const { name, email, phone, budget, service, message } = parsed.data;

  await prisma.message.create({
    data: {
      name,
      email,
      phone: phone || null,
      budget: budget || null,
      service: service || null,
      message,
    },
  });

  return NextResponse.json({ ok: true });
}
