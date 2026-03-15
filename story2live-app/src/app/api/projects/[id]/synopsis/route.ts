import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateSynopsis } from "@/lib/openai";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: projectId } = await params;
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: session.user.id },
    include: { storyInputs: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const storyTexts = project.storyInputs
    .filter((si) => si.type === "text" && si.content)
    .map((si) => si.content!)
    .join("\n\n");

  if (!storyTexts) {
    return NextResponse.json(
      { error: "No story text found. Please add your story first." },
      { status: 400 }
    );
  }

  const result = await generateSynopsis(storyTexts, project.title, project.genre);

  const synopsis = await prisma.synopsis.upsert({
    where: { projectId },
    create: {
      projectId,
      synopsis: result.synopsis,
      themes: JSON.stringify(result.themes),
      arcBeginning: result.arcBeginning,
      arcConflict: result.arcConflict,
      arcTurning: result.arcTurning,
      arcResolution: result.arcResolution,
    },
    update: {
      synopsis: result.synopsis,
      themes: JSON.stringify(result.themes),
      arcBeginning: result.arcBeginning,
      arcConflict: result.arcConflict,
      arcTurning: result.arcTurning,
      arcResolution: result.arcResolution,
    },
  });

  // Auto-create suggested characters if they don't exist yet
  if (result.suggestedCharacters && result.suggestedCharacters.length > 0) {
    const existingChars = await prisma.character.count({ where: { projectId } });
    if (existingChars === 0) {
      await prisma.character.createMany({
        data: result.suggestedCharacters.map((c) => ({
          projectId,
          name: c.name,
          role: c.role,
          personalityDescription: c.description,
          isAiSuggested: true,
        })),
      });
    }
  }

  return NextResponse.json({
    synopsis: {
      ...synopsis,
      themes: JSON.parse(synopsis.themes),
    },
    suggestedCharacters: result.suggestedCharacters,
  });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: projectId } = await params;
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: session.user.id },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const synopsis = await prisma.synopsis.findUnique({ where: { projectId } });
  if (!synopsis) {
    return NextResponse.json({ synopsis: null });
  }

  return NextResponse.json({
    synopsis: { ...synopsis, themes: JSON.parse(synopsis.themes) },
  });
}
