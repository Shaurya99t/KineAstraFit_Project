import { motion } from "framer-motion";
import { Eraser, LoaderCircle, Mic, MicOff, Volume2 } from "lucide-react";

export default function AIChat({
  messages,
  sending,
  error,
  endRef,
  voiceFeedback,
  onToggleVoiceFeedback,
  onClearChat,
  input,
  onInputChange,
  onSubmit,
  speechSupported,
  listening,
  onToggleMic,
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card flex min-h-[62vh] flex-col overflow-hidden rounded-[30px]"
    >
      <div className="flex flex-col gap-3 border-b border-slate-200/70 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 dark:border-slate-800/80">
        <div>
          <p className="section-label">AI Coach</p>
          <p className="mt-1 text-sm text-muted">
            Ask for today&apos;s plan, calories, or a recovery call.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onToggleVoiceFeedback}
            className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition ${
              voiceFeedback
                ? "border-cyan-400/50 bg-cyan-500/12 text-cyan-700 dark:text-cyan-100"
                : "border-slate-200/80 bg-white/70 text-slate-700 hover:bg-white dark:border-slate-700/80 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            <Volume2 size={16} />
            Voice
          </button>
          <button
            onClick={onClearChat}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-white dark:border-slate-700/80 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Eraser size={16} />
            Clear
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-3 py-4 sm:px-5">
        {messages.map((message, index) => (
          <motion.div
            key={`${message.role}-${index}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={[
                "max-w-[92%] rounded-[22px] px-3.5 py-3 text-sm leading-6 shadow-sm sm:max-w-[80%]",
                message.role === "user"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                  : "bg-[#0f172a] text-white border border-white/10",
              ].join(" ")}
            >
              <div className="mb-1 text-[10px] uppercase tracking-[0.22em] opacity-60">
                {message.role === "user" ? "You" : "Coach"}
              </div>
              <div className="whitespace-pre-wrap">{message.content}</div>
            </div>
          </motion.div>
        ))}

        {sending ? (
          <div className="flex justify-start">
            <div className="inline-flex items-center gap-2 rounded-[18px] border border-slate-200/80 bg-slate-50/95 px-3.5 py-3 text-sm text-muted dark:border-slate-800/80 dark:bg-slate-950/70">
              <LoaderCircle size={16} className="animate-spin" />
              Coach is thinking...
            </div>
          </div>
        ) : null}

        <div ref={endRef} />
      </div>

      <div className="sticky bottom-0 border-t border-slate-200/70 bg-slate-950 p-3 dark:border-slate-800/80">
        {error ? (
          <div className="mb-3 rounded-2xl border border-rose-300/50 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/25 dark:text-rose-200">
            {error}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <textarea
            rows={2}
            value={input}
            onChange={(event) => onInputChange(event.target.value)}
            placeholder="Ask for today's workout, calories, protein, or a missed-session fix..."
            className="min-h-[72px] flex-1 resize-none rounded-[22px] border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-cyan-500/60 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
          />

          <div className="flex gap-2 sm:gap-3">
            {speechSupported ? (
              <button
                type="button"
                onClick={onToggleMic}
                className={`inline-flex h-12 min-w-12 items-center justify-center rounded-[18px] px-4 ${
                  listening
                    ? "bg-rose-500 text-white"
                    : "border border-slate-200/80 bg-white text-slate-700 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-200"
                }`}
              >
                {listening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
            ) : null}

            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="inline-flex h-12 flex-1 items-center justify-center rounded-[18px] bg-slate-900 px-6 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400 sm:flex-none"
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        </form>
      </div>
    </motion.section>
  );
}
