"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Loader2,
  RefreshCw,
  Tag,
  BookOpen,
  AlertCircle,
} from "lucide-react";

interface Synopsis {
  id: string;
  synopsis: string;
  themes: string[];
  arcBeginning: string;
  arcConflict: string;
  arcTurning: string;
  arcResolution: string;
  outputFormat?: string;
}

interface SuggestedCharacter {
  name: string;
  role: string;
  description: string;
}

export default function SynopsisPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [synopsis, setSynopsis] = useState<Synopsis | null>(null);
  const [suggestedCharacters, setSuggestedCharacters] = useState<SuggestedCharacter[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if synopsis already exists
    fetch(`/api/projects/${projectId}/synopsis`)
      .then((r) => r.json())
      .then((data) => {
        if (data.synopsis) {
          setSynopsis(data.synopsis);
        }
        setIsLoaded(true);
      })
      .catch(() => setIsLoaded(true));
  }, [projectId]);

  const generateSynopsis = async () => {
    setIsGenerating(true);
    setError("");

    const res = await fetch(`/api/projects/${projectId}/synopsis`, {
      method: "POST",
    });

    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Failed to generate synopsis");
      setIsGenerating(false);
      return;
    }

    setSynopsis(json.synopsis);
    setSuggestedCharacters(json.suggestedCharacters || []);
    setIsGenerating(false);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

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

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <Link
          href={`/projects/${projectId}/story`}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to story input
        </Link>

        {/* Progress steps */}
        <div className="flex items-center gap-2 mb-8">
          {["Your Story", "Synopsis", "Format", "Characters"].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                i === 1 ? "bg-purple-600 text-white" : i < 1 ? "bg-green-600 text-white" : "bg-white/10 text-gray-500"
              }`}>
                {i < 1 ? "✓" : i + 1}
              </div>
              <span className={`text-sm ${i === 1 ? "text-white" : i < 1 ? "text-green-400" : "text-gray-500"}`}>{step}</span>
              {i < 3 && <ArrowRight className="w-4 h-4 text-gray-600" />}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">AI Synopsis</h1>
            <p className="text-gray-400 mt-1">Let AI analyze your story and create a synopsis</p>
          </div>
          {synopsis && (
            <button
              onClick={generateSynopsis}
              disabled={isGenerating}
              className="flex items-center gap-2 text-gray-400 hover:text-white border border-white/20 hover:border-white/40 px-3 py-2 rounded-lg text-sm transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`} />
              Regenerate
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-4 flex gap-3 mb-6">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div>
              <p className="text-red-300 text-sm">{error}</p>
              {error.includes("story") && (
                <Link
                  href={`/projects/${projectId}/story`}
                  className="text-purple-400 hover:text-purple-300 text-sm mt-1 block"
                >
                  Go back to add your story →
                </Link>
              )}
            </div>
          </div>
        )}

        {!synopsis && !isGenerating && (
          <div className="text-center py-16 bg-white/5 border border-white/10 rounded-2xl">
            <div className="w-16 h-16 bg-purple-900/40 border border-purple-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-purple-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Ready to Analyze Your Story</h2>
            <p className="text-gray-400 mb-8 max-w-sm mx-auto">
              Our AI will analyze your story and generate a synopsis with themes and story arc.
            </p>
            <button
              onClick={generateSynopsis}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl font-semibold inline-flex items-center gap-2 transition-all"
            >
              <Sparkles className="w-5 h-5" />
              Generate Synopsis with AI
            </button>
          </div>
        )}

        {isGenerating && (
          <div className="text-center py-16 bg-white/5 border border-white/10 rounded-2xl">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="w-16 h-16 border-4 border-purple-500/30 rounded-full" />
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Analyzing Your Story...</h2>
            <p className="text-gray-400">AI is processing your narrative and extracting key elements</p>
          </div>
        )}

        {synopsis && !isGenerating && (
          <div className="space-y-6">
            {/* Synopsis */}
            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/20 border border-purple-500/30 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-semibold text-white">Synopsis</h2>
              </div>
              <p className="text-gray-200 leading-relaxed text-lg">{synopsis.synopsis}</p>
            </div>

            {/* Themes */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-semibold text-white">Main Themes</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {synopsis.themes.map((theme) => (
                  <span
                    key={theme}
                    className="bg-purple-900/40 border border-purple-500/30 text-purple-300 px-3 py-1.5 rounded-full text-sm capitalize font-medium"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </div>

            {/* Story Arc */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Story Arc</h2>
              <div className="space-y-4">
                {[
                  { label: "Beginning", value: synopsis.arcBeginning, color: "bg-blue-500/20 border-blue-500/30 text-blue-300" },
                  { label: "Conflict", value: synopsis.arcConflict, color: "bg-orange-500/20 border-orange-500/30 text-orange-300" },
                  { label: "Turning Point", value: synopsis.arcTurning, color: "bg-yellow-500/20 border-yellow-500/30 text-yellow-300" },
                  { label: "Resolution", value: synopsis.arcResolution, color: "bg-green-500/20 border-green-500/30 text-green-300" },
                ].map((arc) => (
                  <div key={arc.label} className={`border rounded-xl p-4 ${arc.color}`}>
                    <p className="font-semibold text-sm mb-1 opacity-80">{arc.label}</p>
                    <p className="text-sm leading-relaxed">{arc.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggested Characters */}
            {suggestedCharacters.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-1">AI-Detected Characters</h2>
                <p className="text-gray-400 text-sm mb-4">
                  These characters were automatically detected from your story and added to your project.
                </p>
                <div className="grid gap-3">
                  {suggestedCharacters.map((char) => (
                    <div key={char.name} className="bg-white/5 rounded-lg p-3 flex items-start gap-3">
                      <div className="w-8 h-8 bg-purple-900/40 border border-purple-500/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-purple-400 text-xs font-bold">{char.name[0]}</span>
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{char.name}</p>
                        <p className="text-purple-400 text-xs capitalize">{char.role}</p>
                        <p className="text-gray-400 text-xs mt-0.5">{char.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Continue button */}
            <button
              onClick={() => router.push(`/projects/${projectId}/format`)}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2"
            >
              Choose Output Format
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
