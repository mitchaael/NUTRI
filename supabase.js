import { createClient } from '@supabase/supabase-js';
 
const SUPABASE_URL = 'https://fywghvfdwltayylswnid.supabase.co';
const SUPABASE_KEY = 'sb_publishable_sJg-yVo5CteuhIjinAVyoQ_edrG0cgD';
 
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
 
export const syncProfile = async (userId, data) => {
  const { error } = await supabase.from('profiles').upsert({
    id: userId, nombre: data.nombre, perfil: data.perfil, obj: data.obj,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'id' });
  if (error) { console.error('syncProfile:', error.message); return false; }
  return true;
};
 
export const syncSettings = async (userId, data) => {
  const { error } = await supabase.from('user_settings').upsert({
    id: userId, allergens: data.allergens||[], vegan_mode: data.veganMode??false,
    dark_mode: data.darkMode??false, notif_enabled: data.notifEnabled??true,
    streak: data.streak||{}, challenge21: data.challenge21||null,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'id' });
  if (error) { console.error('syncSettings:', error.message); return false; }
  return true;
};
 
export const syncDay = async (userId, date, log, agua, exercises) => {
  const { error } = await supabase.from('daily_logs').upsert({
    user_id: userId, date, log: log||[], agua: agua||0, exercises: exercises||[],
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,date' });
  if (error) { console.error('syncDay:', date, error.message); return false; }
  return true;
};
 
export const syncWeight = async (userId, history) => {
  if (!history?.length) return true;
  const rows = history.filter(h=>h.w&&parseFloat(h.w)>0).map(h=>({
    user_id: userId, date: h.date||new Date().toISOString().slice(0,10),
    weight: parseFloat(h.w), updated_at: new Date().toISOString(),
  }));
  if (!rows.length) return true;
  const { error } = await supabase.from('weight_history').upsert(rows, { onConflict: 'user_id,date' });
  if (error) { console.error('syncWeight:', error.message); return false; }
  return true;
};
 
export const restoreFromSupabase = async (userId) => {
  const [pR, sR, lR, wR] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
    supabase.from('user_settings').select('*').eq('id', userId).maybeSingle(),
    supabase.from('daily_logs').select('*').eq('user_id', userId).order('date',{ascending:false}).limit(60),
    supabase.from('weight_history').select('*').eq('user_id', userId).order('date',{ascending:true}),
  ]);
  if (pR.error)  console.error('restore/profile:', pR.error.message);
  if (sR.error)  console.error('restore/settings:', sR.error.message);
  if (lR.error)  console.error('restore/logs:', lR.error.message);
  if (wR.error)  console.error('restore/weights:', wR.error.message);
  return {
    profile:  pR.data ?? null,
    settings: sR.data ?? null,
    logs:     lR.data ?? [],
    weights:  wR.data ?? [],
    hasErrors: !!(pR.error||sR.error||lR.error||wR.error),
  };
};
