import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { type = 'WEEKLY' } = await req.json().catch(() => ({}));

    // 1. Récupérer tous les trades
    const { data: trades, error } = await supabase.from('trades').select('*');

    if (error || !trades || trades.length === 0) {
      return NextResponse.json({ error: 'Aucun trade disponible pour générer un bilan.' }, { status: 400 });
    }

    // 2. Calcul des métriques
    const totalTrades = trades.length;
    const wins = trades.filter((t) => Number(t.pnl) > 0).length;
    const winRate = Number(((wins / totalTrades) * 100).toFixed(1));
    const totalPnl = trades.reduce((acc, t) => acc + Number(t.pnl), 0);

    // 3. Enregistrement du rapport dans Supabase
    const { data: newReport, error: insertError } = await supabase
      .from('reports')
      .insert([
        {
          type,
          period_start: new Date().toISOString(),
          period_end: new Date().toISOString(),
          total_trades: totalTrades,
          win_rate: winRate,
          total_pnl: totalPnl,
          summary: `Bilan ${type} : ${totalTrades} trades exécutés. PnL global de $${totalPnl} avec un taux de réussite de ${winRate}%.`,
          strengths: 'Bonne exécution du plan de trading et respect de la gestion du risque.',
          weaknesses: 'Maintenir la discipline lors des sessions à forte volatilité.',
          action_plan: 'Continuer à cibler les zones d’intérêt majeures et viser un Risk/Reward optimal.',
        },
      ])
      .select();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, report: newReport[0] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}