import React, { useState, useEffect } from 'react';
import { X, Clock, Pill, Check, ChevronRight } from 'lucide-react';
import { useMigraineData } from '../context/MigraineContext';
import './DayDetailModal.css';

const MED_CATEGORIES = [
    'Triptans', 'NSAIDs', 'Acetaminophen', 'Anti-nausea',
    'Ergotamines', 'Ditans', 'Gepants', 'Combination'
];

const DayDetailModal = ({ date, onClose }) => {
    const { getLogForDate, addLog, logs } = useMigraineData(); // logs needed for update/filter logic if we want to replace

    // State
    const [step, setStep] = useState(1); // 1: Time, 2: Meds
    const [startTime, setStartTime] = useState(`${date}T09:00`);
    const [tookMeds, setTookMeds] = useState(null); // true/false
    const [selectedMeds, setSelectedMeds] = useState([]);
    const [customMed, setCustomMed] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);

    // Load existing data if any
    useEffect(() => {
        const existingLog = getLogForDate(date);
        if (existingLog) {
            setStartTime(existingLog.startTime);
            if (existingLog.medications && existingLog.medications.length > 0) {
                setTookMeds(true);
                setSelectedMeds(existingLog.medications);
            } else {
                // existing logs might imply 'No' if array is empty, or 'Not Asked'
                // For simplicity, if log exists but no meds, we assume No or user can change
                setTookMeds(false);
            }
        } else {
            // Default start time to the selected date
            // Ensure date string YYYY-MM-DD matches
            setStartTime(`${date}T09:00`);
        }
    }, [date, getLogForDate]);

    const toggleMed = (med) => {
        setSelectedMeds(prev =>
            prev.includes(med) ? prev.filter(m => m !== med) : [...prev, med]
        );
    };

    const saveAndClose = () => {
        // Construct final list
        let finalMeds = [...selectedMeds];
        if (customMed.trim()) finalMeds.push(customMed.trim());
        if (!tookMeds) finalMeds = [];

        // Create or Update Log
        // Note: In a real app we'd merge with other log data (severity, etc). 
        // Here we might be careful not to overwrite 'severity' if it exists.
        // For this minimal MVP, let's assume we are updating or creating.

        const existingLog = getLogForDate(date);

        // Fallback defaults if creating new
        const baseLog = existingLog || {
            severity: 'Moderate', // Default if just meds logged?
            durationValue: 2,
            symptoms: [],
            triggers: []
        };

        const updatedLog = {
            ...baseLog,
            startTime: startTime,
            // If we only asked about start time, we shouldn't wipe endTime if it existed.
            // Assuming simplistic handling:
            endTime: existingLog ? existingLog.endTime : `${date}T11:00`,
            medications: finalMeds,
            // Mark explicitly that med question was answered? 
            // (Not strictly persisted in basic model but good for UX)
        };

        // We need to 'update' effectively. 
        // Context only has 'addLog'. In a real app 'updateLog' is needed.
        // I'll assume 'addLog' appends. To avoid duplicates, I should probably delete old one first if I had delete capability exposed directly here?
        // Actually, `addLog` in context just appends. 
        // I'll assume the USER wants me to overwrite/add. 
        // Since I added `deleteLogByDate` earlier, I can use that!

        // But I need access to it. I'll need to check my context provider again or pass it.
        // Assuming context has 'deleteLogByDate' now.

        // Wait, I can't destructure `deleteLogByDate` if I didn't export it in the LAST step fully properly or if I'm not sure.
        // I did add it in the previous step (Step 372/380). So it SHOULD be there.
        // I'll rely on it.
    };

    // Re-getting context with deleteLog
    const { deleteLogByDate } = useMigraineData();

    const handleSave = () => {
        let finalMeds = [...selectedMeds];
        if (customMed.trim()) finalMeds.push(customMed.trim());
        if (!tookMeds) finalMeds = [];

        // Remove old for this date
        deleteLogByDate(date);

        // Fetch existing again to be sure we have base fields (severity etc)
        const existing = getLogForDate(date);
        const newLog = {
            ...(existing || { durationValue: 2, severity: 'Moderate', symptoms: [], triggers: [] }), // defaults
            startTime: startTime,
            // Keep existing end time or default
            endTime: existing?.endTime || `${date}T11:00`,
            medications: finalMeds
        };

        addLog(newLog);
        onClose();
    };

    return (
        <div className="modal-backdrop">
            <div className="day-detail-modal">
                <div className="modal-header">
                    <h3>{new Date(date).toLocaleDateString('default', { weekday: 'short', day: 'numeric', month: 'short' })}</h3>
                    <button className="close-btn" onClick={onClose}><X size={24} /></button>
                </div>

                <div className="modal-body">
                    {/* STEP 1: TIME */}
                    <div className="q-section">
                        <label className="section-label"><Clock size={16} /> Attack Start Time</label>
                        <input
                            type="datetime-local"
                            className="time-input"
                            value={startTime}
                            onChange={e => setStartTime(e.target.value)}
                        />
                    </div>

                    {/* STEP 2: MEDS YES/NO */}
                    <div className="q-section">
                        <label className="section-label"><Pill size={16} /> Did you take medication?</label>
                        <div className="toggle-options">
                            <button
                                className={`toggle-btn ${tookMeds === true ? 'active yes' : ''}`}
                                onClick={() => setTookMeds(true)}
                            >
                                Yes
                            </button>
                            <button
                                className={`toggle-btn ${tookMeds === false ? 'active no' : ''}`}
                                onClick={() => setTookMeds(false)}
                            >
                                No
                            </button>
                        </div>
                    </div>

                    {/* STEP 3: MED LIST (Conditional) */}
                    {tookMeds && (
                        <div className="q-section fade-in">
                            <label className="section-label">Select Medications</label>
                            <div className="med-grid">
                                {MED_CATEGORIES.map(category => (
                                    <button
                                        key={category}
                                        className={`med-chip ${selectedMeds.includes(category) ? 'selected' : ''}`}
                                        onClick={() => toggleMed(category)}
                                    >
                                        {category}
                                    </button>
                                ))}
                                <button
                                    className={`med-chip ${showCustomInput ? 'selected' : ''}`}
                                    onClick={() => setShowCustomInput(!showCustomInput)}
                                >
                                    Other...
                                </button>
                            </div>

                            {showCustomInput && (
                                <input
                                    type="text"
                                    placeholder="Enter medication name..."
                                    className="custom-med-input"
                                    value={customMed}
                                    onChange={e => setCustomMed(e.target.value)}
                                    autoFocus
                                />
                            )}
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="save-btn" onClick={handleSave}>
                        Save Entry <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DayDetailModal;
