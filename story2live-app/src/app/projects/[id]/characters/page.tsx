"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Sparkles, ArrowLeft, ArrowRight, Loader2, Users } from "lucide-react";
import { CharacterManagementPanel } from "@/components/character-management-panel";

interface Character {
  id: string;
  name: string;
  role: string;
  personalityDescription: string;
  age?: string | null;
  photoUrl?: string | null;
  voiceType?: string | null;
  isAiSuggested: boolean;
}

export default function CharactersPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/projects/${projectId}/characters`)
      .then((r) => r.json())
      .then((data) => {
        setCharacters(data.characters || []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [projectId]);

  if (isLoading) {
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

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <Link
          href={`/projects/${projectId}/format`}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to format selection
        </Link>

        {/* Progress steps */}
        <div className="flex items-center gap-2 mb-8">
          {["Your Story", "Synopsis", "Format", "Characters"].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                i === 3 ? "bg-purple-600 text-white" : i < 3 ? "bg-green-600 text-white" : "bg-white/10 text-gray-500"
              }`}>
                {i < 3 ? "✓" : i + 1}
              </div>
              <span className={`text-sm ${i === 3 ? "text-white" : i < 3 ? "text-green-400" : "text-gray-500"}`}>{step}</span>
              {i < 3 && <ArrowRight className="w-4 h-4 text-gray-600" />}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-900/40 border border-purple-500/30 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Characters</h1>
            <p className="text-gray-400 text-sm">Add and manage story characters</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <CharacterManagementPanel projectId={projectId} initialCharacters={characters} />
        </div>

        <button
          onClick={() => router.push(`/projects/${projectId}`)}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2"
        >
          View Full Project
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
