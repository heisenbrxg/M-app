import React, { useState, useMemo } from 'react';
import { Pill } from 'lucide-react';
import { useMigraineData } from '../context/MigraineContext';
import DayDetailModal from './DayDetailModal';
import './WeekView.css';

const WeekView = () => {
    const { getLogForDate } = useMigraineData();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Generate current week dates (Mon-Sun)
    const weekDays = useMemo(() => {
        const curr = new Date(); // get current date
        const first = curr.getDate() - curr.getDay() + 1; // First day is the day of the month - the day of the week
        // Note: this simple logic works if we are not crossing months weirdly, but cleaner to do robust loop

        const days = [];
        // Ensure we start from Monday of current week
        const today = new Date();
        const dayOfWeek = today.getDay() || 7; // Mon=1, Sun=7
        const monday = new Date(today);
        monday.setDate(today.getDate() - dayOfWeek + 1);

        for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            days.push(d);
        }
        return days;
    }, []);

    // Get Log for SELECTED date
    const selectedDateStr = selectedDate.toISOString().split('T')[0];
    const activeLog = getLogForDate(selectedDateStr);

    const medStatus = useMemo(() => {
        if (!activeLog) return 'No log';
        // Check if med question answered
        if (activeLog.medications && activeLog.medications.length > 0) return 'Taken';
        // If log exists but no meds array or empty, we generally assume 'Not taken'
        return 'Not taken';
    }, [activeLog]);

    return (
        <div className="card week-card">
            <div className="week-row">
                {weekDays.map((date, index) => {
                    const dateStr = date.toISOString().split('T')[0];
                    const isActive = dateStr === selectedDateStr;
                    const log = getLogForDate(dateStr);
                    const hasLog = !!log;

                    return (
                        <div
                            key={index}
                            className={`day-column ${isActive ? 'active' : ''}`}
                            onClick={() => setSelectedDate(date)}
                        >
                            {/* Indicator dot for existing log */}
                            {hasLog && <div className="has-data-dot" />}

                            <div className="day-circle">
                                {date.toLocaleDateString('default', { weekday: 'narrow' })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Status Bar for Selected Day */}
            <div className="pill-status-row" onClick={() => setIsModalOpen(true)}>
                <div className="status-info">
                    <span className="current-day-label">{selectedDate.toLocaleDateString('default', { weekday: 'short', day: 'numeric' })}</span>
                    <div className="pill-status">
                        <Pill size={14} className={medStatus === 'Taken' ? 'icon-taken' : 'icon-gray'} />
                        <span className="status-text">
                            {medStatus === 'No log' ? 'Tap to log' :
                                medStatus === 'Taken' ? `Taken (${activeLog.medications[0]}...)` : 'Not taken'}
                        </span>
                    </div>
                </div>
                <button className="edit-btn">Edit</button>
            </div>

            {/* Detail Modal */}
            {isModalOpen && (
                <DayDetailModal
                    date={selectedDateStr}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
};

export default WeekView;
