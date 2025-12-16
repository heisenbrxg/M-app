import React, { createContext, useState, useContext, useEffect } from 'react';

const MigraineContext = createContext();

export const useMigraineData = () => useContext(MigraineContext);

// Initial placeholder data so the app isn't empty on first load
const SAMPLE_DATA = [
    {
        id: 'sample-1',
        startTime: '2025-12-09T09:00',
        endTime: '2025-12-09T14:00',
        severity: 'Moderate',
        durationValue: 5,
        triggers: ['Stress'],
        symptoms: ['Nausea']
    },
    {
        id: 'sample-2',
        startTime: '2025-12-12T18:00',
        endTime: '2025-12-12T22:00',
        severity: 'Severe',
        durationValue: 4,
        triggers: ['Lights'],
        symptoms: ['Aura']
    }
];

export const MigraineProvider = ({ children }) => {
    const [logs, setLogs] = useState(() => {
        const saved = localStorage.getItem('migraine_logs');
        return saved ? JSON.parse(saved) : SAMPLE_DATA;
    });

    useEffect(() => {
        localStorage.setItem('migraine_logs', JSON.stringify(logs));
    }, [logs]);

    const addLog = (newLog) => {
        setLogs(prev => [...prev, { ...newLog, id: Date.now().toString() }]);
    };

    // Helper to check if a specific date has an attack
    const getLogForDate = (dateStringYMD) => {
        return logs.find(log => log.startTime.startsWith(dateStringYMD));
    };

    const deleteLogByDate = (dateStringYMD) => {
        setLogs(prev => prev.filter(log => !log.startTime.startsWith(dateStringYMD)));
    };

    return (
        <MigraineContext.Provider value={{ logs, addLog, getLogForDate, deleteLogByDate }}>
            {children}
        </MigraineContext.Provider>
    );
};
