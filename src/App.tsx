import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, 
  MessageSquare, 
  Volume2, 
  VolumeX, 
  Send, 
  Sparkles, 
  ExternalLink, 
  Flame, 
  Heart, 
  Coffee, 
  MapPin, 
  Languages, 
  Clock,
  HelpCircle,
  Share2,
  Mic,
  MicOff,
  Music,
  Film,
  Play
} from 'lucide-react';

import { COUNTRIES } from './data';
import { Message, CountryConfig, MilkOption } from './types';
import { LambCanvas } from './components/LambCanvas';

export default function App() {
  const [countries] = useState<CountryConfig[]>(COUNTRIES);
  const [selectedCountry, setSelectedCountry] = useState<CountryConfig>(COUNTRIES[0]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      content: 'Hoş geldin canım kardeşim... İstanbul’un bu loş, taze kakao ve odun kokulu Baa Sütevi’ne hoş geldin. Yorgun görünüyorsun. Gel hele gel, sana taze kaynatılmış içini ısıtacak ballı ılık bir barmen sütü hazırlayayım, dertleşelim. Ne anlatmak istersin bilge kuzuna? meee...',
      timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [isTalking, setIsTalking] = useState<boolean>(false);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true); // Default to true so voices work elegantly
  const [selectedMilk, setSelectedMilk] = useState<MilkOption | null>(null);
  const [isPouring, setIsPouring] = useState<boolean>(false);
  
  // Custom Speech Recording (STT) and Media recommendation tracking states
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [activeMedia, setActiveMedia] = useState<{
    type: string;
    title: string;
    description: string;
    query: string;
  } | null>(null);

  // Self-introduction memory form states
  const [userName, setUserName] = useState<string>('');
  const [userAge, setUserAge] = useState<string>('');
  const [userMood, setUserMood] = useState<string>('Dertli / Yorgun');
  const [userGoal, setUserGoal] = useState<string>('Derdini Dinlet (Sözel Terapi)');
  const [userProfileSaved, setUserProfileSaved] = useState<boolean>(false);

  // Custom milk brewery selection states
  const [milkMenuTab, setMilkMenuTab] = useState<'predefined' | 'custom'>('predefined');
  const [milkBase, setMilkBase] = useState<string>('tam_yagli');
  const [milkFlavor, setMilkFlavor] = useState<string>('bal_karabiber');
  const [milkTemp, setMilkTemp] = useState<string>('ilik');

  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Auto-scroll chat window when new message arrives
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Adjust greeting template when country changes
  useEffect(() => {
    let customGreeting = '';
    const timeStr = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    
    if (selectedCountry.id === 'tr') {
      customGreeting = 'İstanbul’un bu loş, taze kakao ve odun kokulu Baa Sütevi’ne hoş geldin canım kardeşim. Gel hele gel, sana taze kaynatılmış tarçınlı şifa sütü hazırlayayım, dertleşelim. Ne anlatmak istersin bilge kuzuna? meee...';
    } else if (selectedCountry.id === 'jp') {
      customGreeting = 'Irasshaimase, Kyoto’nun bambu fısıltılarına hoş geldiniz... meee... Baa-An’da sükunet ve dinginlik ikram ediyoruz. Zihninizi arındırmak için size taze çırpılmış bir Uji Matcha sütü hazırlayayım mı? Buyurun dostum.';
    } else if (selectedCountry.id === 'kg') {
      customGreeting = 'Amansız bozkırların özgür yürekli yolcuları, Altın Yurta’ya hoş geldiniz! meee... Karlı Isık Göl kıyısından taze yak sütü kaynattım. Yol yorgunluğunu almak için birebirdir, anlatın hele can dostlar!';
    } else if (selectedCountry.id === 'ie') {
      customGreeting = 'Aha, Galway kıyılarının serin rüzgarında sığınacak en yeşil köşeyi buldunuz! meee... Hoş geldiniz dostlarım! Şöminede çıtırdayan meşe odunumuza yanaşın, size nefis karamelli sıcak bir yulaf sütü ikram edeyim!';
    } else if (selectedCountry.id === 'it') {
      customGreeting = 'Ciao bella! Toskana bağlarının yanındaki Caffè della Pecora’ya hoş geldiniz! meee... Hayat taze süt, sıcak felsefe ve sanatla güzeldir. Size leziz bir badem sütü vereyim, sonrasında derin bir sohbete dalişalım!';
    }

    setMessages([
      {
        id: `welcome-${selectedCountry.id}-${Date.now()}`,
        role: 'model',
        content: customGreeting,
        timestamp: timeStr
      }
    ]);
    setSelectedMilk(null);
  }, [selectedCountry]);

  // Play procedural cute synthesis sound for "Meee" & actions (using Web Audio API so it's fully client-side and immediate)
  const playLambSound = (freqMultiplier = 1.0) => {
    if (!soundEnabled) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Procedural "baa" vowel filter using dual frequencies
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140 * freqMultiplier, ctx.currentTime);
      // Cute pitch drop during the "baa" sound
      osc.frequency.exponentialRampToValueAtTime(110 * freqMultiplier, ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.4);

      // Add a slight vibrato for realistic animal cute sound
      const vibrato = ctx.createOscillator();
      const vibratoGain = ctx.createGain();
      vibrato.frequency.value = 16;
      vibratoGain.gain.value = 8;
      vibrato.connect(vibratoGain);
      vibratoGain.connect(osc.frequency);
      vibrato.start();
      vibrato.stop(ctx.currentTime + 0.4);

    } catch (e) {
      console.warn("Could not play procedural synthesis audio.", e);
    }
  };

  // Text-To-Speech (TTS) using Web Speech API synthesis
  const speakResponse = (text: string) => {
    if (!soundEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      // Clear ongoing speech to avoid queues
      window.speechSynthesis.cancel();
      
      // Clean tags like [MEDIA:...] so Baa doesn't read the technical code aloud
      const textToRead = text.replace(/\[MEDIA:[^\]]+\]/g, '').trim();
      if (!textToRead) return;

      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = 'tr-TR';
      utterance.pitch = 1.35; // Cute sage lamb pitch
      utterance.rate = 1.05;  // Comforting barmen speech rate

      // Use a turkish voice if available
      const voices = window.speechSynthesis.getVoices();
      const trVoice = voices.find(v => v.lang.toLowerCase().includes('tr'));
      if (trVoice) {
        utterance.voice = trVoice;
      }

      utterance.onstart = () => {
        setIsTalking(true);
      };
      utterance.onend = () => {
        setIsTalking(false);
      };
      utterance.onerror = () => {
        setIsTalking(false);
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("TTS synthesis failed or unsupported:", err);
    }
  };

  // Speech-To-Text (STT) web speech api listener
  const toggleRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Maalesef tarayıcınız ses tanımayı (STT) desteklemiyor. Güncel bir Chrome veya Edge tarayıcı kullanırsanız sesli dertleşebilirsiniz!");
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
    } else {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'tr-TR';
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setIsRecording(true);
          playLambSound(1.2); // play happy ping sound
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setInput(prev => prev + (prev ? ' ' : '') + transcript);
          }
        };

        recognition.onerror = (e: any) => {
          console.error("Speech recognition error:", e);
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err) {
        console.error("Failed to start speech recognition app:", err);
        setIsRecording(false);
      }
    }
  };

  // Helper to extract embedded media tags [MEDIA:type|title|description|query]
  const parseResponseAndMedia = (text: string) => {
    const mediaRegex = /\[MEDIA:([^|]+)\|([^|]+)\|([^|]+)\|([^\]]+)\]/;
    const match = text.match(mediaRegex);
    if (match) {
      const cleanText = text.replace(mediaRegex, '').trim();
      return {
        cleanText,
        media: {
          type: match[1],         // "music" or "video"
          title: match[2],        // Song or video title
          description: match[3],  // Warm presentation commentary
          query: match[4]         // search keyword
        }
      };
    }
    return { cleanText: text, media: null };
  };

  const handleSend = async (textToSend?: string) => {
    const rawText = textToSend || input;
    const finalTxt = rawText.trim();
    if (!finalTxt) return;

    if (!textToSend) {
      setInput('');
    }

    // Include in message list
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: finalTxt,
      timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsThinking(true);
    playLambSound(1.1); // Slightly higher pitch for user inquiry

    // Stop speaking while submitting a new message
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    try {
      // Send chat history to backend proxy calling Gemini Server-Side Secure SDK with search grounding enabled
      const historyToSend = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: historyToSend,
          country: selectedCountry.id
        })
      });

      const data = await res.json();
      setIsThinking(false);

      if (data.reply) {
        setIsTalking(true);
        playLambSound(0.95); // Deeper wise pitch when starting response

        // Parse reply text for media tags automatically
        const parsed = parseResponseAndMedia(data.reply);
        
        const systemMsg: Message & { mediaRecommendation?: any } = {
          id: `model-${Date.now()}`,
          role: 'model',
          content: parsed.cleanText,
          timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
          groundingSources: data.sources || [],
          mediaRecommendation: parsed.media
        };

        // Track recommended media globally as well
        if (parsed.media) {
          setActiveMedia(parsed.media);
        }

        setMessages(prev => [...prev, systemMsg]);

        // Synthesize sweet Turkish voice readout
        speakResponse(parsed.cleanText);

        // Stop mouth talking animation after realistic time related to text length
        const duration = Math.min(8000, Math.max(2500, parsed.cleanText.length * 35));
        setTimeout(() => {
          setIsTalking(false);
        }, duration);

      } else {
        throw new Error(data.error || 'Bilinmeyen hata');
      }

    } catch (err) {
      setIsThinking(false);
      setMessages(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'model',
          content: 'Meee... Bardağını temizlerken bez elimden kaydı birden sinyal karıştı galiba. Ama canın sağ olsun be dostum, bana ne soruyordun tekrar söyler misin?',
          timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  const pourMilk = (item: MilkOption) => {
    if (isPouring) return;
    setIsPouring(true);
    setSelectedMilk(item);
    playLambSound(1.2); // Play excited kuzu sound

    // Synthesize pouring sound
    if (soundEnabled) {
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const ctx = audioContextRef.current;
        const bufferSize = ctx.sampleRate * 1.5; // 1.5 seconds milk pour duration
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;

        // Bandpass filter to make white noise sound like flowing sizzling warm liquid
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(350, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 1.2);
        filter.Q.value = 1.0;

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.01, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);

        whiteNoise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        whiteNoise.start();
        whiteNoise.stop(ctx.currentTime + 1.5);
      } catch (err) {}
    }

    setTimeout(() => {
      setIsPouring(false);
      // Ask Baa what she thinks about this selected milk
      handleSend(`Bana bu geleneksel ${item.name} sundun, kuzu kurnazlığıyla bunun ardındaki kültürü ve bu sütün bana şifasını, hikayesini anlat bakalım!`);
    }, 1500);
  };

  const pourCustomMilk = () => {
    if (isPouring) return;
    setIsPouring(true);
    
    // Create a mock MilkOption item for custom pouring display
    const customItem: MilkOption = {
      id: 'custom_milk',
      name: 'Özel Karışım Şifalı Süt',
      desc: 'Pişirme kazanınında senin için demlenen özel kuzu karışımı!',
      effect: 'Fiziksel zindelik ve derin ruhsal sükunet sunar.',
      icon: '🥛'
    };
    setSelectedMilk(customItem);
    playLambSound(1.25);

    // Synthesize pouring sound
    if (soundEnabled) {
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const ctx = audioContextRef.current;
        const bufferSize = ctx.sampleRate * 1.5;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(320, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(750, ctx.currentTime + 1.2);
        filter.Q.value = 1.0;

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.01, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.14, ctx.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);

        whiteNoise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        whiteNoise.start();
        whiteNoise.stop(ctx.currentTime + 1.5);
      } catch (err) {}
    }

    // Map keys to human descriptions
    const baseNames: Record<string, string> = {
      tam_yagli: 'Tam Yağlı Köy Sütü (%100 Yoğun Geleneksel Şifa)',
      yarim_yagli: 'Yarım Yağlı Süt (%1.5 Yağ Seviyesi ile Dengeli)',
      yagsiz: 'Yağsız Diyet Fit Süt (%0 Yağ Seviyesi)',
      laktozsuz: 'Laktozsuz Süt (Sindirimi Kolay Hassas Ruhlar İçin)',
      manda: 'Köy Usulü Kaymaklı Hakiki Manda Sütü'
    };

    const flavorNames: Record<string, string> = {
      bal_karabiber: 'Süzme Çiçek Balı & Çekilmiş Taze Karabiber',
      tarcin_salep: 'Kış Tarçını & Doğal Salep Özü Tozu',
      zencefil: 'Rendelenmiş Taze Zencefil & Karanfil Çekirdekleri',
      damla: 'Damla Sakızı Yağı & Kakule Tohumları',
      lavanta_uyku: 'Yabani Lavanta Yaprağı & Melisa Çiçeği Özü'
    };

    const tempNames: Record<string, string> = {
      ilik: 'Sıcacık Ilık Derecede',
      kaynar: 'Ateş gibi Hararetli ve Kaynar Kaynar Sıcacık',
      buzlu: 'Buzlu ve Serinletici Canlandırıcı Soğuk'
    };

    const selectedBaseDesc = baseNames[milkBase] || milkBase;
    const selectedFlavorDesc = flavorNames[milkFlavor] || milkFlavor;
    const selectedTempDesc = tempNames[milkTemp] || milkTemp;

    setTimeout(() => {
      setIsPouring(false);
      handleSend(`Sütü bardağıma doldur bakalım! Kendi özel süt tarifimi pişirme kazanında kaynattım. Tarifimin detayları:
- Süt Tabanı (Yağlı/Yağsız Çeşidi): ${selectedBaseDesc}
- Şifalı Bitki / Tat Aroması: ${selectedFlavorDesc}
- Sıcaklık Derecesi: ${selectedTempDesc}
Bunu benim için kuzu bilgeliğinle sağlıksal, psikolojik/ruhsal etkileriyle yorumlar mısın Baa? Eğer yarın iş falan varsa veya saat gece olduysa bardağımı yudumlarken kuzu gibi tatlı sert uyar canım abim!`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#07090b] text-zinc-100 flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-300">
      
      {/* Outer Aesthetic Headers */}
      <header className="border-b border-zinc-800/60 bg-zinc-950/40 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-500/10">
            <span className="text-xl font-bold text-zinc-950 font-mono">B</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white font-sans">Bilge Kuzu Baa</h1>
              <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                Bar Açık
              </span>
            </div>
            <p className="text-xs text-zinc-400">Türkçe Kültür Sentezi & 3D İnteraktif Kuzu Sohbeti</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Procedural Audio Enable Toggle */}
          <button 
            id="audio-toggle"
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              setTimeout(() => playLambSound(1.0), 50);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-all ${
              soundEnabled 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                : 'bg-zinc-900 border-zinc-800 text-zinc-400'
            }`}
          >
            {soundEnabled ? <Volume2 size={14} className="animate-bounce" /> : <VolumeX size={14} />}
            {soundEnabled ? 'SES: AÇIK' : 'SESİ AÇ'}
          </button>

          <div className="hidden sm:flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-zinc-400">
            <Clock size={13} className="text-amber-500" />
            <span>UTC: {new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </header>

      {/* Main Grid View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT COMPONENT: 3D Scene Viewport & Quick Country Selector (Takes 5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Immersive 3D Tavern Viewport */}
          <div className="relative rounded-2xl bg-zinc-950 border border-zinc-800/80 overflow-hidden flex-1 min-h-[340px] flex flex-col shadow-xl shadow-zinc-950/50">
            
            {/* Top Bar inside Viewport */}
            <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10 bg-gradient-to-b from-zinc-950/80 to-transparent pointer-events-none">
              <span className="text-xs font-mono font-semibold tracking-wider text-amber-400/80 flex items-center gap-1.5 bg-zinc-950/90 border border-zinc-800 px-3 py-1.5 rounded-full shadow-lg pointer-events-auto">
                <MapPin size={11} className="text-amber-500" />
                {selectedCountry.localName.toUpperCase()}
              </span>

              <span className="text-xs bg-zinc-900/90 border border-zinc-800 text-zinc-300 px-2.5 py-1.5 rounded-full pointer-events-auto flex items-center gap-1 text-[11px] font-mono">
                {selectedCountry.flag} Ülke Dekoru
              </span>
            </div>

            {/* Immersive Background Decor Layout (Shelf, Bottled Milks, Warm Candle Light Glow) */}
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between">
              {/* Wooden Shelf Back Wall Decors */}
              <div className="h-[120px] border-b border-zinc-800/40 bg-zinc-900/10 flex items-end justify-between px-10 pb-2">
                <div className="flex gap-2">
                  <div className="w-4 h-12 rounded-t-sm bg-amber-900/20 border border-amber-900/40" />
                  <div className="w-5 h-10 rounded-t-sm bg-yellow-900/15 border border-yellow-900/40" />
                </div>
                <div className="text-[10px] font-mono text-zinc-700 select-none tracking-widest pb-4">BAA SÜTEVİ EST. 2026</div>
                <div className="flex gap-2">
                  <div className="w-5 h-9 rounded-t-sm bg-emerald-950/30 border border-emerald-900/30" />
                  <div className="w-4 h-14 rounded-t-sm bg-orange-950/20 border border-orange-900/30" />
                </div>
              </div>
              
              {/* Outer Ground Dust ambient floor shadow */}
              <div className="h-[40px] bg-gradient-to-t from-zinc-950 to-transparent" />
            </div>

            {/* Simulated Candle Light Ray */}
            <div 
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[400px] pointer-events-none opacity-30 mix-blend-screen transition-all duration-1000"
              style={{
                background: `radial-gradient(circle at 50% 0%, ${selectedCountry.id === 'tr' ? '#f59e0b' : selectedCountry.id === 'jp' ? '#0ea5e9' : selectedCountry.id === 'kg' ? '#10b981' : selectedCountry.id === 'ie' ? '#22c55e' : '#f43f5e'} 0%, rgba(0,0,0,0) 65%)`
              }}
            />

            {/* Interactive 3D Canvas WebGL Component */}
            <div className="flex-1 w-full h-full relative z-10">
              <LambCanvas 
                isTalking={isTalking} 
                isThinking={isThinking} 
                countryId={selectedCountry.id}
                propType={selectedCountry.propType}
              />
            </div>

            {/* Realistic Dialog Bubble inside the bar visualizer */}
            <div className="absolute bottom-5 left-4 right-4 z-20">
              <div className="bg-zinc-950/90 border border-zinc-800/80 backdrop-blur-md rounded-xl p-4 shadow-xl">
                <p className="text-xs font-mono font-semibold tracking-wider text-zinc-500 mb-1 flex items-center gap-1.5 uppercase">
                  <span>●</span> BILGE BARMEN BAA
                </p>
                <p className="text-xs md:text-sm font-serif italic text-amber-200/90 leading-relaxed">
                  {isThinking ? (
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping"></span>
                      Meee... Çayırları, meraları ve sorunu düşünüyorum cancağızım...
                    </span>
                  ) : messages[messages.length - 1]?.role === 'model' ? (
                    messages[messages.length - 1].content.slice(0, 180) + (messages[messages.length - 1].content.length > 180 ? '...' : '')
                  ) : (
                    "Mee... Seni dinliyorum dostum, bardağına ne istersin?"
                  )}
                </p>
              </div>
            </div>

            {/* Liquid Pouring Animation HUD Overlay */}
            <AnimatePresence>
              {isPouring && selectedMilk && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-zinc-950/70 z-30 flex flex-col items-center justify-center p-6"
                >
                  <div className="relative flex flex-col items-center">
                    {/* Steaming cup icon animation */}
                    <div className="relative mb-4 w-16 h-16 bg-amber-950/20 rounded-full border border-amber-500/30 flex items-center justify-center">
                      <span className="text-3xl">{selectedMilk.icon}</span>
                      
                      {/* Procedural steam rising */}
                      <span className="absolute -top-3 left-[40%] text-zinc-300 text-xs font-serif italic speak steam-line">~</span>
                      <span className="absolute -top-4 left-[50%] text-zinc-300 text-xs font-serif italic speak steam-line-delayed">~</span>
                      <span className="absolute -top-3 left-[60%] text-zinc-300 text-xs font-serif italic speak steam-line">~</span>
                    </div>

                    <p className="text-sm font-bold text-amber-400 font-mono tracking-wider animate-pulse">SÜT SÜZÜLÜYOR...</p>
                    <p className="text-xs text-zinc-300 text-center mt-1 max-w-[260px] italic">
                      "Baa, taze sütü süzgeçten geçirip senin için özel olarak hazırlıyor..."
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Traditional Country Switcher */}
          <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-4 flex flex-col gap-3 shadow-lg shadow-zinc-950/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 font-mono tracking-wider flex items-center gap-1.5 uppercase">
                <Languages size={13} className="text-amber-500" />
                Ülke & Kültür Değiştir
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">Baa kıyafetini ve menüsünü değiştirir</span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {countries.map((c) => (
                <button
                  id={`btn-country-${c.id}`}
                  key={c.id}
                  onClick={() => {
                    setSelectedCountry(c);
                    playLambSound(0.85 + (0.05 * c.id.charCodeAt(0) % 5));
                  }}
                  className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all duration-300 ${
                    selectedCountry.id === c.id
                      ? 'bg-gradient-to-b from-amber-500/20 to-amber-500/5 border-amber-500/50 text-white scale-[1.05] shadow-lg shadow-amber-500/5'
                      : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900 hover:text-zinc-200'
                  }`}
                >
                  <span className="text-xl filter drop-shadow-sm">{c.flag}</span>
                  <span className="text-[10px] font-bold tracking-tight text-center truncate w-full">{c.name}</span>
                </button>
              ))}
            </div>

            {/* Quick presentation of the chosen country background */}
            <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-3 text-xs text-zinc-400 leading-normal italic">
              {selectedCountry.introduction}
            </div>
          </div>

          {/* Kendini BAA'ya Anlat (Sırdaş Hafızası) */}
          <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-4 flex flex-col gap-3 shadow-lg shadow-zinc-950/40">
            <div className="flex items-center justify-between border-b border-zinc-800/50 pb-2">
              <span className="text-xs font-bold text-zinc-300 font-mono tracking-wider flex items-center gap-1.5 uppercase">
                <Sparkles size={13} className="text-amber-500 animate-pulse" />
                Sırdaş Hafızası (Baa Seni Tanısın)
              </span>
              {userProfileSaved && (
                <span className="text-[9px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full font-mono border border-emerald-500/20">
                  Aktif Hafıza ✓
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-zinc-500 font-mono text-[10px]">Adın / Mahlasın</label>
                <input
                  type="text"
                  placeholder="örn. Can, Sırdaş"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-amber-500/50"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-zinc-500 font-mono text-[10px]">Yaşın</label>
                <input
                  type="number"
                  placeholder="örn. 25"
                  value={userAge}
                  onChange={(e) => setUserAge(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-zinc-500 font-mono text-[10px]">Ruh Halin / Derdin</label>
                <select
                  value={userMood}
                  onChange={(e) => setUserMood(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-zinc-300 focus:outline-none focus:border-amber-500/50 appearance-none text-xs"
                >
                  <option value="Dertli / Yorgun">😔 Dertli / Yorgun</option>
                  <option value="Uykusuz / Kaygılı">👀 Uykusuz / Kaygılı</option>
                  <option value="Bunalmış / Sıkılmış">⚡ Bunalmış / Sıkılmış</option>
                  <option value="Mutlu / Neşeli">✨ Mutlu / Neşeli</option>
                  <option value="Meraklı / Felsefi">🧠 Meraklı / Felsefi</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-zinc-500 font-mono text-[10px]">İhtiyacın</label>
                <select
                  value={userGoal}
                  onChange={(e) => setUserGoal(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-zinc-300 focus:outline-none focus:border-amber-500/50 appearance-none text-xs"
                >
                  <option value="Derdini Dinlet (Sözel Terapi)">🍷 Derdini Dinlet (Terapi)</option>
                  <option value="Burç & Yıldız Analizi Yap">🔮 Burç & Yıldız Analizi</option>
                  <option value="Rüya Tabiri">🌙 Rüya Tabiri</option>
                  <option value="Süt Şifası & Kitap Tavsiyesi">📚 Kitap & Süt Önerisi</option>
                  <option value="Muhabbet & Eğlence">🎲 Muhabbet & Eğlence</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => {
                if (!userName.trim()) {
                  alert("Lütfen adınızı girin ki Baa size ismiyle hitap edebilsin!");
                  return;
                }
                setUserProfileSaved(true);
                playLambSound(1.3);
                // Send profile save notification to Baa
                handleSend(
                  `Selam Baa, ben geldim! Profil bilgilerim şöyle: Adım ${userName}, yaşım ${userAge || 'belirtilmedi'}, şu an "${userMood}" hissediyorum ve seninle "${userGoal}" üzerine dertleşmeye geldim. Benim bu halimi, rütbemi aklında tut; bana yaşıma, adımla hitap ederek o bitirim barmen bilgeliğinle, tatlı sert esnaf lisanınla hoş geldin de bakayım! meee.`
                );
              }}
              className="mt-1 w-full bg-amber-500 hover:bg-amber-600 active:scale-95 text-zinc-950 font-bold text-xs py-2 px-3 rounded-xl transition-all shadow-md shadow-amber-500/10 flex items-center justify-center gap-1.5"
            >
              <span>Bilgileri Kaydet ve Baa'yı Çağır! ⚡</span>
            </button>
          </div>
        </div>

        {/* RIGHT COMPONENT: Context-aware interactive Dialog & Bar Milk Menu (Takes 7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Süt Tab Sistemi (Geleneksel & Kendi Karışımın) */}
          <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-4 flex flex-col gap-3 shadow-lg shadow-zinc-950/40">
            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2">
              <div className="flex items-center gap-2">
                <span className="p-1 px-1.5 rounded bg-amber-500/10 border border-amber-500/20 text-xs">🥛</span>
                <div>
                  <h3 className="text-xs font-bold text-zinc-200 font-mono tracking-wider uppercase">BAA SÜT TEZGAHI & ŞİFA LAB</h3>
                  <p className="text-[10px] text-zinc-500">Geleneksel lezzetleri yudumlayın ya da kazanda kendi sütünüzü kaynatın!</p>
                </div>
              </div>

              {/* Tab Switcher */}
              <div className="flex bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
                <button
                  onClick={() => { setMilkMenuTab('predefined'); playLambSound(1.0); }}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold transition-all ${
                    milkMenuTab === 'predefined'
                      ? 'bg-amber-500 text-zinc-950 shadow-md'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  MENÜ
                </button>
                <button
                  onClick={() => { setMilkMenuTab('custom'); playLambSound(1.1); }}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold transition-all flex items-center gap-1 ${
                    milkMenuTab === 'custom'
                      ? 'bg-amber-500 text-zinc-950 shadow-md'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  ŞİFA KAZANI ⚗️
                </button>
              </div>
            </div>

            {milkMenuTab === 'predefined' ? (
              /* Traditional predefined list */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {selectedCountry.milkOptions.map((milk) => (
                  <div 
                    id={`milk-card-${milk.id}`}
                    key={milk.id}
                    onClick={() => pourMilk(milk)}
                    className="bg-zinc-900/40 hover:bg-zinc-900/90 border border-zinc-800/80 hover:border-amber-500/30 rounded-xl p-3 flex flex-col justify-between gap-2.5 transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl group-hover:scale-110 transition-transform">{milk.icon}</span>
                      <span className="text-[9px] font-mono bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded uppercase font-semibold text-amber-500">Yudumla</span>
                    </div>
                    
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">{milk.name}</h4>
                      <p className="text-[10px] text-zinc-400 leading-snug mt-1 h-[32px] overflow-hidden">{milk.desc}</p>
                    </div>

                    <div className="border-t border-zinc-800/60 pt-1.5 flex items-center gap-1.5">
                      <Sparkles size={10} className="text-emerald-400 flex-shrink-0" />
                      <span className="text-[9px] font-mono text-zinc-400 group-hover:text-emerald-300 transition-colors truncate">{milk.effect}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Custom recipe milk creation lab */
              <div className="bg-zinc-900/20 border border-zinc-800/50 rounded-xl p-3 flex flex-col gap-3">
                
                {/* 3 columns of selectors */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  
                  {/* Süt Tabanı */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-mono text-amber-400/85">1. SÜT TABANI / YAĞ SEVİYESİ</span>
                    <select
                      value={milkBase}
                      onChange={(e) => setMilkBase(e.target.value)}
                      className="bg-zinc-950 border border-zinc-850 rounded-lg p-2 text-zinc-300 focus:outline-none focus:border-amber-500/50"
                    >
                      <option value="tam_yagli">🥛 %100 Tam Yağlı Köy Sütü</option>
                      <option value="yarim_yagli">🥛 %1.5 Yarım Yağlı Süt</option>
                      <option value="yagsiz">🥛 %0 Yağsız Diyet Fit Süt</option>
                      <option value="laktozsuz">🌱 Laktozsuz Süt (Saf Sindirim)</option>
                      <option value="manda">🥥 Köy Usulü Yağlı Manda Sütü</option>
                    </select>
                  </div>

                  {/* Aromatik Katkı */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-mono text-amber-400/85">2. DOĞAL AROMATİK KATKILAR</span>
                    <select
                      value={milkFlavor}
                      onChange={(e) => setMilkFlavor(e.target.value)}
                      className="bg-zinc-950 border border-zinc-850 rounded-lg p-2 text-zinc-300 focus:outline-none focus:border-amber-500/50"
                    >
                      <option value="bal_karabiber">🍯 Süzme Bal & Karabiber (Şifa)</option>
                      <option value="tarcin_salep">🍂 Kış Tarçını & Salep Tozu</option>
                      <option value="zencefil">🍋 Zencefil & Karanfil (Enerji)</option>
                      <option value="damla">🏛 Damla Sakızı & Kakule</option>
                      <option value="lavanta_uyku">🪻 Yabani Lavanta & Melisa Özü</option>
                    </select>
                  </div>

                  {/* Isı */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-mono text-amber-400/85">3. SICAKLIK DEĞERİ</span>
                    <select
                      value={milkTemp}
                      onChange={(e) => setMilkTemp(e.target.value)}
                      className="bg-zinc-950 border border-zinc-850 rounded-lg p-2 text-zinc-300 focus:outline-none focus:border-amber-500/50"
                    >
                      <option value="ilik">♨ Ilık Derecede</option>
                      <option value="kaynar">🌋 Kaynar Kaynar Sıcak</option>
                      <option value="buzlu">❄ Buzlu Soğuk</option>
                    </select>
                  </div>

                </div>

                <button
                  onClick={pourCustomMilk}
                  className="w-full bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-zinc-950 font-extrabold text-xs py-2.5 px-4 rounded-xl transition-all shadow-md shadow-amber-500/5 duration-300 select-none flex items-center justify-center gap-1.5 shadow-amber-500/20"
                >
                  <span>KAZANDA SÜTÜ PİŞİR & SICAK SIRDAŞA SUN! ⚗️🥛</span>
                </button>
              </div>
            )}
          </div>

          {/* Core Chat Box System */}
          <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl flex-1 flex flex-col overflow-hidden shadow-xl shadow-zinc-950/50 min-h-[380px] md:min-h-0">
            
            {/* Thread Header */}
            <div className="bg-zinc-950/80 pl-4 pr-3 py-3 border-b border-zinc-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                <span className="text-xs font-bold font-mono tracking-wider uppercase text-zinc-400">Canlı Kuzu Sohbeti</span>
              </div>

              {/* Reset History / Share options */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    const timeStr = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                    setMessages([
                      {
                        id: 'reset',
                        role: 'model',
                        content: 'Mee... Bütün bardakları pırıl pırıl sildim, masayı temizledim temiz dert ortağı sayfasını açtım canım dostum. Yeni şifa kupalarıyla anlat hele dinliyorum.',
                        timestamp: timeStr
                      }
                    ]);
                    setSelectedMilk(null);
                    playLambSound(1.0);
                  }}
                  className="p-1 px-2 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-750 text-zinc-400 hover:text-white rounded text-[10px] font-mono transition-all cursor-pointer"
                >
                  Masayı Temizle (Sıfırla)
                </button>
              </div>
            </div>

            {/* Messaging Dialog Stream Viewport */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scroll max-h-[480px]">
              <AnimatePresence initial={false}>
                {messages.map((msg, idx) => (
                  <motion.div
                    id={`chat-msg-${msg.id}`}
                    key={msg.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="max-w-[85%] flex flex-col gap-1">
                      
                      {/* Name Header */}
                      <span className={`text-[10px] font-mono tracking-wider ${msg.role === 'user' ? 'text-zinc-500 text-right' : 'text-amber-500/80'}`}>
                        {msg.role === 'user' ? 'DEĞERLİ SIRDAŞ' : `KUZU BAA — ${selectedCountry.name.toUpperCase()}`}
                      </span>

                      {/* Content Bubble */}
                      <div className={`p-4 rounded-2xl leading-relaxed text-sm shadow-md ${
                        msg.role === 'user'
                          ? 'bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-tr-none'
                          : 'bg-gradient-to-b from-amber-500/10 to-transparent border border-amber-500/15 text-amber-100 rounded-tl-none font-serif text-[14.5px]'
                      }`}>
                        
                        {/* Rendering output. In Turkey prompt it guarantees no markdown but we sanitize simple things */}
                        <p className="whitespace-pre-line leading-relaxed">{msg.content}</p>

                        {/* Custom Media Attachment Card */}
                        {(msg as any).mediaRecommendation && (
                          <div className="mt-3 bg-zinc-950/90 border border-zinc-800/85 p-3.5 rounded-xl flex flex-col gap-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono tracking-wider font-extrabold text-amber-400 flex items-center gap-1.5">
                                {(msg as any).mediaRecommendation.type === 'music' ? (
                                  <>
                                    <Music size={12} className="text-amber-500 animate-pulse" />
                                    BAA'DAN SANA ÖZEL MÜZİK ÖNERİSİ 🎵
                                  </>
                                ) : (
                                  <>
                                    <Film size={12} className="text-amber-400 animate-pulse" />
                                    BAA'DAN BİLGİLENDİRİCİ VİDEO ÖNERİSİ 🎥
                                  </>
                                )}
                              </span>
                              <span className="text-[9px] font-mono bg-zinc-900 text-amber-500 px-2 py-0.5 rounded border border-amber-500/25">
                                {(msg as any).mediaRecommendation.type.toUpperCase()}
                              </span>
                            </div>

                            <div className="font-sans">
                              <h5 className="text-xs font-bold text-white tracking-tight">{(msg as any).mediaRecommendation.title}</h5>
                              <p className="text-[10.5px] leading-relaxed text-zinc-400 mt-1 italic font-normal">{(msg as any).mediaRecommendation.description}</p>
                            </div>

                            <a 
                              href={`https://www.youtube.com/results?search_query=${encodeURIComponent((msg as any).mediaRecommendation.query)}`}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-600/15 to-red-600/35 hover:from-red-600/25 hover:to-red-600/45 border border-red-500/30 hover:border-red-500/50 text-red-400 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold select-none text-center transition-all cursor-pointer w-full text-[11px]"
                            >
                              <Play size={10} className="fill-red-400 text-red-400" />
                              <span>Bunu YouTube'da Aç & Dinle/İzle!</span>
                              <ExternalLink size={10} />
                            </a>
                          </div>
                        )}

                        {/* Search Grounding Sources Output */}
                        {msg.groundingSources && msg.groundingSources.length > 0 && (
                          <div className="border-t border-zinc-900 mt-3 pt-2.5">
                            <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1.5 uppercase font-semibold">
                              <Sparkles size={10} className="text-amber-500" />
                              Baa'nın İnternetten Harmanladığı Bilgi Kaynakları:
                            </span>

                            <div className="flex flex-wrap gap-2 mt-1.5">
                              {msg.groundingSources.map((source, sIdx) => (
                                <a 
                                  key={sIdx}
                                  href={source.uri} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 px-2.5 py-1 rounded-md text-[10px] text-zinc-400 hover:text-amber-300 transition-all font-mono"
                                >
                                  <span>{source.title.slice(0, 18) || 'Kaynak'}</span>
                                  <ExternalLink size={8} />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Timestamp status line */}
                      <span className={`text-[9px] font-mono text-zinc-600 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                        {msg.timestamp}
                      </span>

                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator bubble */}
              {isThinking && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex flex-col gap-1 max-w-[80%]">
                    <span className="text-[10px] font-mono tracking-wider text-amber-500/80">KUZU BAA</span>
                    <div className="bg-zinc-950/60 border border-zinc-800/80 p-4 rounded-2xl rounded-tl-none text-zinc-400">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                          <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                          <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                        </span>
                        <span className="text-xs font-mono text-zinc-500">Baa harika sütler ve bilgece cevaplar hazırlıyor...</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Quick Suggestion Tags Picker */}
            <div className="px-4 py-2 bg-zinc-950/40 border-t border-zinc-800/60 flex items-center gap-2 overflow-x-auto whitespace-nowrap custom-scroll">
              <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase shrink-0">Muhabbet Başlığı:</span>
              <button 
                onClick={() => handleSend("Maç sonuçları ve spor dünyasında günün heyecanı nedir Baa?")}
                className="px-3 py-1 rounded-full bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-400 hover:text-white transition-all font-mono"
              >
                ⚽ Maç Skorları
              </button>
              <button 
                onClick={() => handleSend("Bu akşam hangi kanalda ne var? Kuzu aklınla bana güzel bir ekran rehberi ver Baa.")}
                className="px-3 py-1 rounded-full bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-400 hover:text-white transition-all font-mono"
              >
                📺 Bu Akşam TV
              </button>
              <button 
                onClick={() => handleSend("Yılın bu vaktinde gökyüzü burçlarıma, talihe ne diyor? Bana bir bilge kuzu gözünden yıldız felsefesi yap.")}
                className="px-3 py-1 rounded-full bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-400 hover:text-white transition-all font-mono"
              >
                ✨ Burç Yorumları
              </button>
              <button 
                onClick={() => handleSend("Dün gece rüyamda garip semboller gördüm. Kuzu aklınla bunu Jung ekolünde, dertlice anlatıp rüyamı yorumlar mısın?")}
                className="px-3 py-1 rounded-full bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-400 hover:text-white transition-all font-mono"
              >
                💭 Rüya Tabiri
              </button>
              <button 
                onClick={() => handleSend("Altılıda son ayakta kim gelir, son dakika durumları ne? Komik, uyanık esnaf tahminlerini bekliyorum bilge dert ortağım!")}
                className="px-3 py-1 rounded-full bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-400 hover:text-white transition-all font-mono"
              >
                🐎 Altılı Ganyan Yorumu
              </button>
              <button 
                onClick={() => handleSend("Biraz dertliyim, canım sıkkın bilge kuzum. Bana ruhumu sakinleştirecek bir kitap veya bilgece felsefi kelamlar söyle.")}
                className="px-3 py-1 rounded-full bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-400 hover:text-white transition-all font-mono"
              >
                📚 Kitap Tavsiyesi
              </button>
            </div>

            {/* Input Row panel */}
            <div className="bg-zinc-950 p-4 border-t border-zinc-800/80 flex items-center gap-3">
              {/* STT Microphone Input Trigger Button */}
              <button
                onClick={toggleRecording}
                className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center border transition-all duration-150 cursor-pointer ${
                  isRecording 
                    ? 'bg-red-500/15 border-red-500 text-red-500 animate-pulse shadow-lg shadow-red-500/15' 
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
                title={isRecording ? "Ses dinleniyor... Durdurmak için tıklayın." : "Sesli dertleşmek için tıklayın."}
              >
                {isRecording ? (
                  <MicOff size={18} className="text-red-500" />
                ) : (
                  <Mic size={18} />
                )}
              </button>

              <input
                id="message-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSend();
                  }
                }}
                disabled={isThinking}
                placeholder={isRecording ? "Konuşun, sesiniz yazıya dökülüyor..." : "Bilge kuzu barmene anlat hele, ne dertleşmek istersin?..."}
                className="flex-1 bg-zinc-900 hover:bg-zinc-850 focus:bg-zinc-900 border border-zinc-800 focus:border-amber-500/50 outline-none rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 transition-all font-sans"
              />
              <button
                id="btn-send-message"
                onClick={() => handleSend()}
                disabled={isThinking || !input.trim()}
                className="h-11 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-850 disabled:text-zinc-600 disabled:border-zinc-800/40 text-zinc-950 font-bold text-xs font-mono transition-all duration-150 flex items-center gap-2 shadow-lg shadow-amber-500/10 cursor-pointer"
              >
                <span>ANLAT</span>
                <Send size={12} className="text-zinc-950" />
              </button>
            </div>

          </div>

        </div>

      </main>

      {/* Decorative footer */}
      <footer className="border-t border-zinc-800/40 bg-zinc-950 mt-12 py-6 px-10 text-center text-xs text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-2">
          <span>{selectedCountry.flag}</span>
          <span>Baa Sütevi Kültür Elçisi &copy; 2026. Şifa dolu günler diler! meee...</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-zinc-600 font-semibold">Gemini 3.5 Grounding Engine Active 🚀</span>
        </div>
      </footer>

    </div>
  );
}
