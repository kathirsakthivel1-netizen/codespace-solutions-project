import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { Mic, MicOff, Volume2, Sparkles, MessageSquare, Zap, ChevronRight } from "lucide-react";

type VoiceState = "idle" | "listening" | "processing" | "speaking";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  time: Date;
}

const suggestedCommands = [
  { icon: Sparkles, text: "What's expiring today?", category: "Inventory" },
  { icon: Zap, text: "Check fridge temperature", category: "Sensors" },
  { icon: MessageSquare, text: "Suggest a recipe with milk and eggs", category: "Recipes" },
  { icon: Volume2, text: "Read out my grocery list", category: "Shopping" },
  { icon: Sparkles, text: "How fresh are my vegetables?", category: "Freshness" },
  { icon: Zap, text: "Is the compressor running normally?", category: "Hardware" },
];

const responses: Record<string, string> = {
  "What's expiring today?": "You have 3 items expiring soon: **Whole Milk** expires in 2 hours, **Greek Yogurt** in 6 hours, and **Cheddar Cheese** in 12 hours. I'd recommend using the milk for a smoothie recipe!",
  "Check fridge temperature": "Current readings: **Main compartment** is at **3.4°C** (safe range ✅), **Freezer** is at **-18.2°C** (optimal ✅). Humidity is at **62%** — all within normal parameters.",
  "Suggest a recipe with milk and eggs": "Based on your available ingredients, I recommend **Classic French Toast**! 🍞 You have milk, eggs, and bread. It takes about 15 minutes. Want me to pull up the full recipe?",
  "Read out my grocery list": "Your grocery list has 6 items: Butter, Orange Juice, Chicken Breast, Spinach, Greek Yogurt, and Tomatoes. Want me to add anything else?",
  "How fresh are my vegetables?": "Freshness scan results: **Broccoli** — 92% fresh (2 days left), **Carrots** — 85% fresh (3 days), **Spinach** — 68% fresh (use today!). The AI vision system detected slight wilting on the spinach leaves.",
  "Is the compressor running normally?": "Compressor diagnostics: Vibration level at **0.12g** (normal ✅), power consumption **145W** (efficient ✅). Last maintenance cycle was 45 days ago. Next recommended check in 15 days.",
};

