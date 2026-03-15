"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Film,
  Video,
  Loader2,
  CheckCircle,
} from "lucide-react";

type OutputFormat = "book" | "movie" | "documentary";

const formats = [
  {
    value: "book" as OutputFormat,
    label: "Book",
    icon: BookOpen,
    gradient: "from-blue-500 to-cyan-500",
    bg: "bg-blue-900/20",
    border: "border-blue-500/40",
    description: "Generate chapters and narrative prose",
    features: [
      "Structured chapter outline",
      "Narrative prose style",
      "Character development arcs",
      "Scene descriptions",
      "Export as PDF / ePub",
    ],
  },
  {
    value: "movie" as OutputFormat,
    label: "Movie",
    icon: Film,
    gradient: "from-purple-500 to-pink-500",
    bg: "bg-purple-900/20",
    border: "border-purple-500/40",
    description: "Generate screenplay scenes and dialogue",
    features: [
      "3-act structure",
      "Scene headings & directions",
      "Character dialogue",
      "Professional screenplay format",
      "Export as PDF screenplay",
    ],
  },
  {
    value: "documentary" as OutputFormat,
    label: "Documentary",
    icon: Video,
    gradient: "from-orange-500 to-red-500",
    bg: "bg-orange-900/20",
    border: "border-orange-500/40",
    description: "Generate narration script and interview-style storytelling",
    features: [
      "Narration segments",
      "Interview-style questions",
      "Visual suggestions",
      "Documentary narrator voice",
      "Export script",
    ],
  },
];

export default function FormatSelectionPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [selected, setSelected] = useState<OutputFormat | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const handleSelectFormat = async () => {
    if (!selected) return;
    setIsGenerating(true);
    setError("");

    const res = await fetch(`/api/projects/${projectId}/format`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ outputFormat: selected }),
    });

    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Failed to generate content");
      setIsGenerating(false);
      return;
    }

    router.push(`/projects/${projectId}`);
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <Link
          href={`/projects/${projectId}/synopsis`}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to synopsis
        </Link>

        {/* Progress steps */}
        <div className="flex items-center gap-2 mb-8">
          {["Your Story", "Synopsis", "Format", "Characters"].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                i === 2 ? "bg-purple-600 text-white" : i < 2 ? "bg-green-600 text-white" : "bg-white/10 text-gray-500"
              }`}>
                {i < 2 ? "✓" : i + 1}
              </div>
              <span className={`text-sm ${i === 2 ? "text-white" : i < 2 ? "text-green-400" : "text-gray-500"}`}>{step}</span>
              {i < 3 && <ArrowRight className="w-4 h-4 text-gray-600" />}
            </div>
          ))}
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">Choose Your Format</h1>
        <p className="text-gray-400 mb-8">
          How would you like your story to be told? Select the format that best fits your vision.
        </p>

        {error && (
          <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-3 text-red-300 text-sm mb-6">
            {error}
          </div>
        )}

        {isGenerating ? (
          <div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="w-16 h-16 border-4 border-purple-500/30 rounded-full" />
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Generating Your {selected?.charAt(0).toUpperCase()}{selected?.slice(1)} Content...
            </h2>
            <p className="text-gray-400">
              AI is structuring your story for the {selected} format
            </p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {formats.map((format) => (
                <button
                  key={format.value}
                  onClick={() => setSelected(format.value)}
                  className={`text-left border-2 rounded-2xl p-6 transition-all relative ${
                    selected === format.value
                      ? `${format.bg} ${format.border} border-opacity-100 ring-2 ring-purple-500/30`
                      : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                  }`}
                >
                  {selected === format.value && (
                    <CheckCircle className="absolute top-4 right-4 w-5 h-5 text-purple-400" />
                  )}
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${format.gradient} flex items-center justify-center mb-4`}
                  >
                    <format.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{format.label}</h3>
                  <p className="text-gray-400 text-sm mb-4">{format.description}</p>
                  <ul className="space-y-1.5">
                    {format.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-gray-300 text-xs">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>

            <button
              onClick={handleSelectFormat}
              disabled={!selected}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-40 text-white py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2"
            >
              {selected ? (
                <>
                  Generate {selected.charAt(0).toUpperCase() + selected.slice(1)} Content
                  <ArrowRight className="w-5 h-5" />
                </>
              ) : (
                "Select a format to continue"
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
