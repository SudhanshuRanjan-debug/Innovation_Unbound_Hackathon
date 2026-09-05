"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { sounds } from "@/lib/audio";
import { api } from "@/lib/api";
import {
  Brain, Sparkles, CheckCircle2, ArrowRight,
  X, RefreshCw, Bot, Terminal,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  contextType?: string;
  contextData?: Record<string, unknown>;
}

export function AIExplanationModal({
  isOpen,
  onClose,
  contextType = "risk_score",
  contextData = { risk_score: 63.5 },
}: Props) {
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setDisplayedText("");
      return;
    }

    setLoading(true);
    api.getAIExplanation(contextType, contextData).then((res) => {
      setText(res.explanation);
      setLoading(false);
    });
  }, [isOpen, contextType, contextData]);

  // Typewriter streaming effect
  useEffect(() => {
    if (!text || loading) return;
    let index = 0;
    setDisplayedText("");

    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText((prev) => prev + text.charAt(index));
        if (index % 12 === 0) sounds.tick(700);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 15);

    return () => clearInterval(interval);
  }, [text, loading]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative max-w-2xl w-full"
        >
          <Card className="glass-panel-glow border-cyan-500/40 shadow-2xl overflow-hidden">
            <CardHeader className="p-5 border-b border-white/10 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
                  <Brain className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                    FinShield Neural AI Reasoning
                    <Badge variant="info" className="text-[10px]">Gemini / ML Core</Badge>
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Step-by-step causal diagnostic explaining your financial telemetry
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  sounds.click();
                  onClose();
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </CardHeader>

            <CardContent className="p-6 space-y-4 font-mono text-sm text-slate-200">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <RefreshCw className="h-6 w-6 text-cyan-400 animate-spin" />
                  <p className="text-xs text-cyan-300">Synthesizing causal financial reasoning...</p>
                </div>
              ) : (
                <div className="bg-obsidian-900/90 p-4 rounded-xl border border-cyan-500/20 whitespace-pre-line leading-relaxed text-xs sm:text-sm text-cyan-100/90 max-h-[380px] overflow-y-auto">
                  {displayedText}
                  {displayedText.length < text.length && (
                    <span className="inline-block w-2 h-4 bg-cyan-400 ml-1 animate-pulse" />
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Terminal className="h-3.5 w-3.5 text-cyan-400" />
                  Grounded in authoritative financial engine scores
                </span>

                <Button
                  size="sm"
                  onClick={() => {
                    sounds.click();
                    onClose();
                  }}
                  className="bg-cyan-500 hover:bg-cyan-400 text-obsidian-950 font-bold text-xs"
                >
                  Understood
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
