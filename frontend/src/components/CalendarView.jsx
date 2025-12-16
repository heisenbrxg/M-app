import React, { useState, useMemo } from 'react';
import { Upload, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMigraineData } from '../context/MigraineContext'; // Integration
import './CalendarView.css';

const CalendarView = () => {
    const { logs, addLog, deleteLogByDate } = useMigraineData();

    // View State
    const [viewDate, setViewDate] = useState(new Date(2025, 11, 1)); // Default Dec 2025
    const [selectedDate, setSelectedDate] = useState(null);

    // Derive attacks map from global logs
    const attacks = useMemo(() => {
        const map = {};
        logs.forEach(log => {
            const dateKey = log.startTime.split('T')[0]; // Extract YYYY-MM-DD
            map[dateKey] = log.severity;
        });
        return map;
    }, [logs]);

    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const navigateMonth = (direction) => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + direction, 1));
    };

    const daysInMonth = getDaysInMonth(viewDate);
    const startDayOffset = getFirstDayOfMonth(viewDate);
    const monthName = viewDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    const currentMonthKey = `${viewDate.getFullYear()}-${(viewDate.getMonth() + 1).toString().padStart(2, '0')}`;

    const handleDateClick = (day) => {
        const dateString = `${currentMonthKey}-${day.toString().padStart(2, '0')}`;
        setSelectedDate(dateString);
    };

    const setIntensity = (intensity) => {
        if (selectedDate) {
            if (intensity === null) {
                // Clear the log for this date
                deleteLogByDate(selectedDate);
            } else {
                // Check if log exists to avoid duplicates or just overwrite?
                // For simplicity, we delete existing for that day first to ensure clean state
                deleteLogByDate(selectedDate);

                // Create a simple log entry
                const newLog = {
                    startTime: `${selectedDate}T09:00`,
                    endTime: `${selectedDate}T13:00`,
                    durationValue: 4,
                    severity: intensity,
                    triggers: [],
                    symptoms: []
                };
                addLog(newLog);
            }
        }
        setSelectedDate(null);
    };

    const getDayClass = (day) => {
        const dateKey = `${currentMonthKey}-${day.toString().padStart(2, '0')}`;
        let classes = 'cal-cell';

        // Check for "Today" (Simulated as Dec 16 2025)
        if (dateKey === '2025-12-16') classes += ' today';

        if (attacks[dateKey]) {
            classes += ' has-attack';
            classes += ` ${attacks[dateKey].toLowerCase()}`;
        }
        return classes;
    };

    // Count attacks for this month
    const attackCount = Object.keys(attacks).filter(k => k.startsWith(currentMonthKey)).length;

    return (
        <div className="calendar-container">
            <div className="calendar-header">
                <h1 className="calendar-title">Calendar</h1>
                <button className="pdf-btn">
                    PDF <Upload size={14} style={{ transform: 'rotate(180deg)', display: 'inline' }} />
                </button>
            </div>

            {/* Week Header */}
            <div className="calendar-grid" style={{ marginBottom: '10px', rowGap: '0' }}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                    <div key={d} className="cal-day-label" style={{ fontWeight: '600', fontSize: '14px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{d}</div>
                ))}
            </div>

            {/* Month Navigation & Grid */}
            <div className="month-info">
                <button onClick={() => navigateMonth(-1)}><ChevronLeft size={20} color="#8E8E93" /></button>
                <span className="month-name" style={{ minWidth: '140px', textAlign: 'center' }}>{monthName}</span>
                <button onClick={() => navigateMonth(1)}><ChevronRight size={20} color="#8E8E93" /></button>
            </div>

            <div className="month-info" style={{ marginTop: '-20px', marginBottom: '20px' }}>
                <span className="attack-count" style={{ fontSize: '14px' }}>• {attackCount} {attackCount === 1 ? 'attack' : 'attacks'}</span>
            </div>

            <div className="calendar-grid">
                {/* Blank start days */}
                {Array(startDayOffset).fill(null).map((_, i) => (
                    <div key={`empty-${i}`} />
                ))}

                {/* Actual Days */}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                    <div
                        key={`day-${day}`}
                        className={getDayClass(day)}
                        onClick={() => handleDateClick(day)}
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Intensity Selector Modal */}
            {selectedDate && (
                <>
                    <div className="modal-backdrop" onClick={() => setSelectedDate(null)} />
                    <div className="options-modal">
                        <div className="modal-header">
                            Log Attack for {new Date(selectedDate).toLocaleDateString('default', { day: 'numeric', month: 'short' })}
                        </div>
                        <button className="option-btn mild" onClick={() => setIntensity('Mild')}>Mild</button>
                        <button className="option-btn moderate" onClick={() => setIntensity('Moderate')}>Moderate</button>
                        <button className="option-btn severe" onClick={() => setIntensity('Severe')}>Severe</button>

                        {/* Clear Button - only show if there IS an attack currently */}
                        {attacks[selectedDate] && (
                            <button className="option-btn" onClick={() => setIntensity(null)} style={{ marginTop: '12px', color: '#FF3B30', border: '1px solid #FF3B30', background: '#fff' }}>Clear Date</button>
                        )}

                        <button className="option-btn" onClick={() => setSelectedDate(null)} style={{ marginTop: '12px', color: '#8E8E93', border: 'none', background: 'transparent' }}>Cancel</button>
                    </div>
                </>
            )}
        </div>
    );
};

export default CalendarView;
