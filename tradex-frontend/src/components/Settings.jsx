import React, { useEffect, useState } from 'react';
import Header from './Header';
import supabase from '../lib/supabase';

const ActionCard = ({ label, onClick }) => (
    <div
        onClick={onClick}
        className="cursor-pointer bg-[#1e1e1e] hover:bg-[#2a2a2a] rounded-xl shadow-md p-6 flex-1 text-center transition-colors duration-200 border border-[#2D2F36]"
    >
        <span className="text-white font-semibold text-lg">{label}</span>
    </div>
);

const Settings = () => {
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);

    // Settings states
    const [chartType, setChartType] = useState('candlestick');
    const [chartInterval, setChartInterval] = useState('15m');
    const [refreshRate, setRefreshRate] = useState('30');
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    const fetchUser = async () => {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
            console.error('Error fetching user:', error);
            setLoading(false);
            return;
        }
        setUserId(user.id);
    };

    const fetchSettings = async (uid) => {
        const { data, error } = await supabase
            .from('user_settings')
            .select('*')
            .eq('user_id', uid)
            .single();

        if (error) {
            console.error('Error fetching settings:', error);
        } else if (data) {
            setChartType(data.chart_type || 'candlestick');
            setChartInterval(data.chart_interval || '15m');
            setRefreshRate(data.refresh_rate?.toString() || '30');
            setNotificationsEnabled(data.notifications_enabled ?? true);
        }
        setLoading(false);
    };

    const saveSettings = async () => {
        if (!userId) return;

        const { error } = await supabase.from('user_settings').upsert(
            {
                user_id: userId,
                chart_type: chartType,
                chart_interval: chartInterval,
                refresh_rate: parseInt(refreshRate, 10),
                notifications_enabled: notificationsEnabled,
                updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' }
        );

        if (error) {
            console.error('Error saving settings:', error);
            alert('Failed to save settings.');
        } else {
            alert('Settings saved successfully!');
        }
    };

    useEffect(() => { fetchUser(); }, []);
    useEffect(() => { if (userId) fetchSettings(userId); }, [userId]);

    if (loading) return <div className="p-6 text-white">Loading...</div>;

    return (
        <div className="p-4 sm:p-6 bg-[#0F1117] text-white min-h-screen">
            <Header />
            <div className="w-full max-w-6xl mx-auto rounded-xl shadow-lg bg-[#0F1117] p-4 sm:p-8 space-y-6 sm:space-y-8">

                {/* Chart Type */}
                <div className="bg-[#232323] rounded-xl shadow-md p-4 sm:p-6 border border-[#2D2F36]">
                    <label className="block text-lg font-medium mb-2">Default Chart Type</label>
                    <select
                        value={chartType}
                        onChange={(e) => setChartType(e.target.value)}
                        className="w-full bg-[#1a1a1a] text-white px-4 py-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="candlestick">Candlestick</option>
                        <option value="line">Line</option>
                        <option value="area">Area</option>
                    </select>
                </div>

                {/* Price Alerts */}
                <div className="bg-[#232323] rounded-xl shadow-md p-4 sm:p-6 border border-[#2D2F36] flex items-center justify-between">
                    <label className="text-lg font-medium">Price Alerts</label>
                    <input
                        type="checkbox"
                        checked={notificationsEnabled}
                        onChange={() => setNotificationsEnabled(!notificationsEnabled)}
                        className="w-6 h-6 accent-purple-600 rounded"
                    />
                </div>

                {/* Action Buttons & Cards */}
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* Save Settings Button */}

                    {/* Card-style actions */}
                    <div className="flex flex-1 flex-col sm:flex-row gap-4">
                        <ActionCard label="View Bill" onClick={() => alert('View Bill clicked')} />
                        <ActionCard label="Receipt Records" onClick={() => alert('Receipt Records clicked')} />
                        <ActionCard label="Pay Bill" onClick={() => alert('Pay Bill clicked')} />
                    </div>
                    <button
                        onClick={saveSettings}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold w-full sm:w-auto"
                    >
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
