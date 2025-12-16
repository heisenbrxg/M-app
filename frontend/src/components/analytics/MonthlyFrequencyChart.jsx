import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MonthlyFrequencyChart = ({ logs = [] }) => {
    const [selectedMonth, setSelectedMonth] = useState(new Date());

    const navigateMonth = (direction) => {
        const d = new Date(selectedMonth);
        d.setMonth(d.getMonth() + direction);
        setSelectedMonth(d);
    };

    const chartData = useMemo(() => {
        const year = selectedMonth.getFullYear();
        const month = selectedMonth.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Create map of days initialized to 0
        const dayMap = {};
        for (let d = 1; d <= daysInMonth; d++) dayMap[d] = 0;

        // Filter logs for this month/year and count them
        logs.forEach(log => {
            const logDate = new Date(log.startTime);
            if (logDate.getFullYear() === year && logDate.getMonth() === month) {
                dayMap[logDate.getDate()] = (dayMap[logDate.getDate()] || 0) + 1;
            }
        });

        return Object.keys(dayMap).map(day => ({
            day: parseInt(day),
            attacks: dayMap[day]
        }));
    }, [selectedMonth, logs]);

    const monthLabel = selectedMonth.toLocaleDateString('default', { month: 'long', year: 'numeric' });

    return (
        <div className="section-card">
            <h3 className="card-title">Attack Frequency</h3>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', gap: '12px' }}>
                <button onClick={() => navigateMonth(-1)}><ChevronLeft size={20} color="#8E8E93" /></button>
                <span style={{ fontSize: 16, fontWeight: 600, minWidth: 140, textAlign: 'center' }}>{monthLabel}</span>
                <button onClick={() => navigateMonth(1)}><ChevronRight size={20} color="#8E8E93" /></button>
            </div>

            <div className="graph-container" style={{ height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5EA" />
                        <XAxis
                            dataKey="day"
                            type="number"
                            domain={[1, 'auto']}
                            interval={4} // Label every 5 days approx
                            fontSize={12}
                            tickMargin={10}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            allowDecimals={false}
                            fontSize={12}
                            axisLine={false}
                            tickLine={false}
                            padding={{ top: 20 }}
                        />
                        <Tooltip
                            cursor={{ stroke: '#0066FF', strokeWidth: 1, strokeDasharray: '4 4' }}
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div style={{ background: 'white', padding: '8px 12px', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '1px solid #E5F0FF' }}>
                                            <p style={{ fontSize: 12, color: '#8E8E93', marginBottom: 4 }}>{monthLabel.split(' ')[0]} {label}</p>
                                            <p style={{ fontSize: 14, fontWeight: 700, color: '#00297A' }}>{payload[0].value} Attacks</p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="attacks"
                            stroke="#0066FF"
                            strokeWidth={2}
                            dot={{ r: 3, fill: '#0066FF' }}
                            activeDot={{ r: 6, fill: '#00297A' }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default MonthlyFrequencyChart;
