import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { slugify } from "@/lib/utils";

const optionalStr = z.string().optional().or(z.literal(""));

const schema = z.object({
  title: z.string().min(2),
  slug: z.string().optional(),
  category: z.string().min(2),
  summary: z.string().min(5),
  description: z.string().min(5),
  titleRu: optionalStr,
  categoryRu: optionalStr,
  summaryRu: optionalStr,
  descriptionRu: optionalStr,
  titleEn: optionalStr,
  categoryEn: optionalStr,
  summaryEn: optionalStr,
  descriptionEn: optionalStr,
  client: z.string().optional().or(z.literal("")),
  year: z.string().optional().or(z.literal("")),
  duration: z.string().optional().or(z.literal("")),
  link: z.string().optional().or(z.literal("")),
  cover: z.string().min(1),
  stack: z.array(z.string()).default([]),
  gallery: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  order: z.number().default(0),
});

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  const projects = await prisma.project.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json({ projects });
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

  const existing = await prisma.project.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json(
      { error: "Ushbu slug bilan loyiha allaqachon mavjud." },
      { status: 409 }
    );
  }

  const project = await prisma.project.create({
    data: {
      title: data.title,
      slug,
      category: data.category,
      summary: data.summary,
      description: data.description,
      titleRu: data.titleRu || null,
      categoryRu: data.categoryRu || null,
      summaryRu: data.summaryRu || null,
      descriptionRu: data.descriptionRu || null,
      titleEn: data.titleEn || null,
      categoryEn: data.categoryEn || null,
      summaryEn: data.summaryEn || null,
      descriptionEn: data.descriptionEn || null,
      client: data.client || null,
      year: data.year || null,
      duration: data.duration || null,
      link: data.link || null,
      cover: data.cover,
      stack: JSON.stringify(data.stack),
      gallery: JSON.stringify(data.gallery.length ? data.gallery : [data.cover]),
      featured: data.featured,
      order: data.order,
    },
  });

  return NextResponse.json({ project });
}
