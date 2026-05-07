import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fywghvfdwltayylswnid.supabase.co';
const SUPABASE_KEY = 'sb_publishable_sJg-yVo5CteuhIjinAVyoQ_edrG0cgD';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/* ── Helpers de sync ── */

export const syncProfile = async (userId, data) => {
  const { error } = await supabase.from('profiles').upsert({
    id: userId,
    nombre:  data.nombre,
    perfil:  data.perfil,
    obj:     data.obj,
    updated_at: new Date().toISOString(),
  });
  if (error) console.warn('syncProfile:', error.message);
};

export const syncSettings = async (userId, data) => {
  const { error } = await supabase.from('user_settings').upsert({
    id:            userId,
    allergens:     data.allergens,
    vegan_mode:    data.veganMode,
    dark_mode:     data.darkMode,
    notif_enabled: data.notifEnabled,
    streak:        data.streak,
    challenge21:   data.challenge21,
    updated_at:    new Date().toISOString(),
  });
  if (error) console.warn('syncSettings:', error.message);
};

export const syncDay = async (userId, date, log, agua, exercises) => {
  const { error } = await supabase.from('daily_logs').upsert({
    user_id:    userId,
    date,
    log,
    agua,
    exercises,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,date' });
  if (error) console.warn('syncDay:', error.message);
};

export const syncWeight = async (userId, history) => {
  if (!history.length) return;
  const rows = history.map(h => ({
    user_id:    userId,
    date:       h.date || h.label || new Date().toISOString().slice(0,10),
    weight:     h.w,
    updated_at: new Date().toISOString(),
  })).filter(r => r.weight);
  const { error } = await supabase.from('weight_history').upsert(rows, { onConflict: 'user_id,date' });
  if (error) console.warn('syncWeight:', error.message);
};

export const restoreFromSupabase = async (userId) => {
  const results = await Promise.allSettled([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('user_settings').select('*').eq('id', userId).single(),
    supabase.from('daily_logs').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(60),
    supabase.from('weight_history').select('*').eq('user_id', userId).order('date', { ascending: true }),
  ]);

  const [profileRes, settingsRes, logsRes, weightRes] = results;

  return {
    profile:  profileRes.status === 'fulfilled'  ? profileRes.value.data  : null,
    settings: settingsRes.status === 'fulfilled' ? settingsRes.value.data : null,
    logs:     logsRes.status === 'fulfilled'     ? logsRes.value.data     : [],
    weights:  weightRes.status === 'fulfilled'   ? weightRes.value.data   : [],
  };
};
