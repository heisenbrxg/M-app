import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

const DailyIntensityChart = ({ logs = [] }) => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    // Generate hourly intensity for the specific day based on REAL LOGS
    const data = useMemo(() => {
        const hourlyData = [];
        const dateStart = new Date(selectedDate);
        const dateEnd = new Date(selectedDate);
        dateEnd.setDate(dateEnd.getDate() + 1);

        // Filter logs active on this day
        const activeLogs = logs.filter(log => {
            const logStart = new Date(log.startTime);
            const logEnd = new Date(log.endTime);
            // Check overlap
            return (logStart < dateEnd && logEnd > dateStart);
        });

        for (let hour = 0; hour <= 24; hour++) {
            const currentTime = new Date(selectedDate);
            currentTime.setHours(hour, 0, 0, 0);

            let maxIntensity = 0;

            activeLogs.forEach(log => {
                const logStart = new Date(log.startTime);
                const logEnd = new Date(log.endTime);

                if (currentTime >= logStart && currentTime <= logEnd) {
                    // Map severity text to number
                    let val = 0;
                    if (log.severity === 'Mild') val = 3;
                    if (log.severity === 'Moderate') val = 6;
                    if (log.severity === 'Severe') val = 9;

                    if (val > maxIntensity) maxIntensity = val;
                }
            });

            hourlyData.push({
                hour: `${hour}:00`,
                intensity: maxIntensity > 0 ? maxIntensity : null
            });
        }
        return hourlyData;
    }, [selectedDate, logs]);

    return (
        <div className="section-card">
            <h3 className="card-title">Time–Intensity Analysis</h3>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', gap: '12px' }}>
                <button onClick={() => {
                    const d = new Date(selectedDate);
                    d.setDate(d.getDate() - 1);
                    setSelectedDate(d.toISOString().split('T')[0]);
                }}><ChevronLeft size={20} color="#8E8E93" /></button>

                <div className="date-input-wrapper" style={{ width: 'auto', padding: '8px 12px' }}>
                    <Calendar size={16} className="input-icon" style={{ marginRight: 8 }} />
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{new Date(selectedDate).toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>

                <button onClick={() => {
                    const d = new Date(selectedDate);
                    d.setDate(d.getDate() + 1);
                    setSelectedDate(d.toISOString().split('T')[0]);
                }}><ChevronRight size={20} color="#8E8E93" /></button>
            </div>

            <div className="graph-container" style={{ height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5EA" />
                        <XAxis
                            dataKey="hour"
                            fontSize={12}
                            tickMargin={10}
                            axisLine={false}
                            tickLine={false}
                            ticks={['0:00', '6:00', '12:00', '18:00', '24:00']}
                        />
                        <YAxis
                            domain={[0, 10]}
                            ticks={[0, 3, 6, 9]}
                            fontSize={12}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            cursor={{ stroke: '#0066FF', strokeWidth: 1 }}
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length && payload[0].value !== null) {
                                    return (
                                        <div style={{ background: 'white', padding: '8px 12px', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '1px solid #E5F0FF' }}>
                                            <p style={{ fontSize: 12, color: '#8E8E93', marginBottom: 4 }}>{label}</p>
                                            <p style={{ fontSize: 14, fontWeight: 700, color: '#00297A' }}>Pain Level: {payload[0].value}/10</p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Line
                            type="stepAfter" // Use step line since we have discrete chunks of time
                            dataKey="intensity"
                            stroke="#0066FF"
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 6, fill: '#00297A' }}
                            connectNulls={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <p style={{ textAlign: 'center', fontSize: 12, color: '#8E8E93', marginTop: 8 }}>
                Select a day to view pain intensity over time
            </p>
        </div>
    );
};

export default DailyIntensityChart;
