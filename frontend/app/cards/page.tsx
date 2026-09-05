"use client";
import React, { useState } from "react";
import { Shell } from "@/components/layout/shell";
import { useBanking } from "@/lib/banking-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { sounds } from "@/lib/audio";
import {
  CreditCard, Lock, Unlock, Eye, EyeOff, ShieldCheck,
  Sliders, Globe, Wifi, ShoppingCart, Zap, AlertCircle,
  Copy, Check,
} from "lucide-react";
import { FreezeCardModal } from "@/components/modals/FreezeCardModal";

export default function CardsPage() {
  const { cards, updateCardLimit, toggleFreezeCard } = useBanking();
  const [freezeModalOpen, setFreezeModalOpen] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  // Security channel toggles
  const [onlineEnabled, setOnlineEnabled] = useState(true);
  const [posEnabled, setPosEnabled] = useState(true);
  const [contactlessEnabled, setContactlessEnabled] = useState(true);
  const [internationalEnabled, setInternationalEnabled] = useState(false);

  const card = cards[0];

  const handleCopy = (text: string) => {
    sounds.click();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Shell
      title="Card Control Center"
      description="Manage titanium debit card, real-time daily spend limits, and channel security toggles"
      actions={
        <Button
          size="sm"
          onClick={() => {
            sounds.click();
            setFreezeModalOpen(true);
          }}
          className={`font-bold text-xs ${
            card.isFrozen
              ? "bg-emerald-500 hover:bg-emerald-400 text-obsidian-950"
              : "bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40"
          }`}
        >
          {card.isFrozen ? <Unlock className="h-3.5 w-3.5 mr-1.5" /> : <Lock className="h-3.5 w-3.5 mr-1.5" />}
          <span>{card.isFrozen ? "Unfreeze Card" : "Freeze Card"}</span>
        </Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Holographic Debit Card (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div
            className={`rounded-3xl p-6 sm:p-7 relative overflow-hidden transition-all duration-500 border shadow-2xl ${
              card.isFrozen
                ? "bg-slate-900 border-slate-700 opacity-60 grayscale"
                : "bg-gradient-to-br from-slate-900 via-obsidian-900 to-cyan-950/60 border-cyan-500/40 shadow-glow-cyan/20"
            }`}
          >
            {card.isFrozen && (
              <div className="absolute inset-0 z-20 bg-obsidian-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                <Lock className="h-8 w-8 text-rose-400 animate-bounce" />
                <span className="text-xs font-black text-rose-300 uppercase tracking-widest">
                  CARD IS CURRENTLY FROZEN
                </span>
              </div>
            )}

            <div className="relative z-10 space-y-8">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black tracking-widest text-cyan-400 font-mono">
                  FINSHIELD PLATINUM
                </span>
                <Wifi className="h-5 w-5 text-slate-400" />
              </div>

              <div className="space-y-1">
                <p className="text-lg sm:text-xl font-mono tracking-widest text-white font-bold">
                  {revealed ? "4532 8921 0048 4821" : card.maskedNumber}
                </p>
                <div className="flex items-center gap-4 text-xs font-mono text-slate-300">
                  <span>EXP: {card.expiry}</span>
                  <span>CVV: {revealed ? card.cvv : "•••"}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Cardholder</span>
                  <span className="text-xs font-bold text-white tracking-wider uppercase font-mono">
                    {card.cardholderName}
                  </span>
                </div>
                <span className="text-sm font-black italic tracking-tighter text-white font-serif">
                  VISA
                </span>
              </div>
            </div>
          </div>

          {/* Reveal Details & Copy Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                sounds.click();
                setRevealed(!revealed);
              }}
              className="flex-1 border-white/10 text-xs text-slate-300 gap-1.5"
            >
              {revealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              <span>{revealed ? "Hide Details" : "Reveal Credentials"}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy("4532892100484821")}
              className="border-white/10 text-xs text-slate-300 gap-1.5"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Copied" : "Copy No."}</span>
            </Button>
          </div>
        </div>

        {/* Right Column: Limits & Channel Security Controls (7 Cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-obsidian-900/90 border border-white/10 p-6 space-y-6">
          {/* Spend Limit Slider */}
          <div className="space-y-3 pb-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Sliders className="h-4 w-4 text-cyan-400" />
                Daily Spending Limit
              </span>
              <span className="text-lg font-black font-mono text-cyan-400">
                {formatCurrency(card.dailyLimit)} / day
              </span>
            </div>

            <input
              type="range"
              min={5000}
              max={200000}
              step={5000}
              value={card.dailyLimit}
              onChange={(e) => {
                updateCardLimit(card.id, parseInt(e.target.value, 10));
                sounds.tick();
              }}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
              <span>₹5,000</span>
              <span>₹2,00,000 (Max Limit)</span>
            </div>
          </div>

          {/* Security Channel Toggles */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Transaction Channel Security
            </h4>

            <div className="space-y-2">
              {[
                {
                  label: "Online / E-Commerce Transactions",
                  desc: "Amazon, Swiggy, Uber, and web payment gateways",
                  state: onlineEnabled,
                  toggle: () => setOnlineEnabled(!onlineEnabled),
                  icon: ShoppingCart,
                },
                {
                  label: "Point of Sale (POS / Swipe)",
                  desc: "Physical card machines in retail stores",
                  state: posEnabled,
                  toggle: () => setPosEnabled(!posEnabled),
                  icon: CreditCard,
                },
                {
                  label: "Contactless Tap & Pay (NFC)",
                  desc: "Pinless payments up to ₹5,000 per transaction",
                  state: contactlessEnabled,
                  toggle: () => setContactlessEnabled(!contactlessEnabled),
                  icon: Wifi,
                },
                {
                  label: "International Transactions",
                  desc: "Global foreign currency payments and travel POS",
                  state: internationalEnabled,
                  toggle: () => setInternationalEnabled(!internationalEnabled),
                  icon: Globe,
                },
              ].map((channel, i) => (
                <div
                  key={i}
                  onClick={() => {
                    sounds.tick();
                    channel.toggle();
                  }}
                  className="p-3.5 rounded-2xl bg-obsidian-950 border border-white/5 flex items-center justify-between cursor-pointer hover:border-white/20 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white/5 text-slate-300">
                      <channel.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{channel.label}</p>
                      <p className="text-[10px] text-muted-foreground">{channel.desc}</p>
                    </div>
                  </div>

                  <div
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                      channel.state ? "bg-cyan-500" : "bg-slate-700"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        channel.state ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <FreezeCardModal
        card={card}
        isOpen={freezeModalOpen}
        onClose={() => setFreezeModalOpen(false)}
      />
    </Shell>
  );
}
