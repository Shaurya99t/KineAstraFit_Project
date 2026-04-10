import { startTransition, useEffect, useRef, useState } from "react";
import { Brain, Dumbbell, Flame, Target } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AIChat from "../components/AIChat";
import {
  clearChatHistory,
  getChatHistory,
  getProfile,
  sendChatMessage,
} from "../services/api";
import { getErrorMessage } from "../utils/errorHandler";

const starterMessage = {
  role: "assistant",
  content:
    "Today's plan:\n- Push workout\n- Calories: 2100 kcal\n- Protein: 145g\n- Focus: Keep form consistent",
};

const suggestedPrompts = [
  "Build today's plan",
  "Fix missed workout",
  "Vegetarian meal plan",
  "High fatigue adjustment",
  "Protein target",
];

export default function ChatPage() {
  const [messages, setMessages] = useState([starterMessage]);
  const [profile, setProfile] = useState(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [profileReady, setProfileReady] = useState(true);
  const [listening, setListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef(null);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function bootstrapChat() {
      try {
        const [profileResponse, historyResponse] = await Promise.all([
          getProfile(),
          getChatHistory(),
        ]);

        setProfile(profileResponse.data);

        if (historyResponse.data.length > 0) {
          const hydratedMessages = historyResponse.data.flatMap((item) => [
            { role: "user", content: item.user_input },
            { role: "assistant", content: item.ai_response },
          ]);
          setMessages(hydratedMessages);
        }

        setProfileReady(true);
      } catch (err) {
        if (err.response?.status === 404) {
          setProfileReady(false);
          return;
        }
        setError(getErrorMessage(err) || "Unable to load the AI chat workspace.");
      } finally {
        setHistoryLoading(false);
      }
    }

    bootstrapChat();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return undefined;
    }

    setSpeechSupported(true);
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript;
      if (transcript) {
        setInput(transcript);
      }
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
      window.speechSynthesis?.cancel();
    };
  }, []);

  const speakResponse = (text) => {
    if (!voiceFeedback || !("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (event) => {
    event.preventDefault();
    if (!input.trim() || sending || !profileReady) {
      return;
    }

    const userMessage = {
      role: "user",
      content: input.trim(),
    };

    startTransition(() => {
      setMessages((current) => [...current, userMessage]);
    });

    setInput("");
    setSending(true);
    setError("");

    try {
      const response = await sendChatMessage(userMessage.content);
      const aiMessage = response.data.response;

      startTransition(() => {
        setMessages((current) => [
          ...current,
          {
            role: "assistant",
            content: aiMessage,
          },
        ]);
      });

      speakResponse(aiMessage);
    } catch (err) {
      if (err.response?.status === 404) {
        setProfileReady(false);
        setError(getErrorMessage(err) || "Please create your profile before chatting.");
        return;
      }
      setError(getErrorMessage(err) || "The AI coach is unavailable right now. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleClearChat = async () => {
    try {
      await clearChatHistory();
      setMessages([starterMessage]);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err) || "Unable to clear chat history.");
    }
  };

  const toggleMic = () => {
    if (!recognitionRef.current) {
      return;
    }

    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }

    setListening(true);
    recognitionRef.current.start();
  };

  if (historyLoading) {
    return (
      <div className="glass-card rounded-[28px] p-8 text-center text-muted">
        Loading coaching workspace...
      </div>
    );
  }

  if (!profileReady) {
    return (
      <div className="glass-card rounded-[28px] p-8">
        <p className="text-xs uppercase tracking-[0.28em] text-muted">Profile required</p>
        <h2 className="mt-3 font-display text-3xl font-semibold text-ink">
          Set up your fitness profile first
        </h2>
        <p className="mt-4 max-w-xl text-muted">
          Your coach needs your goal, diet, and workout style before it can give useful answers.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/profile"
            className="rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white dark:bg-white dark:text-slate-900"
          >
            Go to Profile Setup
          </Link>
          <button
            onClick={() => navigate("/dashboard")}
            className="rounded-full border border-slate-200/80 bg-white/70 px-5 py-3 text-sm font-medium text-slate-700 dark:border-slate-700/80 dark:bg-slate-900/70 dark:text-slate-100"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1100px] space-y-4">
      <section className="glass-card rounded-[24px] p-4 sm:p-5">
        <div>
          <p className="section-label">Discipline AI Coach</p>
          <h2 className="mt-1 font-display text-xl font-semibold text-ink sm:text-2xl">
            Clean context before you ask
          </h2>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {[
            {
              label: "Workout Split",
              value: profile?.workout_preference || "Push / Pull / Legs",
              icon: Dumbbell,
            },
            {
              label: "Goal",
              value: profile?.goal || "fat loss",
              icon: Target,
            },
            {
              label: "Memory Summary",
              value: profile?.memory_summary || "No memory summary yet.",
              icon: Brain,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-[20px] border border-slate-200/80 bg-white/70 px-4 py-3 dark:border-slate-800/80 dark:bg-slate-950/45"
            >
              <div className="flex items-center gap-2.5 text-cyan-600 dark:text-cyan-300">
                <item.icon size={16} />
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
                  {item.label}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-ink">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[24px] border border-slate-700/80 bg-slate-900 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="section-label">Suggested Prompts</p>
            <p className="mt-1 text-sm text-muted">Tap one and send.</p>
          </div>
          <Flame size={16} className="text-orange-500" />
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {suggestedPrompts.map((idea) => (
            <button
              key={idea}
              onClick={() => setInput(idea)}
              className="shrink-0 rounded-full border border-slate-700/80 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-100 transition hover:border-cyan-400/50 hover:bg-slate-800"
            >
              {idea}
            </button>
          ))}
        </div>
      </section>

      <AIChat
        messages={messages}
        sending={sending}
        error={error}
        endRef={endRef}
        voiceFeedback={voiceFeedback}
        onToggleVoiceFeedback={() => setVoiceFeedback((current) => !current)}
        onClearChat={handleClearChat}
        input={input}
        onInputChange={setInput}
        onSubmit={handleSend}
        speechSupported={speechSupported}
        listening={listening}
        onToggleMic={toggleMic}
      />
    </div>
  );
}
