import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { slugify } from "@/lib/utils";

type Params = Promise<{ id: string }>;

const optionalStr = z.string().optional().or(z.literal(""));

const schema = z.object({
  title: z.string().min(2),
  slug: z.string().optional(),
  summary: z.string().min(5),
  description: z.string().min(5),
  titleRu: optionalStr,
  summaryRu: optionalStr,
  descriptionRu: optionalStr,
  titleEn: optionalStr,
  summaryEn: optionalStr,
  descriptionEn: optionalStr,
  icon: z.string().min(1),
  order: z.number().default(0),
});

export async function PATCH(request: Request, { params }: { params: Params }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
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

  const conflict = await prisma.service.findFirst({ where: { slug, NOT: { id } } });
  if (conflict) {
    return NextResponse.json(
      { error: "Ushbu slug bilan boshqa xizmat mavjud." },
      { status: 409 }
    );
  }

  const service = await prisma.service.update({
    where: { id },
    data: {
      title: data.title,
      slug,
      summary: data.summary,
      description: data.description,
      titleRu: data.titleRu || null,
      summaryRu: data.summaryRu || null,
      descriptionRu: data.descriptionRu || null,
      titleEn: data.titleEn || null,
      summaryEn: data.summaryEn || null,
      descriptionEn: data.descriptionEn || null,
      icon: data.icon,
      order: data.order,
    },
  });

  return NextResponse.json({ service });
}

export async function DELETE(_request: Request, { params }: { params: Params }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  await prisma.service.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
