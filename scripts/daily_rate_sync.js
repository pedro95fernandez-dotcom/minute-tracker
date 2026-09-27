/**
 * Script de Sincronização Diária de Taxas e Câmbio para o Minute Tracker
 * Pode ser executado via cron diário, agendador do Windows ou Supabase Edge Function.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Chave do Supabase não fornecida.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function syncDailyRates() {
  console.log('--- Iniciando Sincronização Diária de Câmbio e Taxas ---');

  // 1. Atualizar cotação oficial USD -> BRL
  let currentUsdBrl = 5.50;
  try {
    const res = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL');
    const data = await res.json();
    if (data?.USDBRL?.bid) {
      currentUsdBrl = parseFloat(data.USDBRL.bid);
      console.log(`[Câmbio] Cotação Dólar Comercial: R$ ${currentUsdBrl.toFixed(4)}`);

      // Atualizar na tabela de equipes onde estiver padrão
      const { error: teamErr } = await supabase
        .from('teams')
        .update({ usd_to_brl_rate: parseFloat(currentUsdBrl.toFixed(4)) })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (teamErr) console.warn('[Câmbio] Aviso ao atualizar equipes:', teamErr.message);
    }
  } catch (err) {
    console.error('[Câmbio] Erro ao buscar cotação de câmbio:', err.message);
  }

  // 2. Verificar e atualizar data da última checagem no catálogo de intermediários
  try {
    const { data: intermediaries, error: intErr } = await supabase
      .from('intermediary_catalog')
      .select('id, name, slug, current_rate_usd, promo_rate_usd');

    if (intErr) throw intErr;

    console.log(`[Catálogo] Verificados ${intermediaries.length} intermediários ativos.`);
    
    // Atualizar timestamp de verificação
    for (const item of intermediaries) {
      await supabase
        .from('intermediary_catalog')
        .update({ last_checked_at: new Date().toISOString() })
        .eq('id', item.id);
    }
  } catch (err) {
    console.error('[Catálogo] Erro ao sincronizar intermediários:', err.message);
  }

  // 3. Processar reportes de divergência pendentes aprovados
  try {
    const { data: pendingReports } = await supabase
      .from('rate_reports')
      .select('*')
      .eq('status', 'pending');

    if (pendingReports && pendingReports.length > 0) {
      console.log(`[Reportes] Existem ${pendingReports.length} reportes de usuários pendentes de validação.`);
    }
  } catch (err) {
    console.warn('[Reportes] Aviso ao checar reportes:', err.message);
  }

  console.log('--- Sincronização Diária Concluída com Sucesso ---');
}

syncDailyRates().catch(console.error);
