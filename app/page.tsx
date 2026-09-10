// @ts-nocheck
'use client';

import { useState, useEffect } from 'react'

export default function Dashboard() {
  const userProfile = {
    name: 'Kyllan',
    email: 'creditimvu03@gmail.com'
  }

  // Initialisation des comptes depuis le localStorage ou avec des données par défaut
  const [accounts, setAccounts] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ruledesk_accounts')
      if (saved) {
        try { return JSON.parse(saved) } catch (e) { console.error(e) }
      }
    }
    return [
      {
        id: '1',
        firm_name: 'goat funded trader',
        account_type: 'Prop Firm',
        account_size: 5000,
        current_balance: 4850,
        daily_drawdown_current: 80,
        daily_drawdown_limit: 250,
        max_drawdown_limit: 500,
        account_status: 'Actif'
      },
      {
        id: '2',
        firm_name: 'Exness (Broker)',
        account_type: 'Broker Personnel',
        account_size: 2000,
        current_balance: 2150,
        daily_drawdown_current: 0,
        daily_drawdown_limit: 0,
        max_drawdown_limit: 0,
        account_status: 'Actif'
      }
    ]
  })

  // Initialisation des trades et sessions de replay
  const [trades, setTrades] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ruledesk_trades')
      if (saved) {
        try { return JSON.parse(saved) } catch (e) { console.error(e) }
      }
    }
    return [
      {
        id: '101',
        pair: 'EURUSD',
        type: 'Achat',
        strategy: 'Swing 4H (20 EMA)',
        session: 'New York',
        resultUSD: -80,
        status: 'Perte',
        errorAnalyzed: 'Entrée en dehors d’une Zone d’Intérêt (AOI) 4H. Absence de rejet sur la zone des 20 EMA.',
        detectedPattern: '⚠️ Pattern Piège : Entrée impulsive hors AOI',
        score: 4,
        imageUrl: null
      },
      {
        id: '102',
        pair: 'GBPUSD',
        type: 'Vente',
        strategy: 'Hybrid Swing AOI',
        session: 'Londres',
        resultUSD: 160,
        status: 'Gain',
        errorAnalyzed: 'Respect parfait des règles de structure et prise de profit sur le niveau clé.',
        detectedPattern: '🎯 Pattern Gagnant : Rejet propre sur Zone d’Intérêt',
        score: 9,
        imageUrl: null
      }
    ]
  })

  // Sauvegarde automatique dans le localStorage
  useEffect(() => {
    localStorage.setItem('ruledesk_accounts', JSON.stringify(accounts))
  }, [accounts])

  useEffect(() => {
    localStorage.setItem('ruledesk_trades', JSON.stringify(trades))
  }, [trades])

  // États pour les modales
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false)
  const [isReplayModalOpen, setIsReplayModalOpen] = useState(false)

  const [newFirm, setNewFirm] = useState('')
  const [newAccountType, setNewAccountType] = useState('Prop Firm')
  const [newSize, setNewSize] = useState('')

  const [tradePair, setTradePair] = useState('')
  const [tradeStrategy, setTradeStrategy] = useState('Swing 4H (20 EMA)')
  const [tradeSession, setTradeSession] = useState('Londres')
  const [tradeType, setTradeType] = useState('Achat')
  const [tradeResultUSD, setTradeResultUSD] = useState('')
  const [tradeReason, setTradeReason] = useState('')
  const [tradeImage, setTradeImage] = useState<string | null>(null)

  const [aiReport, setAiReport] = useState<string | null>(null)
  const [csvContent, setCsvContent] = useState('')

  // États du module de Replay en temps réel
  const [replayPair, setReplayPair] = useState('EURUSD')
  const [replayStep, setReplayStep] = useState(1)
  const [replayPrice, setReplayPrice] = useState(1.0850)
  const [replayLog, setReplayLog] = useState<string[]>([
    'Initialisation de la session de replay 4H...',
    'Chargement de la structure de prix et des zones d’intérêt (AOI)...'
  ])
  const [replayPosition, setReplayPosition] = useState<'Aucune' | 'Achat' | 'Vente'>('Aucune')
  const [replayEntryPrice, setReplayEntryPrice] = useState<number | null>(null)

  // Calcul du score de discipline
  const calculateDisciplineScore = () => {
    let score = 100
    accounts.forEach((acc: any) => {
      if (acc.account_type === 'Prop Firm') {
        const totalLoss = acc.account_size - acc.current_balance
        const totalLossPercent = (totalLoss / acc.account_size) * 100
        if (totalLossPercent > 2) score -= 20
        if (totalLossPercent > 5) score -= 30
        if (acc.daily_drawdown_limit > 0 && acc.daily_drawdown_current >= acc.daily_drawdown_limit * 0.8) {
          score -= 25
        }
      }
    })
    return Math.max(score, 0)
  }

  const disciplineScore = calculateDisciplineScore()

  // Détection automatique des patterns
  const detectPatternFromInput = (reason: string, result: number, session: string) => {
    const lower = reason.toLowerCase()
    if (result >= 0) {
      if (lower.includes('ema') || lower.includes('moyenne mobile')) {
        return '🎯 Pattern Gagnant : Validation 20 EMA / Tendance'
      }
      if (lower.includes('zone') || lower.includes('aoi') || lower.includes('rejet')) {
        return '🎯 Pattern Gagnant : Rejet propre sur Zone d’Intérêt'
      }
      return `🎯 Pattern Gagnant : Exécution solide (${session})`
    } else {
      if (lower.includes('hors') || lower.includes('dehors') || lower.includes('hâtive') || lower.includes('impulsiv')) {
        return '⚠️ Pattern Piège : Entrée impulsive hors AOI'
      }
      if (lower.includes('news') || lower.includes('calendrier') || lower.includes('volatilité')) {
        return '⚠️ Pattern Risque : Prise de position en période de News'
      }
      return '⚠️ Pattern Erreur : Sortie de plan de trading'
    }
  }

  // Gestion de l'upload d'image
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setTradeImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Fonctions de Replay en temps réel
  const handleNextCandle = () => {
    const randomVariation = (Math.random() - 0.48) * 0.0020
    const newP = Number((replayPrice + randomVariation).toFixed(4))
    setReplayPrice(newP)
    setReplayStep(prev => prev + 1)
    setReplayLog(prev => [
      `[Bougie 4H #${replayStep + 1}] Prix actuel : ${newP} — Test de la zone d'intérêt en cours.`,
      ...prev.slice(0, 5)
    ])
  }

  const handleOpenReplayTrade = (type: 'Achat' | 'Vente') => {
    setReplayPosition(type)
    setReplayEntryPrice(replayPrice)
    setReplayLog(prev => [
      `🚀 [REPLAY] Ordre ${type} exécuté au prix de ${replayPrice}`,
      ...prev.slice(0, 5)
    ])
  }

  const handleCloseReplayTrade = () => {
    if (replayPosition === 'Aucune' || replayEntryPrice === null) return
    const diff = replayPrice - replayEntryPrice
    const pnl = replayPosition === 'Achat' ? Math.round(diff * 10000) : Math.round(-diff * 10000)
    
    // Ajout automatique au journal des trades
    const simulatedTrade = {
      id: `replay-${Date.now()}`,
      pair: replayPair,
      type: replayPosition,
      strategy: 'Replay Test 4H',
      session: 'Session Replay',
      resultUSD: pnl,
      status: pnl >= 0 ? 'Gain' : 'Perte',
      errorAnalyzed: `Backtest Replay en temps réel sur ${replayPair}. Entrée: ${replayEntryPrice} -> Sortie: ${replayPrice}`,
      detectedPattern: pnl >= 0 ? '🎯 Pattern Gagnant : Replay validé' : '⚠️ Pattern Piège : Replay en perte',
      score: pnl >= 0 ? 8 : 4,
      imageUrl: null
    }

    setTrades([simulatedTrade, ...trades])
    setReplayLog(prev => [
      `🏁 [REPLAY] Position fermée. Résultat PnL : ${pnl}$`,
      ...prev.slice(0, 5)
    ])
    setReplayPosition('Aucune')
    setReplayEntryPrice(null)
    alert(`Position fermée avec succès ! Résultat : ${pnl}$ enregistré dans ton journal.`)
  }

  // Importation CSV
  const handleCsvImport = (e: React.FormEvent) => {
    e.preventDefault()
    if (!csvContent) return

    const lines = csvContent.split('\n')
    const importedTrades: any[] = []

    lines.forEach((line, index) => {
      const parts = line.split(',')
      if (parts.length >= 2) {
        const pair = parts[0].trim().toUpperCase()
        const pnl = Number(parts[1].trim())
        const reason = parts[2] ? parts[2].trim() : 'Import CSV automatique'
        if (!isNaN(pnl)) {
          importedTrades.push({
            id: `csv-${Date.now()}-${index}`,
            pair: pair || 'EURUSD',
            type: pnl >= 0 ? 'Achat' : 'Vente',
            strategy: 'Swing 4H (20 EMA)',
            session: 'Londres',
            resultUSD: pnl,
            status: pnl >= 0 ? 'Gain' : 'Perte',
            errorAnalyzed: reason,
            detectedPattern: detectPatternFromInput(reason, pnl, 'Londres'),
            score: pnl >= 0 ? 8 : 4,
            imageUrl: null
          })
        }
      }
    })

    if (importedTrades.length > 0) {
      setTrades([...importedTrades, ...trades])
      setCsvContent('')
      setIsCsvModalOpen(false)
      alert(`${importedTrades.length} trade(s) importé(s) avec succès !`)
    } else {
      alert('Format CSV invalide. Utilisez : Paire, PnL, Commentaire')
    }
  }

  // Statistiques des stratégies
  const strategyStats = trades.reduce((acc: any, trade: any) => {
    if (!acc[trade.strategy]) {
      acc[trade.strategy] = { name: trade.strategy, totalTrades: 0, wins: 0, totalPnL: 0 }
    }
    acc[trade.strategy].totalTrades += 1
    if (trade.status === 'Gain') acc[trade.strategy].wins += 1
    acc[trade.strategy].totalPnL += trade.resultUSD
    return acc
  }, {})

  const strategyComparisonList = Object.values(strategyStats).map((s: any) => ({
    ...s,
    winRate: s.totalTrades > 0 ? Math.round((s.wins / s.totalTrades) * 100) : 0
  }))

  const getPersonalizedImprovementPlan = () => {
    const trapCount = trades.filter((t: any) => t.detectedPattern.includes('Piège') || t.detectedPattern.includes('Risque')).length
    if (disciplineScore < 70 || trapCount > 1) {
      return [
        { step: '01', title: 'Verrouillage de la Watchlist', desc: 'Restreindre strictement l’analyse aux 15 paires de devises validées.' },
        { step: '02', title: 'Validation AOI 4H Obligatoire', desc: 'Ne placer aucun ordre sans rejet net sur zone d’intérêt ou moyenne mobile.' },
        { step: '03', title: 'Pause Drawdown Journalier', desc: 'Fermer les plateformes dès que 50% de la limite journalière prop firm est atteinte.' }
      ]
    }
    return [
      { step: '01', title: 'Maintien des Setups Gagnants', desc: 'Poursuivre l’exploitation des configurations sur les sessions de Londres et New York.' },
      { step: '02', title: 'Optimisation du Ratio Risque/Rendement', desc: 'Sécuriser les profits partiels dès le premier niveau de structure majeur.' },
      { step: '03', title: 'Scale-up Progressif des Lots', desc: 'Conserver la discipline actuelle avant d’envisager une augmentation d’exposition.' }
    ]
  }

  const improvementPlan = getPersonalizedImprovementPlan()

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFirm || !newSize) return

    const sizeNum = Number(newSize)
    const newAccount = {
      id: Date.now().toString(),
      firm_name: newFirm,
      account_type: newAccountType,
      account_size: sizeNum,
      current_balance: sizeNum,
      daily_drawdown_current: 0,
      daily_drawdown_limit: newAccountType === 'Prop Firm' ? sizeNum * 0.05 : 0,
      max_drawdown_limit: newAccountType === 'Prop Firm' ? sizeNum * 0.10 : 0,
      account_status: 'Actif'
    }

    setAccounts([newAccount, ...accounts])
    setNewFirm('')
    setNewSize('')
    setIsModalOpen(false)
  }

  const handleAddTradeAnalysis = (e: React.FormEvent) => {
    e.preventDefault()
    if (!tradePair || !tradeReason || !tradeResultUSD) return

    const resNum = Number(tradeResultUSD)
    const status = resNum >= 0 ? 'Gain' : 'Perte'
    const detected = detectPatternFromInput(tradeReason, resNum, tradeSession)

    const newAnalyzedTrade = {
      id: Date.now().toString(),
      pair: tradePair.toUpperCase(),
      type: tradeType,
      strategy: tradeStrategy,
      session: tradeSession,
      resultUSD: resNum,
      status: status,
      errorAnalyzed: tradeReason,
      detectedPattern: detected,
      score: resNum >= 0 ? 8 : 4,
      imageUrl: tradeImage
    }

    setTrades([newAnalyzedTrade, ...trades])
    setTradePair('')
    setTradeResultUSD('')
    setTradeReason('')
    setTradeImage(null)
    setIsTradeModalOpen(false)
  }

  const generateWeeklyReport = () => {
    const winningPatternsCount = trades.filter((t: any) => t.detectedPattern.includes('Gagnant')).length
    const trapPatternsCount = trades.filter((t: any) => t.detectedPattern.includes('Piège') || t.detectedPattern.includes('Risque')).length

    const report = `📊 RAPPORT GLOBAL RULEDESK (${userProfile.name})\n• Score de discipline : ${disciplineScore}/100\n• Patterns Gagnants : ${winningPatternsCount} | Pièges : ${trapPatternsCount}\n• Plan d'action : Suivre rigoureusement les 3 étapes du plan d'amélioration personnalisé.`
    setAiReport(report)
    setIsReportModalOpen(true)
  }

  const getAICoachAdvice = () => {
    if (disciplineScore < 70) {
      return `⚠️ Alerte Globale pour ${userProfile.name} : Le plan d'amélioration requiert une attention immédiate sur la gestion des risques.`
    }
    return `🟢 Performance alignée, ${userProfile.name} : Le plan d'amélioration valide une progression constante de la maîtrise émotionnelle.`
  }

  return (
    <main className="p-8 bg-slate-950 text-slate-100 min-h-screen font-sans relative">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">RuleDesk <span className="text-emerald-500 text-sm font-normal">/ AI Trading Copilot</span></h1>
            <p className="text-xs text-slate-400 mt-0.5">Trader : <span className="text-white font-medium">{userProfile.name}</span> ({userProfile.email})</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setIsReplayModalOpen(true)}
              className="bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-500/40 px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1"
            >
              <span>⚡ Replay Backtest</span>
            </button>
            <button 
              onClick={() => setIsCsvModalOpen(true)}
              className="bg-slate-800 hover:bg-slate-700 text-sky-400 border border-sky-500/30 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
            >
              📥 Importer CSV
            </button>
            <button 
              onClick={generateWeeklyReport}
              className="bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
            >
              🤖 Rapport IA Hebdo
            </button>
            <button 
              onClick={() => setIsTradeModalOpen(true)}
              className="bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
            >
              🧠 Analyser un trade
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors"
            >
              + Compte
            </button>
          </div>
        </header>

        {/* Panneau Score & IA */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Score de Discipline</span>
            <div className="flex items-baseline space-x-2 my-2">
              <span className={`text-3xl font-extrabold ${disciplineScore >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {disciplineScore}/100
              </span>
            </div>
            <span className="text-xs text-slate-400">Évaluation globale des risques</span>
          </div>

          <div className="md:col-span-3 bg-gradient-to-r from-emerald-950/30 via-slate-900 to-slate-900 border border-emerald-500/20 p-5 rounded-2xl shadow-xl flex items-start space-x-4">
            <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 text-emerald-400 font-bold text-lg">
              AI
            </div>
            <div>
              <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-1">RuleDesk AI Copilot</h2>
              <p className="text-sm text-slate-300 leading-relaxed">{getAICoachAdvice()}</p>
            </div>
          </div>
        </div>

        {/* Plan d'Amélioration Personnalisé */}
        <div className="bg-slate-900 border border-emerald-500/30 p-6 rounded-2xl shadow-xl mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-emerald-500/10 text-emerald-400 text-[10px] px-3 py-1 rounded-bl-xl font-semibold border-l border-b border-emerald-500/20">
            Généré pour {userProfile.name}
          </div>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
            <span>📈 Plan d’Amélioration Personnalisé</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {improvementPlan.map((step, idx) => (
              <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/20">
                    Étape {step.step}
                  </span>
                  <h3 className="font-bold text-sm text-white">{step.title}</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Comptes & Drawdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {accounts.map((acc: any) => {
            const PnL = acc.current_balance - acc.account_size
            const PnLPercent = ((PnL / acc.account_size) * 100).toFixed(2)
            const isNegative = PnL < 0

            return (
              <div key={acc.id} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-1 ${isNegative ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-white uppercase">{acc.firm_name}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${acc.account_type === 'Prop Firm' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-sky-500/10 text-sky-400 border-sky-500/20'}`}>
                    {acc.account_type}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs text-slate-500">Statut :</span>
                  <span className="text-xs text-emerald-400">{acc.account_status}</span>
                </div>
                
                <div className="space-y-3 text-sm text-slate-300 mb-4">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Capital initial :</span>
                    <span className="font-semibold text-white">${Number(acc.account_size).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Solde actuel :</span>
                    <span className="font-semibold text-white">${Number(acc.current_balance).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-800">
                    <span className="text-slate-500">PnL Global :</span>
                    <span className={`font-semibold ${isNegative ? 'text-red-400' : 'text-emerald-400'}`}>
                      {PnL >= 0 ? `+${PnL}` : PnL} $ ({PnLPercent}%)
                    </span>
                  </div>
                </div>

                {acc.account_type === 'Prop Firm' && (
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-2 text-xs">
                    <div className="text-slate-400 font-semibold uppercase tracking-wider mb-1 text-[10px]">📉 Analyse Drawdown Prop Firm</div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Drawdown Journalier :</span>
                      <span className="text-amber-400 font-medium">${acc.daily_drawdown_current} / ${acc.daily_drawdown_limit} max</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-amber-500 h-full rounded-full" 
                        style={{ width: `${Math.min((acc.daily_drawdown_current / acc.daily_drawdown_limit) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-500">Max Drawdown Global :</span>
                      <span className="text-red-400 font-medium">${Math.abs(Math.min(PnL, 0))} / ${acc.max_drawdown_limit} max</span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Comparaison Stratégies & Journal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="lg:col-span-1 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
            <h2 className="text-lg font-bold text-white mb-4">📈 Comparaison Stratégies</h2>
            <div className="space-y-3">
              {strategyComparisonList.map((strat: any, idx: number) => (
                <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center text-sm">
                  <div>
                    <div className="font-bold text-slate-200">{strat.name}</div>
                    <div className="text-xs text-slate-500">{strat.totalTrades} trade(s) • Winrate : {strat.winRate}%</div>
                  </div>
                  <div className={`font-semibold text-sm ${strat.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {strat.totalPnL >= 0 ? `+${strat.totalPnL}` : strat.totalPnL}$
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
              <span>🔍 Journal & Screenshots Graphiques</span>
              <span className="text-xs text-slate-400 font-normal">IA & Comportement</span>
            </h2>
            <div className="space-y-4">
              {trades.map((t: any) => {
                const isWinningPattern = t.detectedPattern.includes('Gagnant')
                return (
                  <div key={t.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-3">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="font-bold text-emerald-400">{t.pair}</span>
                        <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-300">{t.strategy}</span>
                        <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded">{t.session}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${t.resultUSD >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                          {t.resultUSD >= 0 ? `+${t.resultUSD}$` : `${t.resultUSD}$`}
                        </span>
                      </div>
                      <div className={`text-xs px-2.5 py-1 rounded-lg border font-semibold ${isWinningPattern ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                        {t.detectedPattern}
                      </div>
                    </div>
                    
                    <p className="text-sm text-slate-300 border-t border-slate-900 pt-2">{t.errorAnalyzed}</p>

                    {t.imageUrl && (
                      <div className="mt-2 pt-2 border-t border-slate-900">
                        <span className="text-[10px] uppercase text-slate-500 font-semibold block mb-1">Capture Graphique associée :</span>
                        <img src={t.imageUrl} alt="Setup graphique trade" className="rounded-lg max-h-40 border border-slate-800 object-cover" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Modale Replay Backtest en temps réel */}
      {isReplayModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-emerald-500/30 p-6 rounded-2xl w-full max-w-2xl shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>⚡ Replay Backtest en Temps Réel</span>
              </h2>
              <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                Mode Swing 4H / AOI
              </span>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Paire de la Watchlist</label>
                  <select 
                    value={replayPair} 
                    onChange={(e) => setReplayPair(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-white text-xs"
                  >
                    <option>EURUSD</option>
                    <option>GBPUSD</option>
                    <option>USDJPY</option>
                    <option>XAUUSD</option>
                    <option>AUDUSD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Étape / Bougie 4H</label>
                  <div className="text-emerald-400 font-bold text-sm pt-1">#{replayStep}</div>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Prix Actuel Simulée</label>
                  <div className="text-white font-mono font-bold text-sm pt-1">{replayPrice}</div>
                </div>
              </div>

              {/* Contrôles du Replay */}
              <div className="flex flex-wrap gap-2 justify-between items-center bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="flex space-x-2">
                  <button 
                    onClick={handleNextCandle}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-lg text-xs font-semibold transition-colors shadow-lg"
                  >
                    ▶ Avancer Bougie 4H (+1)
                  </button>
                </div>
                <div className="flex space-x-2">
                  {replayPosition === 'Aucune' ? (
                    <>
                      <button 
                        onClick={() => handleOpenReplayTrade('Achat')}
                        className="bg-sky-600/20 text-sky-400 border border-sky-500/30 hover:bg-sky-600/30 px-3 py-1.5 rounded-lg text-xs font-medium"
                      >
                        📈 Entrer Achat (Buy)
                      </button>
                      <button 
                        onClick={() => handleOpenReplayTrade('Vente')}
                        className="bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600/30 px-3 py-1.5 rounded-lg text-xs font-medium"
                      >
                        📉 Entrer Vente (Sell)
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={handleCloseReplayTrade}
                      className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold animate-pulse"
                    >
                      🛑 Clôturer la Position ({replayPosition} @ {replayEntryPrice})
                    </button>
                  )}
                </div>
              </div>

              {/* Console des Logs en direct */}
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-medium">Journal d'exécution du Replay :</label>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 h-28 overflow-y-auto font-mono text-[11px] text-slate-300 space-y-1">
                  {replayLog.map((log, idx) => (
                    <div key={idx} className="border-b border-slate-900/50 pb-0.5">{log}</div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 mt-2 border-t border-slate-800">
              <button 
                onClick={() => setIsReplayModalOpen(false)}
                className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors"
              >
                Fermer le Replay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modales classiques */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-4">Ajouter un compte de trading</h2>
            <form onSubmit={handleAddAccount} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Type de compte</label>
                <select 
                  value={newAccountType}
                  onChange={(e) => setNewAccountType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                >
                  <option value="Prop Firm">Prop Firm (Challenge / Financé)</option>
                  <option value="Broker Personnel">Broker Personnel (Exness, XM, etc.)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Nom (Prop Firm ou Broker)</label>
                <input 
                  type="text" 
                  value={newFirm}
                  onChange={(e) => setNewFirm(e.target.value)}
                  placeholder="Ex: Goat Funded Trader / Exness"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Taille du capital / Dépôt ($)</label>
                <input 
                  type="number" 
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  placeholder="Ex: 5000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors">Annuler</button>
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isTradeModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-white mb-4">🧠 Analyser un trade + Screenshot</h2>
            <form onSubmit={handleAddTradeAnalysis} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Actif / Paire</label>
                  <input 
                    type="text" 
                    value={tradePair}
                    onChange={(e) => setTradePair(e.target.value)}
                    placeholder="Ex: EURUSD"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Résultat ($)</label>
                  <input 
                    type="number" 
                    value={tradeResultUSD}
                    onChange={(e) => setTradeResultUSD(e.target.value)}
                    placeholder="Ex: -80 ou 150"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Stratégie</label>
                  <select 
                    value={tradeStrategy}
                    onChange={(e) => setTradeStrategy(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option>Swing 4H (20 EMA)</option>
                    <option>Hybrid Swing AOI</option>
                    <option>Breakout / Rejection</option>
                    <option>Replay Test 4H</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Session</label>
                  <select 
                    value={tradeSession}
                    onChange={(e) => setTradeSession(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option>Londres</option>
                    <option>New York</option>
                    <option>Asie</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Diagnostic / Pourquoi ce trade ?</label>
                <textarea 
                  value={tradeReason}
                  onChange={(e) => setTradeReason(e.target.value)}
                  placeholder="Ex: Rejet propre sur la zone d'intérêt 4H..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 h-20 resize-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Capture d'écran du setup (Graphique)</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-emerald-400 hover:file:bg-slate-700 cursor-pointer"
                />
                {tradeImage && (
                  <div className="mt-2">
                    <img src={tradeImage} alt="Aperçu upload" className="h-20 rounded border border-slate-800 object-cover" />
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setIsTradeModalOpen(false)} className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors">Annuler</button>
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors">Lancer l'analyse</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCsvModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-2">📥 Importer des trades par CSV</h2>
            <p className="text-xs text-slate-400 mb-4">
              Colle les lignes au format : <code className="text-emerald-400">Paire, PnL, Commentaire</code> (une par ligne).<br/>
              Exemple : <code className="text-slate-300">EURUSD, 120, Bon setup AOI</code>
            </p>
            <form onSubmit={handleCsvImport} className="space-y-4">
              <div>
                <textarea 
                  value={csvContent}
                  onChange={(e) => setCsvContent(e.target.value)}
                  placeholder="EURUSD, 150, Bon rejet 20 EMA&#10;GBPUSD, -75, Sortie hâtive de zone"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white text-xs font-mono focus:outline-none focus:border-emerald-500 h-32 resize-none"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setIsCsvModalOpen(false)} className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors">Annuler</button>
                <button type="submit" className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors">Importer le lot</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isReportModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-4">🤖 Rapport IA Hebdomadaire</h2>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-sm text-slate-300 whitespace-pre-line mb-4">
              {aiReport}
            </div>
            <div className="flex justify-end">
              <button 
                onClick={() => setIsReportModalOpen(false)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}