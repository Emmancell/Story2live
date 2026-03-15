import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Sparkles,
  ArrowLeft,
  BookOpen,
  Film,
  Video,
  Users,
  Tag,
  ChevronRight,
} from "lucide-react";
import { CharacterManagementPanel } from "@/components/character-management-panel";

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id: projectId } = await params;
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: session.user.id },
    include: {
      storyInputs: true,
      synopsis: true,
      characters: true,
    },
  });

  if (!project) redirect("/dashboard");

  const synopsis = project.synopsis;
  const themes = synopsis ? (JSON.parse(synopsis.themes) as string[]) : [];
  const generatedContent = synopsis?.generatedContent
    ? JSON.parse(synopsis.generatedContent)
    : null;

  const formatIcon = { book: BookOpen, movie: Film, documentary: Video };
  const FormatIcon = formatIcon[project.storyType as keyof typeof formatIcon] || BookOpen;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Navbar */}
      <nav className="border-b border-white/10 bg-black/30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-400" />
            <span className="text-lg font-bold text-white">Story2Live</span>
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </Link>

        {/* Project Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-900/40 border border-purple-500/30 rounded-xl flex items-center justify-center">
              <FormatIcon className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">{project.title}</h1>
              <p className="text-gray-400 text-sm capitalize">
                {project.storyType} • {project.genre} • {project.language}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            {!synopsis && (
              <Link
                href={`/projects/${projectId}/story`}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
              >
                Continue Setup <ChevronRight className="w-4 h-4" />
              </Link>
            )}
            {synopsis && !synopsis.outputFormat && (
              <Link
                href={`/projects/${projectId}/format`}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
              >
                Choose Format <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left column - Synopsis & Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Synopsis */}
            {synopsis ? (
              <>
                <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/20 border border-purple-500/30 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-purple-400" />
                    Story Synopsis
                  </h2>
                  <p className="text-gray-200 leading-relaxed">{synopsis.synopsis}</p>
                </div>

                {/* Themes */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Tag className="w-5 h-5 text-purple-400" />
                    Main Themes
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {themes.map((theme) => (
                      <span
                        key={theme}
                        className="bg-purple-900/40 border border-purple-500/30 text-purple-300 px-3 py-1.5 rounded-full text-sm capitalize"
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Story Arc */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-white mb-4">Story Arc</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Beginning", value: synopsis.arcBeginning, c: "blue" },
                      { label: "Conflict", value: synopsis.arcConflict, c: "orange" },
                      { label: "Turning Point", value: synopsis.arcTurning, c: "yellow" },
                      { label: "Resolution", value: synopsis.arcResolution, c: "green" },
                    ].map((a) => (
                      <div key={a.label} className="bg-white/5 border border-white/10 rounded-xl p-3">
                        <p className="text-xs font-semibold text-gray-400 mb-1">{a.label}</p>
                        <p className="text-gray-200 text-sm leading-relaxed line-clamp-3">{a.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Generated Content */}
                {generatedContent && synopsis.outputFormat && (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <FormatIcon className="w-5 h-5 text-purple-400" />
                      Generated {synopsis.outputFormat.charAt(0).toUpperCase() + synopsis.outputFormat.slice(1)} Structure
                    </h2>
                    <GeneratedContentView format={synopsis.outputFormat} content={generatedContent} />
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                <Sparkles className="w-10 h-10 text-purple-400/50 mx-auto mb-4" />
                <h2 className="text-lg font-semibold text-white mb-2">No Synopsis Yet</h2>
                <p className="text-gray-400 text-sm mb-4">
                  Add your story and generate an AI synopsis to get started.
                </p>
                <Link
                  href={`/projects/${projectId}/story`}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2"
                >
                  Add Story <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

          {/* Right column - Characters */}
          <div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-semibold text-white">Characters</h2>
                <span className="ml-auto bg-purple-900/40 text-purple-300 text-xs px-2 py-0.5 rounded-full">
                  {project.characters.length}
                </span>
              </div>
              <CharacterManagementPanel
                projectId={projectId}
                initialCharacters={project.characters}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GeneratedContentView({
  format,
  content,
}: {
  format: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: Record<string, any>;
}) {
  if (format === "book" && content.chapters) {
    return (
      <div className="space-y-4">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {content.chapters.map((ch: any) => (
          <div key={ch.number} className="border border-white/10 rounded-xl p-4">
            <p className="text-purple-400 text-xs font-bold mb-1">CHAPTER {ch.number}</p>
            <h3 className="text-white font-semibold mb-2">{ch.title}</h3>
            <p className="text-gray-400 text-sm">{ch.summary}</p>
          </div>
        ))}
      </div>
    );
  }

  if (format === "movie" && content.acts) {
    return (
      <div className="space-y-4">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {content.acts.map((act: any) => (
          <div key={act.act} className="border border-white/10 rounded-xl p-4">
            <p className="text-purple-400 text-xs font-bold mb-1">ACT {act.act}</p>
            <h3 className="text-white font-semibold mb-2">{act.title}</h3>
            <p className="text-gray-400 text-sm mb-3">{act.description}</p>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {act.scenes?.map((scene: any) => (
              <div key={scene.number} className="ml-4 border-l-2 border-purple-500/30 pl-3 mb-2">
                <p className="text-xs text-gray-500 font-mono">{scene.heading}</p>
                <p className="text-gray-300 text-xs">{scene.description}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (format === "documentary" && content.segments) {
    return (
      <div className="space-y-4">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {content.segments.map((seg: any) => (
          <div key={seg.number} className="border border-white/10 rounded-xl p-4">
            <p className="text-orange-400 text-xs font-bold mb-1">SEGMENT {seg.number}</p>
            <h3 className="text-white font-semibold mb-2">{seg.title}</h3>
            <p className="text-gray-400 text-sm italic mb-2">&ldquo;{seg.narration}&rdquo;</p>
            {seg.interviewQuestions && (
              <div>
                <p className="text-xs text-gray-500 font-semibold mb-1">Interview Questions:</p>
                <ul className="space-y-1">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {seg.interviewQuestions.map((q: any, i: number) => (
                    <li key={i} className="text-xs text-gray-400">• {q}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <pre className="text-gray-400 text-xs overflow-auto">
      {JSON.stringify(content, null, 2)}
    </pre>
  );
}
