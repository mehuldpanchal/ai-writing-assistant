import React, { useState, useEffect } from "react";
import { FaMagic } from "react-icons/fa";
import { motion } from "framer-motion";
import BottomNav from "../components/ui/BottomNav";

const FORMAT_OPTIONS = ["Standard", "Email", "Social Media", "Comment"];
const TONE_OPTIONS = ["Professional", "Casual", "Polite"];
const humorousPhrases = [
  'Consulting the Oxford Oracle…',
  'Refining your linguistic brilliance…',
  'Tickling the thesaurus…',
  'Whipping out the red pen…',
  'Beautifying your babble…'
];

export default function SmartComposer() {
  const [input, setInput] = useState("");
  const [format, setFormat] = useState(FORMAT_OPTIONS[0]);
  const [tone, setTone] = useState(TONE_OPTIONS[0]);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const [loadingPhraseIndex, setLoadingPhraseIndex] = useState(0);

  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setLoadingPhraseIndex((i) => (i + 1) % humorousPhrases.length);
      }, 1200);
    } else {
      setLoadingPhraseIndex(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleGenerate = async () => {
    if (!input.trim()) {
      setError("Please enter some text to generate.");
      setResponse("");
      return;
    }
    setLoading(true);
    setResponse("");
    setError("");
    try {
      const userId = localStorage.getItem('userId') || 'user-' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('userId', userId);
      
      const res = await fetch("/api/smart-composer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-ID": userId
        },
        body: JSON.stringify({ input, format, tone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate response");
      setResponse(data.result || "No response received.");
      // Refresh BottomNav credits after 1s delay to ensure API updates
      if (typeof BottomNav?.fetchCredits === 'function') {
        setTimeout(() => BottomNav.fetchCredits(), 1000);
      }
    } catch (err) {
      setError(
        err?.message === "Failed to generate response"
          ? "Failed to generate. Please try again."
          : err?.message || "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#0a0e17] relative text-white p-4 sm:p-6 flex flex-col items-center overflow-hidden">
      <div className="glow-behind"></div>
      
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8 select-none flex items-center justify-center gap-2 text-center w-full"
      >
        <FaMagic className="text-blue-400 text-2xl" />
        <span className="text-white">Smart Composer</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="glassmorphism w-full max-w-lg sm:max-w-2xl md:max-w-4xl p-3 sm:p-6 md:p-8 flex flex-col"
      >
        {/* Textarea */}
        <div className="relative">
          <textarea
            className="w-full h-36 sm:h-40 bg-transparent text-white text-lg rounded-2xl border border-white/10 p-4 outline-none resize-none placeholder-gray-400 focus:ring-2 focus:ring-blue-500 transition"
            maxLength={125}
            placeholder="Start by writing your main idea, or ask me to help you write something..."
            value={input}
            onChange={e => setInput(e.target.value)}
            aria-label="Main idea input"
          />
          <span className="absolute bottom-3 right-4 text-gray-400 text-xs select-none">
            {input.length}/125
          </span>
        </div>

        {/* Dropdowns */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Dropdown
            label="Format"
            options={FORMAT_OPTIONS}
            value={format}
            onChange={setFormat}
          />
          <Dropdown
            label="Tone"
            options={TONE_OPTIONS}
            value={tone}
            onChange={setTone}
          />
        </div>

        {/* Generate Button */}
        <button
          className="w-full mt-2 py-3 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white text-lg font-semibold shadow-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={handleGenerate}
          disabled={loading}
          aria-label="Generate"
        >
          {loading ? (
            <span>
              <span className="animate-pulse">{humorousPhrases[loadingPhraseIndex]}</span>
            </span>
          ) : (
            "Generate"
          )}
        </button>

        {/* Response */}
        {!loading && response && (
          <div className="relative mt-4 p-4 bg-[#181c23] rounded-xl text-white shadow-inner transition">
            <button
              onClick={() => navigator.clipboard.writeText(response)}
              className="absolute top-2 right-2 p-1 text-gray-400 hover:text-white transition"
              aria-label="Copy to clipboard"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </button>
            {response}
          </div>
        )}
        {!loading && error && (
          <div className="mt-4 p-4 bg-red-900 rounded-xl text-red-200 shadow-inner transition">
            {error}
          </div>
        )}
      </motion.div>
    </div>
  );
}

function Dropdown({ label, options, value, onChange }) {
  return (
    <div className="flex-1">
      <label className="block mb-1 text-white font-medium">{label}</label>
      <div className="relative">
        <select
          className="w-full appearance-none bg-[#181c23] text-white py-3 px-4 rounded-2xl border border-white/10 shadow focus:ring-2 focus:ring-blue-500 transition"
          value={value}
          onChange={e => onChange(e.target.value)}
          aria-label={label}
        >
          {options.map(opt => (
            <option key={opt} value={opt} className="text-white">
              {opt}
            </option>
          ))}
        </select>
        <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
          ▼
        </span>
      </div>
    </div>
  );
}