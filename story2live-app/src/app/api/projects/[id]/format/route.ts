import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateStoryContent } from "@/lib/openai";
import { z } from "zod";

const formatSchema = z.object({
  outputFormat: z.enum(["book", "movie", "documentary"]),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: projectId } = await params;
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: session.user.id },
    include: { synopsis: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  if (!project.synopsis) {
    return NextResponse.json(
      { error: "Generate a synopsis first before selecting format" },
      { status: 400 }
    );
  }

  const body = await req.json();
  const parsed = formatSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid format. Choose book, movie, or documentary" },
      { status: 400 }
    );
  }

  const { outputFormat } = parsed.data;
  const themes = JSON.parse(project.synopsis.themes) as string[];

  const generatedContent = await generateStoryContent(
    project.synopsis.synopsis,
    themes,
    outputFormat,
    project.title
  );

  const synopsis = await prisma.synopsis.update({
    where: { projectId },
    data: { outputFormat, generatedContent },
  });

  // Also update the project's storyType to match the format
  await prisma.project.update({
    where: { id: projectId },
    data: { storyType: outputFormat },
  });

  return NextResponse.json({
    synopsis: { ...synopsis, themes: JSON.parse(synopsis.themes) },
    generatedContent: (() => {
      try { return JSON.parse(generatedContent); } catch { return {}; }
    })(),
  });
}
