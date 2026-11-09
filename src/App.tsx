import { useEffect, useMemo, useRef, useState } from "react";
import Header from "./component/Header";
import { LANGUAGES } from "./layout/Languages";
import {
  ArrowLeftRight,
  Check,
  Copy,
  Languages as LanguagesIcon,
  LoaderCircle,
  Mic,
  MicOff,
  RotateCcw,
  Volume2,
  X,
} from "lucide-react";

type SpeechRecognitionResult = {
  0: { transcript: string };
  isFinal: boolean;
};

type SpeechRecognitionEvent = {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResult>;
};

type SpeechRecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

const MAX_CHARACTERS = 5000;

function App() {
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLang, setSourceLang] = useState("auto");
  const [targetLang, setTargetLang] = useState("fr");
  const [isListening, setIsListening] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sourceLanguageName = useMemo(
    () => LANGUAGES.find((language) => language.code === sourceLang)?.name ?? "Auto detect",
    [sourceLang],
  );
  const targetLanguageName = useMemo(
    () => LANGUAGES.find((language) => language.code === targetLang)?.name ?? targetLang,
    [targetLang],
  );

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      window.speechSynthesis?.cancel();
    };
  }, []);

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const toggleListen = () => {
    if (isListening) {
      stopListening();
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Voice input is not supported in this browser. Try the latest Chrome or Edge.");
      return;
    }

    setError("");
    const recognition = new SpeechRecognition();
    recognition.lang =
      sourceLang === "auto"
        ? navigator.language || "en-US"
        : sourceLang;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .slice(event.resultIndex)
        .map((result) => result[0].transcript)
        .join(" ")
        .trim();
      if (transcript) setInputText((current) => (current ? `${current} ${transcript}` : transcript));
    };
    recognition.onerror = (event) => {
      setError(
        event.error === "not-allowed"
          ? "Microphone permission was blocked. Allow microphone access in your browser settings."
          : `Voice input stopped: ${event.error}.`,
      );
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setIsListening(true);
    } catch {
      setIsListening(false);
      setError("The microphone could not start. Please try again.");
    }
  };

  const handleTranslate = async () => {
    const text = inputText.trim();
    if (!text) {
      setError("Enter or speak some text before translating.");
      return;
    }
    if (text.length > MAX_CHARACTERS) {
      setError(`Please keep your text under ${MAX_CHARACTERS.toLocaleString()} characters.`);
      return;
    }
    if (sourceLang === targetLang) {
      setTranslatedText(text);
      setError("");
      return;
    }

    setIsTranslating(true);
    setError("");
    setTranslatedText("");

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, source: sourceLang, target: targetLang }),
      });
      const data: { translatedText?: string; error?: string } = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Translation failed. Please try again.");
      }
      if (!data.translatedText?.trim()) {
        throw new Error("The translation provider returned an empty result. Please try again.");
      }
      setTranslatedText(data.translatedText);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Something went wrong while translating. Please try again.",
      );
    } finally {
      setIsTranslating(false);
    }
  };

  const speak = (text: string, language: string) => {
    if (!text.trim() || !("speechSynthesis" in window)) {
      setError("Text-to-speech is not available in this browser.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === "auto" ? "en-US" : language;
    utterance.onerror = () => setError("Your browser could not play the spoken translation.");
    window.speechSynthesis.speak(utterance);
  };

  const copyToClipboard = async () => {
    if (!translatedText) return;
    try {
      await navigator.clipboard.writeText(translatedText);
      setCopied(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Clipboard access was blocked. Select and copy the translation manually.");
    }
  };

  const swapLanguages = () => {
    if (sourceLang === "auto") {
      setError("Choose a source language before swapping languages.");
      return;
    }
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setInputText(translatedText || inputText);
    setTranslatedText(translatedText ? inputText : "");
    setError("");
  };

  const clearText = () => {
    setInputText("");
    setTranslatedText("");
    setError("");
    setCopied(false);
    window.speechSynthesis?.cancel();
  };

  return (
    <main className="min-h-screen bg-[#080f1d] px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <Header />
        <section
          aria-label="Translation tool"
          className="rounded-3xl border border-slate-700/70 bg-slate-900/90 p-4 shadow-2xl shadow-black/20 sm:p-7"
        >
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
              <LanguagesIcon size={18} className="text-emerald-400" />
              Translate text
            </div>
            <button
              type="button"
              onClick={clearText}
              className="inline-flex items-center gap-2 self-start rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-white sm:self-auto"
            >
              <RotateCcw size={15} /> Clear
            </button>
          </div>

          <div className="mb-5 grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
            <label className="min-w-0">
              <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-400">
                Translate from
              </span>
              <select
                aria-label="Source language"
                value={sourceLang}
                onChange={(event) => setSourceLang(event.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-3 text-sm text-white outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
              >
                <option value="auto">Detect language</option>
                {LANGUAGES.map((language) => (
                  <option key={language.code} value={language.code}>{language.name}</option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={swapLanguages}
              aria-label="Swap languages"
              title="Swap languages"
              className="mt-6 rounded-xl border border-slate-700 bg-slate-800 p-3 text-slate-300 transition hover:border-emerald-500 hover:text-emerald-300"
            >
              <ArrowLeftRight size={18} />
            </button>
            <label className="min-w-0">
              <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-400">
                Translate to
              </span>
              <select
                aria-label="Target language"
                value={targetLang}
                onChange={(event) => setTargetLang(event.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-3 text-sm text-white outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
              >
                {LANGUAGES.map((language) => (
                  <option key={language.code} value={language.code}>{language.name}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="overflow-hidden rounded-2xl border border-slate-700 bg-[#0b1424]">
              <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
                <span className="text-sm font-medium text-slate-300">{sourceLanguageName}</span>
                <span className="text-xs text-slate-500">{inputText.length}/{MAX_CHARACTERS}</span>
              </div>
              <textarea
                aria-label="Text to translate"
                value={inputText}
                maxLength={MAX_CHARACTERS + 100}
                onChange={(event) => {
                  setInputText(event.target.value);
                  setError("");
                }}
                placeholder="Type or speak the text you want to translate..."
                className="min-h-56 w-full resize-y bg-transparent p-4 text-base leading-7 text-white outline-none placeholder:text-slate-600"
              />
              <div className="flex items-center justify-between border-t border-slate-800 p-3">
                <button
                  type="button"
                  onClick={toggleListen}
                  aria-pressed={isListening}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${isListening ? "bg-red-500/15 text-red-300" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}
                >
                  {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                  {isListening ? "Stop recording" : "Voice input"}
                </button>
                <span className="text-xs text-slate-600">Input</span>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-700 bg-[#0b1424]">
              <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
                <span className="text-sm font-medium text-slate-300">{targetLanguageName}</span>
                <span className="text-xs text-slate-500">Translation</span>
              </div>
              <div
                aria-live="polite"
                aria-busy={isTranslating}
                className="min-h-56 whitespace-pre-wrap p-4 text-base leading-7 text-white"
              >
                {isTranslating ? (
                  <span className="inline-flex items-center gap-2 text-slate-400">
                    <LoaderCircle className="animate-spin" size={18} /> Translating...
                  </span>
                ) : translatedText || (
                  <span className="text-slate-600">Your translation will appear here.</span>
                )}
              </div>
              <div className="flex items-center justify-between border-t border-slate-800 p-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => speak(translatedText, targetLang)}
                    disabled={!translatedText}
                    aria-label="Listen to translation"
                    className="rounded-lg bg-slate-800 p-2.5 text-slate-300 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Volume2 size={17} />
                  </button>
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    disabled={!translatedText}
                    aria-label="Copy translation"
                    className="rounded-lg bg-slate-800 p-2.5 text-slate-300 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {copied ? <Check size={17} className="text-emerald-400" /> : <Copy size={17} />}
                  </button>
                </div>
                <span className="text-xs text-slate-600">{copied ? "Copied" : "Output"}</span>
              </div>
            </div>
          </div>

          {error && (
            <div role="alert" className="mt-4 flex items-start justify-between gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              <span>{error}</span>
              <button type="button" onClick={() => setError("")} aria-label="Dismiss error">
                <X size={16} />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleTranslate}
            disabled={isTranslating || !inputText.trim()}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 px-5 py-4 font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isTranslating ? <LoaderCircle className="animate-spin" size={19} /> : <LanguagesIcon size={19} />}
            {isTranslating ? "Translating..." : "Translate text"}
          </button>
          <p className="mt-3 text-center text-xs text-slate-500">
            Translation availability depends on the language pair supported by the configured provider.
          </p>
        </section>

        <footer className="mt-8 text-center text-sm text-slate-500">
          <p>Syntra Translator · Make every language easier to understand.</p>
        </footer>
      </div>
    </main>
  );
}

export default App;
