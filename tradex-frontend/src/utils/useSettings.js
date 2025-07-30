import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export const useSettings = (userId) => {
  const [settings, setSettings] = useState({
    theme: 'dark',
    chart_type: 'candlestick',
    beginner_mode: false,
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error loading settings:', error);
    } else if (data) {
      setSettings(data);
    }

    setLoading(false);
  };

  const saveSettings = async (updatedSettings) => {
    const { error } = await supabase
      .from('user_settings')
      .upsert({ user_id: userId, ...updatedSettings }, { onConflict: 'user_id' });

    if (error) {
      console.error('Error saving settings:', error);
    } else {
      setSettings(updatedSettings);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [userId]);

  return { settings, setSettings, saveSettings, loading };
};
