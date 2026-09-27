import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { slugify } from "@/lib/utils";

const schema = z.object({
  title: z.string().min(2),
  slug: z.string().optional(),
  summary: z.string().min(5),
  description: z.string().min(5),
  icon: z.string().min(1),
  order: z.number().default(0),
});

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  const services = await prisma.service.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json({ services });
}

export async function POST(request: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ma'lumotlar noto'g'ri." },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const slug = data.slug?.trim() ? slugify(data.slug) : slugify(data.title);

  const existing = await prisma.service.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json(
      { error: "Ushbu slug bilan xizmat allaqachon mavjud." },
      { status: 409 }
    );
  }

  const service = await prisma.service.create({
    data: {
      title: data.title,
      slug,
      summary: data.summary,
      description: data.description,
      icon: data.icon,
      order: data.order,
    },
  });

  return NextResponse.json({ service });
}
