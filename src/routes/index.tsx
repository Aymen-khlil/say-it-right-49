import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import { Check, Copy, Loader2, RefreshCw, Scissors, Smile, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { writeMessage } from "@/lib/write.functions";

const STYLES = ["Professional", "Friendly", "Polite", "Short", "Casual"] as const;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "What Do I Say? — Phrase Awkward Messages Instantly" },
      {
        name: "description",
        content:
          "Describe the awkward message you need to send and get a polished, ready-to-send version in the tone you want.",
      },
      { property: "og:title", content: "What Do I Say? — Phrase Awkward Messages Instantly" },
      {
        property: "og:description",
        content:
          "Tell it what you want to say and get a clear, kind, ready-to-send message in seconds.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [situation, setSituation] = useState("");
  const [style, setStyle] = useState<string>("Professional");
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const write = useServerFn(writeMessage);

  const mutation = useMutation({
    mutationFn: (tweak: "none" | "shorter" | "friendlier" | "another") =>
      write({
        data: {
          situation,
          style,
          tweak,
          ...(tweak !== "none" && result ? { previous: result } : {}),
        },
      }),
    onSuccess: (data) => {
      setResult(data.message);
      setCopied(false);
      if (data.mocked) toast.info("Showing a demo draft — AI isn't configured yet.");
      requestAnimationFrame(() =>
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
    },
    onError: (error: Error) => toast.error(error.message || "Couldn't write that one. Try again."),
  });

  const generate = (tweak: "none" | "shorter" | "friendlier" | "another") => {
    if (!situation.trim()) {
      toast.error("Tell me what you want to say first.");
      return;
    }
    mutation.mutate(tweak);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy — select the text and copy manually.");
    }
  };

  const busy = mutation.isPending;

  return (
    <main className="min-h-screen bg-background px-5 py-14 sm:py-20">
      <Toaster />
      <div className="mx-auto w-full max-w-2xl">
        <header className="animate-rise text-center">
          <h1 className="text-4xl leading-tight font-semibold tracking-tight text-foreground sm:text-5xl">
            What Do I Say?
          </h1>
          <p className="mx-auto mt-4 max-w-md text-base text-muted-foreground sm:text-lg">
            Tell me what you want to say. I'll help you say it.
          </p>
        </header>

        <section className="animate-rise mt-10 rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-7">
          <label htmlFor="situation" className="sr-only">
            What do you need to say?
          </label>
          <Textarea
            id="situation"
            value={situation}
            onChange={(event) => setSituation(event.target.value)}
            placeholder="I need to tell my boss I can't come tomorrow."
            rows={5}
            className="resize-none rounded-2xl border-border bg-background text-base leading-relaxed shadow-none focus-visible:ring-2 focus-visible:ring-ring/40 sm:text-lg"
          />

          <div className="mt-6">
            <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              Style
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {STYLES.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setStyle(option)}
                  aria-pressed={style === option}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 active:scale-95",
                    style === option
                      ? "border-primary bg-primary text-primary-foreground shadow-soft"
                      : "border-border bg-secondary text-secondary-foreground hover:border-primary/40 hover:bg-accent",
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={() => generate("none")}
            disabled={busy}
            className="mt-7 h-14 w-full rounded-2xl text-base font-semibold shadow-lift transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0"
          >
            {busy ? (
              <>
                <Loader2 className="size-5 animate-spin" /> Writing…
              </>
            ) : (
              <>
                <Sparkles className="size-5" /> Write It For Me
              </>
            )}
          </Button>
        </section>

        {result ? (
          <section ref={resultRef} className="animate-rise mt-8" aria-live="polite">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Your message</h2>
            <div className="mt-3 rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-7">
              <p className="text-base leading-8 whitespace-pre-wrap text-card-foreground select-all sm:text-lg">
                {result}
              </p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Button
                onClick={copy}
                variant="secondary"
                className="h-12 rounded-2xl border border-border font-medium"
              >
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button
                onClick={() => generate("another")}
                disabled={busy}
                variant="secondary"
                className="h-12 rounded-2xl border border-border font-medium"
              >
                <RefreshCw className={cn("size-4", busy && "animate-spin")} /> Try another
              </Button>
              <Button
                onClick={() => generate("shorter")}
                disabled={busy}
                variant="secondary"
                className="h-12 rounded-2xl border border-border font-medium"
              >
                <Scissors className="size-4" /> Shorter
              </Button>
              <Button
                onClick={() => generate("friendlier")}
                disabled={busy}
                variant="secondary"
                className="h-12 rounded-2xl border border-border font-medium"
              >
                <Smile className="size-4" /> Friendlier
              </Button>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
