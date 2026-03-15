import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.string().min(1).optional(),
  personalityDescription: z.string().min(1).optional(),
  age: z.string().optional(),
  photoUrl: z.string().optional(),
  voiceType: z.enum(["ai", "uploaded", "narrator"]).optional(),
});

async function getCharacter(characterId: string, projectId: string, userId: string) {
  return prisma.character.findFirst({
    where: {
      id: characterId,
      projectId,
      project: { userId },
    },
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; characterId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: projectId, characterId } = await params;
  const character = await getCharacter(characterId, projectId, session.user.id);

  if (!character) {
    return NextResponse.json({ error: "Character not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid input" },
      { status: 400 }
    );
  }

  const updated = await prisma.character.update({
    where: { id: characterId },
    data: parsed.data,
  });

  return NextResponse.json({ character: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; characterId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: projectId, characterId } = await params;
  const character = await getCharacter(characterId, projectId, session.user.id);

  if (!character) {
    return NextResponse.json({ error: "Character not found" }, { status: 404 });
  }

  await prisma.character.delete({ where: { id: characterId } });
  return NextResponse.json({ message: "Character deleted" });
}
