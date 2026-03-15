import Link from "next/link";
import { BookOpen, Film, Video, Sparkles, ArrowRight, Users, FileText, Mic } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950">
      {/* Navbar */}
      <nav className="border-b border-white/10 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-purple-400" />
            <span className="text-xl font-bold text-white">Story2Live</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-gray-300 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link
              href="/signup"
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-purple-900/40 border border-purple-500/30 rounded-full px-4 py-2 mb-8">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-purple-300 text-sm font-medium">AI-Powered Story Creation</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
          Turn Your Life Story<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            Into a Masterpiece
          </span>
        </h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10">
          Story2Live uses AI to transform your personal experiences into books, movies, or documentaries.
          Share your story — we&apos;ll handle the rest.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/signup"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2"
          >
            Start Your Story <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/login"
            className="border border-white/20 hover:border-white/40 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center text-white mb-4">How It Works</h2>
        <p className="text-center text-gray-400 mb-16 max-w-2xl mx-auto">
          Three simple steps to transform your life story into a professional creative work.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              title: "Tell Your Story",
              desc: "Type, upload a document, or record your life story. Any format works.",
              icon: FileText,
            },
            {
              step: "02",
              title: "AI Generates Synopsis",
              desc: "Our AI analyzes your story, identifies themes, and creates a compelling synopsis.",
              icon: Sparkles,
            },
            {
              step: "03",
              title: "Choose Your Format",
              desc: "Decide if your story becomes a book, movie screenplay, or documentary.",
              icon: Film,
            },
          ].map((item) => (
            <div
              key={item.step}
              className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors"
            >
              <div className="text-purple-400 font-bold text-sm mb-4">{item.step}</div>
              <item.icon className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Output formats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center text-white mb-4">Create Any Format</h2>
        <p className="text-center text-gray-400 mb-16 max-w-2xl mx-auto">
          Your story, your choice. Generate the format that best tells your unique journey.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: BookOpen,
              title: "Book",
              color: "from-blue-500 to-cyan-500",
              bg: "bg-blue-900/20 border-blue-500/30",
              features: ["Chapter outline", "Narrative prose", "Character arcs", "PDF export"],
            },
            {
              icon: Film,
              title: "Movie",
              color: "from-purple-500 to-pink-500",
              bg: "bg-purple-900/20 border-purple-500/30",
              features: ["Full screenplay", "Scene dialogue", "Stage directions", "3-act structure"],
            },
            {
              icon: Video,
              title: "Documentary",
              color: "from-orange-500 to-red-500",
              bg: "bg-orange-900/20 border-orange-500/30",
              features: ["Narration script", "Interview style", "Visual suggestions", "Segment breakdown"],
            },
          ].map((format) => (
            <div
              key={format.title}
              className={`border rounded-2xl p-8 ${format.bg} hover:scale-105 transition-transform`}
            >
              <div
                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${format.color} flex items-center justify-center mb-6`}
              >
                <format.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{format.title}</h3>
              <ul className="space-y-2">
                {format.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-gray-300">
                    <ArrowRight className="w-4 h-4 text-gray-500" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Input methods */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center text-white mb-16">Multiple Ways to Share Your Story</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: FileText, title: "Type It", desc: "Write your story directly in our editor with rich text support." },
            { icon: BookOpen, title: "Upload Document", desc: "Upload Word documents, PDFs, or text files." },
            { icon: Mic, title: "Record Audio", desc: "Speak your story aloud and let AI transcribe and analyze it." },
          ].map((method) => (
            <div key={method.title} className="text-center p-6">
              <div className="w-16 h-16 bg-purple-900/40 border border-purple-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <method.icon className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{method.title}</h3>
              <p className="text-gray-400 text-sm">{method.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Characters section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/20 rounded-3xl p-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-4">
                Dynamic Character System
              </h2>
              <p className="text-gray-400 mb-6">
                Add unlimited characters to your story. Upload photos, assign roles, and let AI suggest
                characters based on your narrative. From small personal stories to epic multi-character adventures.
              </p>
              <ul className="space-y-3">
                {[
                  "AI-detected character suggestions",
                  "Unlimited characters per project",
                  "Photo upload for each character",
                  "Voice assignment options",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-gray-300">
                    <div className="w-5 h-5 bg-purple-500/20 border border-purple-500/40 rounded-full flex items-center justify-center">
                      <ArrowRight className="w-3 h-3 text-purple-400" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-shrink-0">
              <Users className="w-32 h-32 text-purple-400/40" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-4xl font-bold text-white mb-4">
          Your Story Deserves to Be Told
        </h2>
        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
          Join Story2Live today and transform your experiences into cinematic storytelling.
        </p>
        <Link
          href="/signup"
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-10 py-4 rounded-xl font-semibold text-xl transition-all transform hover:scale-105 inline-flex items-center gap-3"
        >
          <Sparkles className="w-6 h-6" />
          Create Your Story
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-gray-500 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-white font-medium">Story2Live</span>
        </div>
        <p>© 2026 Story2Live. Transform your life into art.</p>
      </footer>
    </div>
  );
}
