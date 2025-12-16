import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useMigraineData } from '../context/MigraineContext';
import './MonthlyStats.css';

const MonthlyStats = () => {
    const { logs } = useMigraineData();
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // -- Calculate Stats for Current Month --
    const stats = useMemo(() => {
        const counts = { Mild: 0, Moderate: 0, Severe: 0, Total: 0 };

        logs.forEach(log => {
            const d = new Date(log.startTime);
            if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
                if (counts[log.severity] !== undefined) {
                    counts[log.severity]++;
                }
                counts.Total++;
            }
        });
        return counts;
    }, [logs, currentMonth, currentYear]);

    // -- Chart Data --
    // We want to show "Attacks" vs "Days without attacks".
    // Or maybe just colored segments for severity? 
    // The design shows a blue arc for attacks and grey for remaining.
    // We can do: 
    // 1. Arc for total attacks (Colored based on dominant severity?) 
    // 2. Arc for remaining days (Grey)

    const chartData = [
        { name: 'Attacks', value: stats.Total, color: '#00297A' }, // Primary arc
        { name: 'Pain Free', value: daysInMonth - stats.Total, color: '#F0F1F6' } // Remaining arc
    ];

    return (
        <div className="card stats-card">
            <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={70}
                            startAngle={90}
                            endAngle={450}
                            dataKey="value"
                            stroke="none"
                            cornerRadius={10}
                        >
                            <Cell key="attacks" fill="#00297A" />
                            <Cell key="free" fill="#F0F1F6" />
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                {/* Center Number = Total Attacks */}
                <div className="center-text">{stats.Total}</div>
            </div>

            <div className="legend-container">
                {/* Detail Counts */}
                <div className="legend-item">
                    <div className="badge" style={{ backgroundColor: '#00297A' }}>{stats.Severe}</div>
                    <span className="legend-label">Severe</span>
                </div>
                <div className="legend-item">
                    <div className="badge" style={{ backgroundColor: '#0066FF' }}>{stats.Moderate}</div>
                    <span className="legend-label">Moderate</span>
                </div>
                <div className="legend-item">
                    <div className="badge" style={{ backgroundColor: '#60AFFF' }}>{stats.Mild}</div>
                    <span className="legend-label">Mild</span>
                </div>

                <div className="legend-item">
                    <div className="badge transparent"></div>
                    <span className="legend-label remaining">No pain days</span>
                </div>
            </div>
        </div>
    );
};

export default MonthlyStats;
