"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sparkles, ArrowLeft, BookOpen, Film, Video, Loader2 } from "lucide-react";

const projectSchema = z.object({
  title: z.string().min(1, "Project title is required"),
  genre: z.string().min(1, "Genre is required"),
  storyType: z.enum(["book", "movie", "documentary"]),
  language: z.string().min(1, "Language is required"),
  targetLength: z.string().min(1, "Target length is required"),
});

type ProjectForm = z.infer<typeof projectSchema>;

const genres = [
  "Autobiography",
  "Memoir",
  "Biography",
  "Drama",
  "Adventure",
  "Romance",
  "Thriller",
  "Inspirational",
  "Historical",
  "Coming-of-age",
];

const languages = [
  "English", "French", "Spanish", "Portuguese", "German",
  "Italian", "Arabic", "Chinese", "Japanese", "Other",
];

const targetLengths = {
  book: ["Short story (< 10,000 words)", "Novella (10,000–40,000 words)", "Novel (40,000–100,000 words)", "Long novel (100,000+ words)"],
  movie: ["Short film (< 30 min)", "Feature film (90–120 min)", "Epic (120+ min)"],
  documentary: ["Short documentary (< 30 min)", "Feature documentary (45–90 min)", "Series (multiple episodes)"],
};

const storyTypes = [
  { value: "book", label: "Book", icon: BookOpen, desc: "Chapters and narrative prose", color: "border-blue-500/50 bg-blue-900/20" },
  { value: "movie", label: "Movie", icon: Film, desc: "Screenplay with scenes and dialogue", color: "border-purple-500/50 bg-purple-900/20" },
  { value: "documentary", label: "Documentary", icon: Video, desc: "Narration script and interview style", color: "border-orange-500/50 bg-orange-900/20" },
];

export default function NewProjectPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProjectForm>({ resolver: zodResolver(projectSchema) });

  const selectedType = watch("storyType");

  const onSubmit = async (data: ProjectForm) => {
    setError("");
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Failed to create project");
      return;
    }

    router.push(`/projects/${json.project.id}/story`);
  };

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

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </Link>

        <h1 className="text-3xl font-bold text-white mb-2">Create New Project</h1>
        <p className="text-gray-400 mb-8">Set up your story project details</p>

        {error && (
          <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-3 text-red-300 text-sm mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Story Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Story Type <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-3 gap-4">
              {storyTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => {
                    setValue("storyType", type.value as "book" | "movie" | "documentary");
                    setValue("targetLength", "");
                  }}
                  className={`border-2 rounded-xl p-4 text-left transition-all ${
                    selectedType === type.value
                      ? `${type.color} border-opacity-100`
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  <type.icon
                    className={`w-6 h-6 mb-2 ${
                      selectedType === type.value ? "text-white" : "text-gray-400"
                    }`}
                  />
                  <div className={`font-semibold text-sm ${selectedType === type.value ? "text-white" : "text-gray-300"}`}>
                    {type.label}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{type.desc}</div>
                </button>
              ))}
            </div>
            {errors.storyType && (
              <p className="text-red-400 text-sm mt-1">{errors.storyType.message}</p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Project Title <span className="text-red-400">*</span>
            </label>
            <input
              {...register("title")}
              placeholder="e.g., My Journey from Farm to City"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
            {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>}
          </div>

          {/* Genre */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Genre <span className="text-red-400">*</span>
            </label>
            <select
              {...register("genre")}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
            >
              <option value="" className="bg-gray-900">Select a genre</option>
              {genres.map((g) => (
                <option key={g} value={g} className="bg-gray-900">{g}</option>
              ))}
            </select>
            {errors.genre && <p className="text-red-400 text-sm mt-1">{errors.genre.message}</p>}
          </div>

          {/* Language & Target Length */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Language <span className="text-red-400">*</span>
              </label>
              <select
                {...register("language")}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
              >
                <option value="" className="bg-gray-900">Select language</option>
                {languages.map((l) => (
                  <option key={l} value={l} className="bg-gray-900">{l}</option>
                ))}
              </select>
              {errors.language && <p className="text-red-400 text-sm mt-1">{errors.language.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Target Length <span className="text-red-400">*</span>
              </label>
              <select
                {...register("targetLength")}
                disabled={!selectedType}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-40"
              >
                <option value="" className="bg-gray-900">Select length</option>
                {selectedType &&
                  targetLengths[selectedType].map((l) => (
                    <option key={l} value={l} className="bg-gray-900">{l}</option>
                  ))}
              </select>
              {errors.targetLength && <p className="text-red-400 text-sm mt-1">{errors.targetLength.message}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 mt-4"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating project...
              </>
            ) : (
              "Create Project & Add Story"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
