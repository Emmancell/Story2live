import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Sparkles,
  PlusCircle,
  BookOpen,
  Film,
  Video,
  Clock,
  LogOut,
} from "lucide-react";
import { SignOutButton } from "@/components/sign-out-button";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    include: {
      synopsis: { select: { id: true, outputFormat: true } },
      characters: { select: { id: true } },
      storyInputs: { select: { id: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const formatIcon = {
    book: BookOpen,
    movie: Film,
    documentary: Video,
  };

  const formatColor = {
    book: "text-blue-400",
    movie: "text-purple-400",
    documentary: "text-orange-400",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Navbar */}
      <nav className="border-b border-white/10 bg-black/30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-400" />
            <span className="text-lg font-bold text-white">Story2Live</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm">
              Welcome, {session.user.name || session.user.email}
            </span>
            <SignOutButton />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">My Projects</h1>
            <p className="text-gray-400 mt-1">
              {projects.length === 0
                ? "Create your first story project to get started"
                : `You have ${projects.length} project${projects.length === 1 ? "" : "s"}`}
            </p>
          </div>
          <Link
            href="/projects/new"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all"
          >
            <PlusCircle className="w-5 h-5" />
            New Project
          </Link>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl">
            <Sparkles className="w-12 h-12 text-purple-400/50 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No projects yet</h2>
            <p className="text-gray-400 mb-8">
              Start your first story project and let AI help bring it to life
            </p>
            <Link
              href="/projects/new"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2 transition-all"
            >
              <PlusCircle className="w-5 h-5" />
              Create First Project
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const Icon = formatIcon[project.storyType as keyof typeof formatIcon] || BookOpen;
              const colorClass = formatColor[project.storyType as keyof typeof formatColor] || "text-gray-400";

              // Determine progress step
              const hasStory = project.storyInputs.length > 0;
              const hasSynopsis = !!project.synopsis;
              const hasFormat = !!project.synopsis?.outputFormat;
              const hasCharacters = project.characters.length > 0;

              const progress = [hasStory, hasSynopsis, hasFormat, hasCharacters].filter(Boolean).length;
              const nextStep = !hasStory
                ? `/projects/${project.id}/story`
                : !hasSynopsis
                ? `/projects/${project.id}/synopsis`
                : !hasFormat
                ? `/projects/${project.id}/format`
                : `/projects/${project.id}`;

              return (
                <Link
                  href={nextStep}
                  key={project.id}
                  className="bg-white/5 border border-white/10 hover:border-purple-500/40 rounded-2xl p-6 transition-all hover:bg-white/10 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2 bg-white/10 rounded-lg ${colorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs text-gray-500 capitalize">{project.storyType}</span>
                  </div>

                  <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors mb-1 line-clamp-1">
                    {project.title}
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">{project.genre} • {project.language}</p>

                  {/* Progress indicator */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{progress}/4 steps</span>
                    </div>
                    <div className="flex gap-1">
                      {["Story", "Synopsis", "Format", "Characters"].map((step, i) => (
                        <div
                          key={step}
                          className={`flex-1 h-1.5 rounded-full ${
                            [hasStory, hasSynopsis, hasFormat, hasCharacters][i]
                              ? "bg-purple-500"
                              : "bg-white/10"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex gap-1 text-xs text-gray-600">
                      {["Story", "Synopsis", "Format", "Characters"].map((step) => (
                        <div key={step} className="flex-1 text-center">{step}</div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 mt-4 text-xs text-gray-600">
                    <Clock className="w-3 h-3" />
                    <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
