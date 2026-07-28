import React, {useState, useEffect, useRef} from "react";
// import {
//   Mic,
//   MicOff,
//   Volume2,
//   Languages,
//   ArrowRightLeft,
//   Copy,
//   Check
// } from "lucide-react";
const LANGUAGES = [
  {code: "en-US", name: "English (US)"},
  {code: "es-ES", name: "Spanish (Spain)"},
  {code: "fr-FR", name: "French (France)"},
  {code: "de-DE", name: "German (Germany)"},
  {code: "it-IT", name: "Italian (Italy)"},
  {code: "pt-PT", name: "Portuguese (Portugal)"},
  {code: "ru-RU", name: "Russian (Russia)"},
  {code: "zh-CN", name: "Chinese (Simplified)"},
  {code: "ja-JP", name: "Japanese (Japan)"},
  {code: "hi", name: "Hindi"},
  {code: "yo", name: "Yoruba"},
  {code: "ig", name: "Igbo"},
  {code: "ha", name: "Hausa"}
];
function App() {
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLang, setSourceLang] = useState("en-US");
  const [targetLang, setTargetLang] = useState("es-ES");
  const [isListening, setIsListening] = useState(false);
  const [copied, setCopied] = useState(false);

  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current =new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = sourceLang;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, [sourceLang]);

  const toggleListen = ():void => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setIsListening(true);
      recognitionRef.current?.start();
    }
  };

  // Simulated Translation Function (Replace with an API call in production)
  const handleTranslate = () => {
    if (!inputText) return;
    // In a real app, integrate a service like Google Translate or DeepL API here.
    // For this demonstration, we simulate a translation by reversing or modifying the text.
    setTranslatedText(
      `[Translated to ${targetLang.split("-")[0]}]: ${inputText.split("").reverse().join("")}`
    );
  };

  const speak = (text:string, lang:string):void => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    window.speechSynthesis.speak(utterance);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
   const timed= setTimeout(() => setCopied(false),2000);
   clearTimeout(timed) 
  };

  return (
    <>
      <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 font-sans">
        <div className="max-w-4xl mx-auto">
          <header className="mb-8 text-center">
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-emerald-400 mb-2">
              Syntra Translator
            </h1>
            <p className="">
              Real-time voice and text translation
            </p>
            <span className="text-slate-400">
              effortlessly control voice and text translation with syntra
            </span>
          </header>

          <div className="bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-700">
            {/* Controls */}
            <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
              <select
                title="select translate to language"
                name="language"
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                className="bg-slate-700 text-white rounded-lg px-4 py-2 w-full md:w-auto outline-none focus:ring-2 focus:ring-blue-500"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.name}
                  </option>
                ))}
              </select>

              {/* <ArrowRightLeft className="text-slate-500 rotate-90 md:rotate-0" /> */}

              <select
                title="select language"
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="bg-slate-700 text-white rounded-lg px-4 py-2 w-full md:w-auto outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Input Area */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Enter text or speak..."
                  className="w-full h-48 bg-slate-900 rounded-xl p-4 border border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
                <button
                  onClick={toggleListen}
                  className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 transition ${isListening ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}`}
                >
                  {/* <MicOff size={20} />  <Mic size={20} />*/}
                  {isListening ? "🎙️" : "🔬"}
                  {isListening ? "Stop Listening" : "Speak"}
                </button>
              </div>

              {/* Output Area */}
              <div className="space-y-4">
                <div className="w-full h-48 bg-slate-900 rounded-xl p-4 border border-slate-700 overflow-y-auto">
                  {translatedText || (
                    <span className="text-slate-500">
                      Translation will appear here...
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleTranslate}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 py-3 rounded-lg font-semibold transition"
                  >
                    Translate
                  </button>
                  <button
                    onClick={() => speak(translatedText, targetLang)}
                    className="px-4 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
                  >
                    {/* <Volume2 /> */}🔊
                  </button>
                  <button
                    onClick={copyToClipboard}
                    className="px-4 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
                  >
                    {/* <Check size={20} />  <Copy size={20} />*/}
                    {copied ? "✔️" : "©️"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
