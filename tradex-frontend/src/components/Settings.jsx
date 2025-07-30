import React, { useEffect, useState } from 'react';
import Header from './Header';
import supabase from '../lib/supabase';

const USER_ID = 'dev-user-001'; 

const Settings = () => {
    const [chartType, setChartType] = useState('candlestick');
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        const { data, error } = await supabase
            .from('user_settings')
            .select('chart_type')
            .eq('user_id', USER_ID)
            .single();

        if (data) setChartType(data.chart_type || 'candlestick');
        setLoading(false);
    };

    const saveSettings = async () => {
        const { error } = await supabase.from('user_settings').upsert(
            {
                user_id: USER_ID,
                chart_type: chartType,
            },
            { onConflict: 'user_id' }
        );

        if (error) {
            console.error('Error saving settings:', error);
            alert('Failed to save settings.');
        } else {
            alert('Settings saved.');
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    return (
        <div className="p-6 bg-[#0F1117] text-white min-h-screen">
            <Header />
            <h2 className="text-3xl font-semibold mt-8">Settings</h2>

            {!loading && (
                <div className="mt-8 space-y-6">
            {/* remember to due to lose of internet  later install:
                npm install @supabase/auth-ui-react @supabase/auth-ui-shared */}

                    <div className="bg-[#1C1F26] rounded-xl shadow-md p-6 border border-[#2D2F36]">
                        <div className="mb-4">
                            <label className="block text-lg font-medium text-white mb-2">Default Chart Type</label>
                            <select
                                value={chartType}
                                onChange={(e) => setChartType(e.target.value)}
                                className="w-full bg-[#2B2D33] text-white px-4 py-2 rounded-md border  border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="candlestick">Candlestick</option>
                                <option value="line">Line</option>
                                <option value="area">Area</option>
                            </select>
                        </div>
                        <div className="text-right">
                            <button
                                onClick={saveSettings}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-md transition-colors"
                            >
                                Save
                            </button>
                        </div>
                    </div>


                </div>
            )}
        </div>
    );
};

export default Settings;



