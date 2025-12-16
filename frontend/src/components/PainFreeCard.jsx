import React, { useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import { useMigraineData } from '../context/MigraineContext';
import './PainFreeCard.css';

const PainFreeCard = ({ onClick }) => {
    const { logs } = useMigraineData();

    const { daysFree, lastAttackDate } = useMemo(() => {
        if (!logs || logs.length === 0) {
            return { daysFree: '-', lastAttackDate: 'No migraine attacks recorded yet' };
        }

        // Sort logs by Date descending
        const sortedLogs = [...logs].sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
        const lastLog = sortedLogs[0];

        const lastDate = new Date(lastLog.startTime);
        const today = new Date();

        // Reset time to midnight for accurate day calculation
        lastDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        // Calculate difference in days based on midnight-to-midnight
        const diffTime = today - lastDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        // Format date string
        let dateString = lastDate.toLocaleDateString('default', { day: 'numeric', month: 'long' });
        if (diffDays === 0) dateString = "Today";

        return {
            daysFree: diffDays < 0 ? 0 : diffDays, // safety check
            lastAttackDate: `Last attack: ${dateString}`
        };

    }, [logs]);

    return (
        <div className="card pain-free-card" onClick={onClick} style={{ cursor: 'pointer' }}>
            <div className="pain-content">
                <div className="big-number">{daysFree}</div>
                <div className="text-content">
                    <div className="title">Days no pain</div>
                    <div className="subtitle">{lastAttackDate}</div>
                </div>
            </div>
            <ChevronRight className="arrow-icon" size={20} color="#C4C4C4" />
        </div>
    );
};

export default PainFreeCard;
