"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  PlusCircle,
  Pencil,
  Trash2,
  X,
  Check,
  Loader2,
  Sparkles,
  User,
} from "lucide-react";

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

interface Props {
  projectId: string;
  initialCharacters: Character[];
}

const characterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.string().min(1, "Role is required"),
  personalityDescription: z.string().min(1, "Description is required"),
  age: z.string().optional(),
  voiceType: z.enum(["ai", "uploaded", "narrator"]).optional(),
});

type CharacterForm = z.infer<typeof characterSchema>;

const roles = [
  "protagonist",
  "parent",
  "mentor",
  "friend",
  "narrator",
  "antagonist",
  "sibling",
  "spouse",
  "colleague",
  "other",
];

export function CharacterManagementPanel({ projectId, initialCharacters }: Props) {
  const router = useRouter();
  const [characters, setCharacters] = useState<Character[]>(initialCharacters);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CharacterForm>({ resolver: zodResolver(characterSchema) });

  const openAddForm = () => {
    setEditingId(null);
    reset();
    setShowForm(true);
    setError("");
  };

  const openEditForm = (char: Character) => {
    setEditingId(char.id);
    setValue("name", char.name);
    setValue("role", char.role);
    setValue("personalityDescription", char.personalityDescription);
    setValue("age", char.age || "");
    setValue("voiceType", (char.voiceType as "ai" | "uploaded" | "narrator") || undefined);
    setShowForm(true);
    setError("");
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    reset();
    setError("");
  };

  const onSubmit = async (data: CharacterForm) => {
    setError("");
    if (editingId) {
      const res = await fetch(`/api/projects/${projectId}/characters/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to update character");
        return;
      }
      setCharacters((prev) =>
        prev.map((c) => (c.id === editingId ? { ...c, ...json.character } : c))
      );
    } else {
      const res = await fetch(`/api/projects/${projectId}/characters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to add character");
        return;
      }
      setCharacters((prev) => [...prev, json.character]);
    }
    closeForm();
    router.refresh();
  };

  const deleteCharacter = async (charId: string) => {
    setDeletingId(charId);
    const res = await fetch(`/api/projects/${projectId}/characters/${charId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setCharacters((prev) => prev.filter((c) => c.id !== charId));
    }
    setDeletingId(null);
    router.refresh();
  };

  return (
    <div>
      {/* Character list */}
      {characters.length === 0 && !showForm && (
        <div className="text-center py-6">
          <User className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm mb-1">No characters yet</p>
          <p className="text-gray-500 text-xs">Generate a synopsis to auto-detect characters</p>
        </div>
      )}

      <div className="space-y-2 mb-4">
        {characters.map((char) => (
          <div
            key={char.id}
            className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-start gap-3"
          >
            <div className="w-9 h-9 bg-purple-900/40 border border-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-purple-400 text-sm font-bold">
                {char.name[0]?.toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-white font-medium text-sm truncate">{char.name}</p>
                {char.isAiSuggested && (
                  <Sparkles className="w-3 h-3 text-purple-400 flex-shrink-0" aria-label="AI suggested" />
                )}
              </div>
              <p className="text-purple-400 text-xs capitalize">{char.role}</p>
              <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">{char.personalityDescription}</p>
              {char.age && <p className="text-gray-600 text-xs">Age: {char.age}</p>}
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button
                onClick={() => openEditForm(char)}
                className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded transition-colors"
                title="Edit character"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => deleteCharacter(char.id)}
                disabled={deletingId === char.id}
                className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors"
                title="Delete character"
              >
                {deletingId === char.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Character Form */}
      {showForm && (
        <div className="bg-white/5 border border-purple-500/30 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-medium text-sm">
              {editingId ? "Edit Character" : "Add Character"}
            </h3>
            <button onClick={closeForm} className="text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {error && (
            <p className="text-red-400 text-xs mb-3">{error}</p>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div>
              <input
                {...register("name")}
                placeholder="Character name *"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm transition-colors"
              />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <select
                {...register("role")}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 text-sm transition-colors"
              >
                <option value="" className="bg-gray-900">Select role *</option>
                {roles.map((r) => (
                  <option key={r} value={r} className="bg-gray-900 capitalize">{r}</option>
                ))}
              </select>
              {errors.role && <p className="text-red-400 text-xs mt-1">{errors.role.message}</p>}
            </div>

            <div>
              <textarea
                {...register("personalityDescription")}
                placeholder="Personality description *"
                rows={2}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm resize-none transition-colors"
              />
              {errors.personalityDescription && (
                <p className="text-red-400 text-xs mt-1">{errors.personalityDescription.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                {...register("age")}
                placeholder="Age (optional)"
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm transition-colors"
              />
              <select
                {...register("voiceType")}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 text-sm transition-colors"
              >
                <option value="" className="bg-gray-900">Voice type</option>
                <option value="ai" className="bg-gray-900">AI Generated</option>
                <option value="uploaded" className="bg-gray-900">Uploaded</option>
                <option value="narrator" className="bg-gray-900">Narrator</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                {editingId ? "Save Changes" : "Add Character"}
              </button>
              <button
                type="button"
                onClick={closeForm}
                className="px-4 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {!showForm && (
        <button
          onClick={openAddForm}
          className="w-full border border-dashed border-white/20 hover:border-purple-500/50 hover:bg-purple-900/10 text-gray-400 hover:text-white py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          Add New Character
        </button>
      )}

      {characters.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <p className="text-xs text-gray-500 text-center">
            {characters.length} character{characters.length === 1 ? "" : "s"} • Unlimited supported
          </p>
        </div>
      )}
    </div>
  );
}