export const VoiceAssistantView = () => {
  const [state, setState] = useState<VoiceState>("idle");
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", role: "assistant", text: "Hi! I'm your Smart Fridge AI assistant. Ask me about your inventory, recipes, sensor readings, or anything else. Tap the microphone or type below.", time: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [waveAmplitudes, setWaveAmplitudes] = useState<number[]>(new Array(24).fill(0.1));
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Animate voice wave
  useEffect(() => {
    if (state !== "listening" && state !== "speaking") return;
    const t = setInterval(() => {
      setWaveAmplitudes(new Array(24).fill(0).map(() => 
        state === "listening" ? 0.2 + Math.random() * 0.8 : 0.1 + Math.random() * 0.5
      ));
    }, 100);
    return () => clearInterval(t);
  }, [state]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback((text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", text, time: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setState("processing");

    setTimeout(() => {
      setState("speaking");
      const response = responses[text] || `I checked your fridge data — everything looks good! The AI system is monitoring ${Math.floor(20 + Math.random() * 10)} items across all compartments. Is there anything specific you'd like to know?`;
      const assistantMsg: Message = { id: (Date.now() + 1).toString(), role: "assistant", text: response, time: new Date() };
      setMessages((prev) => [...prev, assistantMsg]);

      setTimeout(() => setState("idle"), 2000);
    }, 1500);
  }, []);

  const toggleListening = useCallback(() => {
    if (state === "listening") {
      setState("processing");
      // Simulate voice recognition
      const commands = Object.keys(responses);
      const recognized = commands[Math.floor(Math.random() * commands.length)];
      setTimeout(() => sendMessage(recognized), 800);
    } else {
      setState("listening");
    }
  }, [state, sendMessage]);

  return (
    <div className="animate-fade-in space-y-6">
      {/* Voice Orb */}
      <div className="glass rounded-3xl p-8 flex flex-col items-center">
        {/* Animated orb */}
        <div className="relative mb-6">
          {/* Glow rings */}
          <div className={cn(
            "absolute inset-0 rounded-full transition-all duration-500",
            state === "listening" && "animate-ping bg-primary/20",
            state === "speaking" && "animate-pulse bg-accent/20"
          )} style={{ margin: "-20px" }} />
          <div className={cn(
            "absolute inset-0 rounded-full transition-all duration-300",
            (state === "listening" || state === "speaking") && "bg-primary/10",
          )} style={{ margin: "-10px" }} />

          <button
            onClick={toggleListening}
            className={cn(
              "relative h-28 w-28 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95",
              state === "idle" && "bg-gradient-to-br from-primary to-accent shadow-lg hover:shadow-xl hover:scale-105",
              state === "listening" && "bg-gradient-to-br from-primary to-accent shadow-[0_0_40px_hsl(var(--primary)/0.6)] scale-110",
              state === "processing" && "bg-gradient-to-br from-primary/50 to-accent/50 animate-pulse",
              state === "speaking" && "bg-gradient-to-br from-accent to-primary shadow-[0_0_30px_hsl(var(--accent)/0.5)]",
            )}
          >
            {state === "listening" ? (
              <MicOff className="h-10 w-10 text-white" strokeWidth={1.5} />
            ) : state === "speaking" ? (
              <Volume2 className="h-10 w-10 text-white animate-pulse" strokeWidth={1.5} />
            ) : (
              <Mic className="h-10 w-10 text-white" strokeWidth={1.5} />
            )}
          </button>
        </div>

        {/* Status text */}
        <p className={cn(
          "text-sm font-medium mb-4 transition-colors",
          state === "idle" && "text-soft",
          state === "listening" && "text-primary",
          state === "processing" && "text-warning",
          state === "speaking" && "text-accent",
        )}>
          {state === "idle" && "Tap to speak"}
          {state === "listening" && "Listening..."}
          {state === "processing" && "Processing..."}
          {state === "speaking" && "Speaking..."}
        </p>

        {/* Voice waveform */}
        <div className="flex items-center gap-[3px] h-12 mb-2">
          {waveAmplitudes.map((amp, i) => (
            <div
              key={i}
              className={cn(
                "w-1 rounded-full transition-all duration-150",
                state === "listening" ? "bg-primary" : state === "speaking" ? "bg-accent" : "bg-white/10"
              )}
              style={{ height: `${amp * 48}px` }}
            />
          ))}
        </div>
      </div>

      {/* Suggested Commands */}
      <div className="glass rounded-3xl p-5">
        <p className="text-xs text-softer uppercase tracking-wider mb-3">Suggested Commands</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {suggestedCommands.map((cmd) => (
            <button
              key={cmd.text}
              onClick={() => sendMessage(cmd.text)}
              className="glass rounded-xl p-3 flex items-center gap-3 text-left hover:bg-white/5 transition-all active:scale-[0.98] group"
            >
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
                <cmd.icon className="h-4 w-4 text-primary" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-softer">{cmd.category}</p>
                <p className="text-sm truncate">{cmd.text}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-softer group-hover:text-primary transition-colors shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Chat Transcript */}
      <div className="glass rounded-3xl p-5">
        <p className="text-xs text-softer uppercase tracking-wider mb-3">Conversation</p>
        <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-hide mb-4">
          {messages.map((msg) => (
            <div key={msg.id} className={cn("flex gap-3", msg.role === "user" && "flex-row-reverse")}>
              <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                msg.role === "assistant" ? "bg-gradient-to-br from-primary to-accent" : "glass-strong"
              )}>
                {msg.role === "assistant" ? (
                  <Sparkles className="h-4 w-4 text-white" strokeWidth={1.5} />
                ) : (
                  <Mic className="h-4 w-4 text-soft" strokeWidth={1.5} />
                )}
              </div>
              <div className={cn(
                "glass rounded-2xl p-3 max-w-[75%]",
                msg.role === "user" && "bg-primary/10"
              )}>
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                <p className="text-[10px] text-softer mt-1">
                  {msg.time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Text input */}
        <div className="glass-strong rounded-2xl p-2 pl-4 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            placeholder="Type a command..."
            className="bg-transparent border-0 outline-none flex-1 text-sm placeholder:text-softer py-1"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim()}
            className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 hover:scale-105 active:scale-95 transition-transform disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};
