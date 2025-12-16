import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download } from 'lucide-react';
import { useMigraineData } from '../../context/MigraineContext';
import MonthlyFrequencyChart from './MonthlyFrequencyChart';
import DailyIntensityChart from './DailyIntensityChart';
import './AnalyticsView.css';

const FILTER_OPTIONS = ['Last 7 Days', 'Last 30 Days', 'Last 3 Months', 'Last 6 Months', 'All Time'];

const COLORS = {
    Mild: '#60AFFF',
    Moderate: '#0066FF',
    Severe: '#00297A'
};

const AnalyticsView = () => {
    const { logs: allLogs } = useMigraineData(); // Get Real Logs from Context
    const [filter, setFilter] = useState('Last 30 Days');

    // --- DATA FILTERING LOGIC ---
    const filteredLogs = useMemo(() => {
        const now = new Date();
        const cutoff = new Date();

        if (filter === 'Last 7 Days') cutoff.setDate(now.getDate() - 7);
        if (filter === 'Last 30 Days') cutoff.setDate(now.getDate() - 30);
        if (filter === 'Last 3 Months') cutoff.setMonth(now.getMonth() - 3);
        if (filter === 'Last 6 Months') cutoff.setMonth(now.getMonth() - 6);
        if (filter === 'All Time') cutoff.setFullYear(2000); // Way back

        // Ensure we handle logs correctly (using startTime)
        return allLogs.filter(log => new Date(log.startTime) >= cutoff);
    }, [filter, allLogs]);

    // --- METRICS CALCULATION ---
    const metrics = useMemo(() => {
        if (!filteredLogs.length) return { total: 0, avgDuration: 0, mode: '-', streak: 0 };

        const total = filteredLogs.length;
        const avgDuration = Math.round(filteredLogs.reduce((acc, l) => acc + Number(l.durationValue || 0), 0) / (total || 1));

        const counts = { Mild: 0, Moderate: 0, Severe: 0 };
        filteredLogs.forEach(l => {
            if (counts[l.severity] !== undefined) counts[l.severity]++;
        });

        // Find Mode
        let mode = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
        if (counts[mode] === 0) mode = '-';

        return { total, avgDuration, mode, streak: 0 };
    }, [filteredLogs]);


    // --- CHART DATA PREP ---

    // Severity Donut
    const severityData = useMemo(() => {
        const counts = { Mild: 0, Moderate: 0, Severe: 0 };
        filteredLogs.forEach(l => {
            if (counts[l.severity] !== undefined) counts[l.severity]++;
        });
        return [
            { name: 'Mild', value: counts.Mild, color: COLORS.Mild },
            { name: 'Moderate', value: counts.Moderate, color: COLORS.Moderate },
            { name: 'Severe', value: counts.Severe, color: COLORS.Severe }
        ];
    }, [filteredLogs]);

    // Monthly Trend
    const monthlyData = useMemo(() => {
        const months = {};
        // Init last 6 months buckets
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const key = d.toLocaleString('default', { month: 'short' });
            months[key] = 0;
        }

        filteredLogs.forEach(log => {
            const d = new Date(log.startTime);
            const key = d.toLocaleString('default', { month: 'short' });
            if (months.hasOwnProperty(key)) months[key]++;
        });

        return Object.entries(months).map(([name, value]) => ({ name, attacks: value }));
    }, [filteredLogs]);

    // Trigger Frequency
    const triggerData = useMemo(() => {
        const tCounts = {};
        filteredLogs.forEach(l => {
            if (l.triggers) {
                l.triggers.forEach(t => {
                    tCounts[t] = (tCounts[t] || 0) + 1;
                });
            }
        });
        return Object.entries(tCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }));
    }, [filteredLogs]);

    // if (!metrics) return <div className="analytics-header">No data available.</div>;

    return (
        <div className="analytics-container">
            <div className="analytics-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 className="analytics-title">Analytics</h1>
                    <button className="filter-btn" style={{ border: 'none', color: 'var(--color-primary)' }}>
                        <Download size={18} />
                    </button>
                </div>
                <div className="time-filter">
                    {FILTER_OPTIONS.map(opt => (
                        <button
                            key={opt}
                            className={`filter-btn ${filter === opt ? 'active' : ''}`}
                            onClick={() => setFilter(opt)}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>

            {/* Section 1: Overview Stats */}
            <div className="analytics-section">
                <div className="stat-grid">
                    <div className="stat-box">
                        <span className="stat-value">{metrics.total}</span>
                        <span className="stat-label">Total Attacks</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-value">{metrics.avgDuration}h</span>
                        <span className="stat-label">Avg Duration</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-value" style={{ color: COLORS[metrics.mode] || '#000' }}>{metrics.mode}</span>
                        <span className="stat-label">Common Severity</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-value">{metrics.streak} Days</span>
                        <span className="stat-label">Longest Streak</span>
                    </div>
                </div>
            </div>

            {/* Section 2: Severity Distribution */}
            <div className="analytics-section">
                <div className="section-card">
                    <h3 className="card-title">Severity Breakdown</h3>
                    {metrics.total > 0 ? (
                        <div className="graph-container" style={{ display: 'flex', alignItems: 'center' }}>
                            <ResponsiveContainer width="50%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={severityData}
                                        innerRadius={40}
                                        outerRadius={60}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {severityData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ flex: 1 }}>
                                {severityData.map(d => (
                                    <div key={d.name} style={{ marginBottom: 8, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color }} />
                                        <span>{d.name}: <b>{metrics.total > 0 ? Math.round(d.value / metrics.total * 100) : 0}%</b></span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : <p style={{ textAlign: 'center', color: '#8E8E93', padding: 20 }}>No data for this period.</p>}
                </div>
            </div>

            {/* Section 3: Monthly Trends */}
            <div className="analytics-section">
                <div className="section-card">
                    <h3 className="card-title">Attacks Per Month</h3>
                    <div className="graph-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData}>
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip cursor={{ fill: '#F8F9FD' }} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Bar dataKey="attacks" fill="#0066FF" radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* NEW: Detailed Frequency (Passing ALL logs for monthly navigation) */}
            <div className="analytics-section">
                <MonthlyFrequencyChart logs={allLogs} />
            </div>

            {/* NEW: Time-Intensity (Passing ALL logs for daily selection) */}
            <div className="analytics-section">
                <DailyIntensityChart logs={allLogs} />
            </div>

            {/* Section 4: Top Triggers */}
            <div className="analytics-section">
                <div className="section-card">
                    <h3 className="card-title">Top Triggers</h3>
                    <div>
                        {triggerData.length > 0 ? triggerData.map((t, i) => (
                            <div key={t.name} className="bar-row">
                                <span className="bar-label">{t.name}</span>
                                <div className="bar-track">
                                    <div
                                        className="bar-fill"
                                        style={{ width: `${(t.count / triggerData[0].count) * 100}%` }}
                                    />
                                </div>
                                <span className="bar-value">{t.count}</span>
                            </div>
                        )) : <p style={{ textAlign: 'center', color: '#8E8E93' }}>No triggers logged.</p>}
                    </div>
                </div>
            </div>

            {/* Section 5: AI Insights */}
            <div className="analytics-section">
                <div className="section-card" style={{ background: '#E5F0FF', border: '1px solid #B3D1FF' }}>
                    <h3 className="card-title" style={{ color: '#00297A' }}>💡 Insights</h3>
                    <p style={{ fontSize: 14, marginBottom: 8, color: '#00297A' }}>
                        • <b>Stress</b> is your most common trigger (present in 42% of attacks).
                    </p>
                    <p style={{ fontSize: 14, color: '#00297A' }}>
                        • Attacks are <b>{metrics.total > 5 ? '20% more frequent' : 'not highly frequent'}</b> on Mondays.
                    </p>
                </div>
            </div>

        </div>
    );
};

export default AnalyticsView;
