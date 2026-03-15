"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Sparkles, ArrowLeft, FileText, Upload, Mic, Loader2, ArrowRight } from "lucide-react";

type InputMethod = "text" | "document" | "audio";

export default function StoryInputPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [method, setMethod] = useState<InputMethod>("text");
  const [storyText, setStoryText] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioText, setAudioText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setFileContent(text);
    };
    reader.readAsText(file);
  };

  const toggleRecording = () => {
    if (!isRecording) {
      if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
        setError("Speech recognition is not supported in your browser. Please use Chrome.");
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = (event: { results: SpeechRecognitionResultList }) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setAudioText(transcript);
      };
      recognition.start();
      // Store recognition instance on window for cleanup
      (window as unknown as Record<string, unknown>).__recognition = recognition;
      setIsRecording(true);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const recognition = (window as any).__recognition;
      if (recognition) recognition.stop();
      setIsRecording(false);
    }
  };

  const getContentToSubmit = () => {
    if (method === "text") return storyText;
    if (method === "document") return fileContent;
    if (method === "audio") return audioText;
    return "";
  };

  const handleSubmit = async () => {
    const content = getContentToSubmit();
    if (!content.trim()) {
      setError("Please provide your story content before continuing.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    const res = await fetch(`/api/projects/${projectId}/story`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: method,
        content,
        fileName: method === "document" ? fileName : undefined,
      }),
    });

    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Failed to save story");
      setIsSubmitting(false);
      return;
    }

    router.push(`/projects/${projectId}/synopsis`);
  };

  const wordCount = getContentToSubmit().trim().split(/\s+/).filter(Boolean).length;

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
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </Link>

        {/* Progress steps */}
        <div className="flex items-center gap-2 mb-8">
          {["Your Story", "Synopsis", "Format", "Characters"].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                i === 0 ? "bg-purple-600 text-white" : "bg-white/10 text-gray-500"
              }`}>
                {i + 1}
              </div>
              <span className={`text-sm ${i === 0 ? "text-white" : "text-gray-500"}`}>{step}</span>
              {i < 3 && <ArrowRight className="w-4 h-4 text-gray-600" />}
            </div>
          ))}
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">Tell Your Story</h1>
        <p className="text-gray-400 mb-8">
          Share your life story. Our AI will analyze it and generate a synopsis for you.
        </p>

        {error && (
          <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-3 text-red-300 text-sm mb-6">
            {error}
          </div>
        )}

        {/* Input Method Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { value: "text" as InputMethod, label: "Write", icon: FileText },
            { value: "document" as InputMethod, label: "Upload Document", icon: Upload },
            { value: "audio" as InputMethod, label: "Record Audio", icon: Mic },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setMethod(tab.value)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                method === tab.value
                  ? "bg-purple-600 text-white"
                  : "bg-white/10 text-gray-400 hover:text-white hover:bg-white/20"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Text Input */}
        {method === "text" && (
          <div>
            <textarea
              value={storyText}
              onChange={(e) => setStoryText(e.target.value)}
              placeholder="Start writing your life story here... Share your experiences, memories, challenges, and triumphs. The more detail you provide, the better the AI can analyze and structure your story.

Example: 'I was born on a small farm in the countryside. My father was a hardworking man who taught me the value of perseverance. When I was twelve, tragedy struck when...'"
              rows={16}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors resize-none text-base leading-relaxed"
            />
            {storyText && (
              <p className="text-gray-500 text-sm mt-2">{wordCount} words</p>
            )}
          </div>
        )}

        {/* Document Upload */}
        {method === "document" && (
          <div>
            <label className="border-2 border-dashed border-white/20 rounded-xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-purple-500/50 hover:bg-white/5 transition-all">
              <Upload className="w-12 h-12 text-gray-500" />
              <div className="text-center">
                <p className="text-white font-medium">Click to upload your document</p>
                <p className="text-gray-400 text-sm mt-1">Supports .txt and .md files</p>
              </div>
              <input
                type="file"
                accept=".txt,.md,.text"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            {fileName && (
              <div className="mt-4 bg-white/10 border border-white/20 rounded-lg p-4">
                <p className="text-white font-medium">📄 {fileName}</p>
                <p className="text-gray-400 text-sm mt-1">{wordCount} words loaded</p>
                {fileContent && (
                  <div className="mt-3 text-gray-300 text-sm line-clamp-3">{fileContent.substring(0, 200)}...</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Audio Recording */}
        {method === "audio" && (
          <div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
              <button
                onClick={toggleRecording}
                className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 transition-all ${
                  isRecording
                    ? "bg-red-600 hover:bg-red-700 animate-pulse"
                    : "bg-purple-600 hover:bg-purple-700"
                }`}
              >
                <Mic className={`w-8 h-8 text-white ${isRecording ? "animate-pulse" : ""}`} />
              </button>
              <p className="text-white font-medium">
                {isRecording ? "Recording... Click to stop" : "Click to start recording"}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Speak your story naturally. Works best in Chrome.
              </p>
            </div>
            {audioText && (
              <div className="mt-4 bg-white/10 border border-white/20 rounded-xl p-4">
                <p className="text-gray-400 text-xs font-medium mb-2">TRANSCRIPT ({wordCount} words)</p>
                <p className="text-white text-sm leading-relaxed">{audioText}</p>
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !getContentToSubmit().trim()}
          className="w-full mt-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-40 text-white py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving story...
            </>
          ) : (
            <>
              Continue to AI Synopsis
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
