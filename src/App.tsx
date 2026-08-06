import {useState,useEffect,useRef} from "react";
import Header from "./component/Header";
import { LANGUAGES } from "./layout/Languages";
import {
  Mic,
  MicOff,
  Volume2,
  Languages,
  ArrowRightLeft,
  Copy,
  Check,
  LanguagesIcon
} from "lucide-react";
import {  Translator } from "google-translate-api-x";

function App() {
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("fr");
  const [isListening, setIsListening] = useState(true);
  const [copied, setCopied] = useState(false);

  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current =new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = sourceLang;

      recognitionRef.current.onresult = (event: any) => {
        const transcript=event.results[0][0].transcript;
        
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
  const handleTranslate = async() => {
    if (!inputText) return;
    // In a real app, integrate a service like Google Translate or DeepL API here.
    // For this demonstration, we simulate a translation by reversing or modifying the text.
    const translator= new Translator({from:sourceLang,to:targetLang,tld:"fr",autoCorrect:true,forceTo:true,forceBatch:true,forceFrom:true})
    
    await translator.translate(inputText).then((data) => {
    console.log(data.text);
    
     return  setTranslatedText(`[translated to ${targetLang}]`+" "+data.text)
      
    },(err) => {
      console.log(err) 
      return  setTranslatedText(
        `[Translated to ${targetLang}]: ${inputText.split("").reverse().join("")} `
      );
    })
    
  };

  const speak = (text:string, lang:string):void => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    window.speechSynthesis.speak(utterance);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
  
      setTimeout(() => setCopied(false),2000);
  
  };

  return (
    <>
      <div className="min-h-screen w-full min-w-screen bg-slate-900 text-slate-100 p-4 md:p-8 font-sans">
        <div className="max-w-4xl mx-auto">
      <Header/>

          <div className="bg-slate-800 w-full rounded-2xl shadow-xl p-6 border border-slate-700 transition duration-200">
            {/* Controls */}
            <Languages size={20}  className="flex w-full mb-4"/>
            <div className="flex flex-col md:flex-row items-center gap-4 mb-6 w-full">
              <select
                title="select translate language from"
                name="language"
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                className="bg-slate-700 flex-1 text-white rounded-lg px-4 py-2 w-full md:w-auto outline-none focus:ring-2 focus:ring-blue-500"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.name}
                  </option>
                ))}
              </select>

              <ArrowRightLeft className="text-slate-500 rotate-90 hover:text-white/80 md:rotate-0" />

              <select
                title="select language to translate to"
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="bg-slate-700 flex-1 text-white rounded-lg px-4 py-2 w-full md:w-auto outline-none focus:ring-2 focus:ring-emerald-500"
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
                  type="button"
                  onClick={toggleListen}
                  className={`w-full py-3 cursor-pointer rounded-lg flex items-center justify-center gap-2 transition ${!isListening ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}`}
                >
                  {/*   */}
                  {!isListening ? <MicOff size={20} /> : <Mic size={20} />}
                  {!isListening ? "Stop Listening" : "Speak"}
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
                    title="translate"
                    onClick={handleTranslate}
                    className="flex-1  items-center flex justify-center gap-x-4 cursor-pointer bg-emerald-600 hover:bg-emerald-700 py-3 rounded-lg font-semibold transition"
                  >
                    <LanguagesIcon /> Translate
                  </button>
                  <button
                    title="listen"
                    onClick={() => speak(translatedText, targetLang)}
                    className="px-4 cursor-pointer bg-slate-700 hover:bg-slate-600 rounded-lg transition"
                  >
                    <Volume2 />
                  </button>
                  <button
                    title="copy to clipbaord"
                    onClick={copyToClipboard}
                    className="px-4 cursor-pointer bg-slate-700 hover:bg-slate-600 rounded-lg transition"
                  >
                    {/*  */}
                    {copied ? <Check size={20} /> : <Copy size={20} />}
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
