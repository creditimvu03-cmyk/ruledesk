"use client";

import React, { useState } from "react";
import RiskCalculatorWidget from "../components/risk-calculator-widget";
import TradeFeed from "@/components/TradeFeed";
interface ClosedTrade {
  id: string;
  pair: string;
  type: "BUY" | "SELL";
  lots: number;
  entryPrice: number;
  closePrice: number;
  pnl: number;
  status: "WIN" | "LOSS" | "BREAKEVEN";
  closeTime: string;
  beforeChartUrl: string;
  afterChartUrl: string;
  aiAnalysis: {
    score: number;
    feedback: string;
    ruleRespected: boolean;
  };
}

interface DailyTradeData {
  pnl: number;
  trades: ClosedTrade[];
}

function TradeCalendarWidget() {
  const [calendarData, setCalendarData] = useState<Record<string, DailyTradeData>>({
    "2026-09-11": {
      pnl: 140,
      trades: [
        {
          id: "T-1001",
          pair: "EURUSD",
          type: "BUY",
          lots: 0.5,
          entryPrice: 1.0850,
          closePrice: 1.0878,
          pnl: 140,
          status: "WIN",
          closeTime: "14:32",
          beforeChartUrl: "https://placehold.co/600x350/0f172a/10b981?text=EURUSD+-+AVANT+(Setup+AOI+4H)",
          afterChartUrl: "https://placehold.co/600x350/0f172a/10b981?text=EURUSD+-+APRES+(TP+Atteint)",
          aiAnalysis: {
            score: 95,
            feedback: "Excellente exécution ! Entrée propre sur la FVG après balayage de liquidité. RR respecté à 100%.",
            ruleRespected: true
          }
        }
      ]
    }
  });

  const [selectedDayTrades, setSelectedDayTrades] = useState<ClosedTrade[] | null>(
    calendarData["2026-09-11"]?.trades || null
  );
  const [selectedDateLabel, setSelectedDateLabel] = useState<string>("11 Septembre 2026");
  const [activeChartModal, setActiveChartModal] = useState<ClosedTrade | null>(null);

  const simulateIncomingBrokerTrade = () => {
    const todayKey = "2026-09-11";
    const isWin = Math.random() > 0.4;
    const pnlAmount = isWin ? Math.floor(Math.random() * 250) + 50 : -Math.floor(Math.random() * 150) - 30;
    const pairName = ["EURUSD", "GBPUSD", "XAUUSD"][Math.floor(Math.random() * 3)];

    const aiFeedbacksWin = [
      "Exécution parfaite ! Rejet net sur EMA 20 en concordance avec la structure 4H.",
      "Bonne prise de profit. Le ratio Risque/Rendement a été maintenu sans émotion.",
      "Achat fluide sur zone d'intérêt majeure. Discipline exemplaire."
    ];

    const aiFeedbacksLoss = [
      "Perte maîtrisée (1% du capital). Le Stop Loss a fait son travail sans dérapage.",
      "Entrée légèrement anticipée avant la confirmation 15m. Reste concentré pour la prochaine opportunité.",
      "Invalidation technique normale. Pas de revenge trading détecté, comportement très pro."
    ];

    const newTrade: ClosedTrade = {
      id: `T-${Math.floor(1000 + Math.random() * 9000)}`,
      pair: pairName,
      type: Math.random() > 0.5 ? "BUY" : "SELL",
      lots: 0.5,
      entryPrice: 1.0850,
      closePrice: isWin ? 1.0890 : 1.0820,
      pnl: pnlAmount,
      status: pnlAmount > 0 ? "WIN" : "LOSS",
      closeTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      beforeChartUrl: `https://placehold.co/600x350/0f172a/${pnlAmount > 0 ? '10b981' : 'f43f5e'}?text=${pairName}+-+AVANT+(Entry+Setup)`,
      afterChartUrl: `https://placehold.co/600x350/0f172a/${pnlAmount > 0 ? '10b981' : 'f43f5e'}?text=${pairName}+-+APRES+(${pnlAmount > 0 ? 'TP+Hit' : 'SL+Hit'})`,
      aiAnalysis: {
        score: pnlAmount > 0 ? Math.floor(Math.random() * 15) + 85 : Math.floor(Math.random() * 20) + 70,
        feedback: pnlAmount > 0 
          ? aiFeedbacksWin[Math.floor(Math.random() * aiFeedbacksWin.length)]
          : aiFeedbacksLoss[Math.floor(Math.random() * aiFeedbacksLoss.length)],
        ruleRespected: true
      }
    };

    setCalendarData((prev) => {
      const existingDay = prev[todayKey] || { pnl: 0, trades: [] };
      const updatedTrades = [newTrade, ...existingDay.trades];
      const updatedPnl = existingDay.pnl + newTrade.pnl;

      return {
        ...prev,
        [todayKey]: {
          pnl: updatedPnl,
          trades: updatedTrades
        }
      };
    });

    setSelectedDayTrades((prev) => (prev ? [newTrade, ...prev] : [newTrade]));
  };

  const daysInMonth = 30;
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl text-white space-y-6">
      {/* Entête & Statut Synchro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-emerald-400">Calendrier d'Exécution & Copilot IA</h2>
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <p className="text-xs text-slate-400">Synchronisation automatique + Debriefing IA en direct</p>
        </div>

        <button
          onClick={simulateIncomingBrokerTrade}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition border border-emerald-400/30 shadow-lg shadow-emerald-950"
        >
          ⚡ Simuler Clôture Trade + Debrief IA
        </button>
      </div>

      {/* Grille du Calendrier */}
      <div>
        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-semibold text-slate-500 uppercase">
          <div>Lun</div><div>Mar</div><div>Mer</div><div>Jeu</div><div>Ven</div><div>Sam</div><div>Dim</div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => {
            const formattedDate = `2026-09-${day < 10 ? `0${day}` : day}`;
            const dayData = calendarData[formattedDate];

            let bgClass = "bg-slate-950/40 border-slate-800/80 text-slate-500";
            let statusText = null;

            if (dayData && dayData.trades.length > 0) {
              if (dayData.pnl > 0) {
                bgClass = "bg-emerald-950/40 border-emerald-500/60 text-emerald-400";
                statusText = `WIN (+$${dayData.pnl})`;
              } else if (dayData.pnl < 0) {
                bgClass = "bg-rose-950/40 border-rose-500/60 text-rose-400";
                statusText = `LOST (-$${Math.abs(dayData.pnl)})`;
              } else {
                bgClass = "bg-slate-800 border-slate-600 text-slate-300";
                statusText = "EVEN ($0)";
              }
            }

            return (
              <div
                key={day}
                onClick={() => {
                  if (dayData) {
                    setSelectedDayTrades(dayData.trades);
                    setSelectedDateLabel(`${day} Septembre 2026`);
                  }
                }}
                className={`h-16 border rounded-lg p-1.5 flex flex-col justify-between transition-all cursor-pointer hover:border-slate-400 ${bgClass}`}
              >
                <span className="text-xs font-bold">{day}</span>
                {statusText && (
                  <span className="text-[10px] font-extrabold tracking-tight truncate">
                    {statusText}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Détails du jour & Feedback IA */}
      <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-4">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center justify-between">
          <span>📊 Positions clôturées : <span className="text-emerald-400">{selectedDateLabel}</span></span>
        </h3>

        {selectedDayTrades && selectedDayTrades.length > 0 ? (
          <div className="space-y-4">
            {selectedDayTrades.map((trade) => (
              <div
                key={trade.id}
                className="bg-slate-900 border border-slate-800/80 p-4 rounded-lg text-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                        trade.status === "WIN"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                          : "bg-rose-950 text-rose-400 border border-rose-800"
                      }`}
                    >
                      {trade.status}
                    </span>
                    <div>
                      <p className="font-bold text-white text-sm">
                        {trade.pair} ({trade.type}) - {trade.lots} Lot(s)
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Entrée : {trade.entryPrice} | Sortie : {trade.closePrice} | Heure : {trade.closeTime}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-4">
                    <div>
                      <p className={`font-bold text-base ${trade.pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {trade.pnl >= 0 ? `+$${trade.pnl}` : `-$${Math.abs(trade.pnl)}`}
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveChartModal(trade)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] px-3 py-1.5 rounded border border-slate-700 transition"
                    >
                      🖼️ Graphiques (Avant/Après)
                    </button>
                  </div>
                </div>

                {/* Encadré AI Copilot Debriefing */}
                <div className="bg-slate-950/80 border border-emerald-500/20 rounded-lg p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-emerald-400 font-bold text-xs">🤖 RuleDesk Copilot AI</span>
                      <span className="bg-emerald-950 text-emerald-400 text-[9px] font-bold px-1.5 py-0.5 rounded border border-emerald-800">
                        Score Discipline : {trade.aiAnalysis.score}/100
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-semibold">
                      ✓ Plan de Risque Respecté
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed italic">
                    "{trade.aiAnalysis.feedback}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">Aucune position enregistrée pour cette journée.</p>
        )}
      </div>

      {/* Modal comparatif des Graphiques AVANT / APRÈS */}
      {activeChartModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-4xl w-full p-6 space-y-6 text-white shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-emerald-400">
                  Analyse Visuelle Automatique : {activeChartModal.pair} ({activeChartModal.type})
                </h3>
                <p className="text-xs text-slate-400">
                  Captures générées automatiquement par le système zéro-saisie.
                </p>
              </div>
              <button
                onClick={() => setActiveChartModal(null)}
                className="text-slate-400 hover:text-white text-sm font-bold bg-slate-800 px-3 py-1 rounded-lg"
              >
                ✕ Fermer
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block">
                  1. Graphique AVANT (Prise de position)
                </span>
                <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950">
                  <img src={activeChartModal.beforeChartUrl} alt="Graphique Avant Trade" className="w-full h-auto object-cover" />
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">
                  2. Graphique APRÈS (Clôture / Résultat)
                </span>
                <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950">
                  <img src={activeChartModal.afterChartUrl} alt="Graphique Après Trade" className="w-full h-auto object-cover" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <main className="p-8">
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RiskCalculatorWidget />
        <TradeCalendarWidget />
        <TradeFeed />
      </section>
    </main>
  );
}