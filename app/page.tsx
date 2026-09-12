"use client";

import React, { useState } from "react";
import AddAccountModal from "@/components/AddAccountModal";
import RiskCalculatorWidget from "../components/risk-calculator-widget";
import TradeFeed from "@/components/TradeFeed";

interface ClosedTrade {
  id: string;
  pair: string;
  type: "BUY" | "SELL";
  lots: number;
  entryPrice: number;
  closePrice: number;
  ruleRespected: boolean;
}

interface DailyTradeData {
  pnl: number;
}

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* En-tête avec le bouton pour connecter un compte */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">RuleDesk Dashboard</h1>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + Connecter un compte
          </button>
        </div>

        {/* Widgets et composants principaux */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RiskCalculatorWidget />
          <TradeFeed />
        </div>

        {/* La fenêtre modale de connexion de compte */}
        <AddAccountModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          onAccountAdded={() => {
            // Action après l'ajout réussi si besoin
            setIsModalOpen(false);
          }}
        />

      </div>
    </main>
  );
}