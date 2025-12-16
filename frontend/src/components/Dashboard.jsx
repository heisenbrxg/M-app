import React, { useState, useMemo } from 'react';
import PainFreeCard from './PainFreeCard';
import WeekView from './WeekView';
import MonthlyStats from './MonthlyStats';
import LogDetailsModal from './LogDetailsModal';
import AIChatBot from './AIChatBot';
import { useMigraineData } from '../context/MigraineContext';

const Dashboard = () => {
    const { logs } = useMigraineData();
    const [selectedLog, setSelectedLog] = useState(null);

    const handleCardClick = () => {
        if (logs && logs.length > 0) {
            // Find latest log
            const sorted = [...logs].sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
            setSelectedLog(sorted[0]);
        } else {
            alert('No logs recorded yet.');
        }
    };

    // Calculate current month stats for Header
    const monthStats = useMemo(() => {
        const now = new Date();
        const m = now.getMonth();
        const y = now.getFullYear();
        const count = logs ? logs.filter(l => {
            const d = new Date(l.startTime);
            return d.getMonth() === m && d.getFullYear() === y;
        }).length : 0;

        return {
            name: now.toLocaleString('default', { month: 'long', year: 'numeric' }),
            count
        };
    }, [logs]);

    return (
        <div className="dashboard-content">
            <div className="section">
                <h2 className="section-title">Today</h2>
                <PainFreeCard onClick={handleCardClick} />
            </div>

            <div className="section">
                <h2 className="section-title">Week</h2>
                <WeekView />
            </div>

            <div className="section">
                <h2 className="section-title">
                    {monthStats.name} <span style={{ color: '#8E8E93', fontWeight: 400, fontSize: '15px', marginLeft: 8 }}>• {monthStats.count} attacks</span>
                </h2>
                <MonthlyStats />
            </div>

            {selectedLog && (
                <LogDetailsModal
                    log={selectedLog}
                    onClose={() => setSelectedLog(null)}
                />
            )}

            <AIChatBot />
        </div>
    );
};

export default Dashboard;
