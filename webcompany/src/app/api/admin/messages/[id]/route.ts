import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

type Params = Promise<{ id: string }>;

const patchSchema = z.object({
  status: z.enum(["new", "read", "replied"]),
});

export async function PATCH(request: Request, { params }: { params: Params }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Noto'g'ri holat." }, { status: 400 });
  }

  const message = await prisma.message.update({
    where: { id },
    data: { status: parsed.data.status },
  });

  return NextResponse.json({ message });
}

export async function DELETE(_request: Request, { params }: { params: Params }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  await prisma.message.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
