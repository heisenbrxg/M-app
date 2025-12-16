import React from 'react';
import { X, Calendar, Clock, Activity, AlertCircle, FileText, Pill, Zap } from 'lucide-react';
import './LogDetailsModal.css';

const LogDetailsModal = ({ log, onClose }) => {
    if (!log) return null;

    const formatDate = (isoString) => {
        if (!isoString) return '-';
        // Parse ISO string properly (it has local time usually in our app logic)
        const date = new Date(isoString);
        return date.toLocaleDateString('default', {
            weekday: 'short',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
        });
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="log-modal-content" onClick={e => e.stopPropagation()}>
                <div className="log-modal-header">
                    <h3>Attack Summary</h3>
                    <button className="close-btn" onClick={onClose}><X size={24} /></button>
                </div>

                <div className="log-summary-body">
                    {/* 1. Date & Severity Header */}
                    <div className="summary-section highlight">
                        <div className="summary-row">
                            <span className="label"><Calendar size={16} /> Start Date</span>
                            <span className="value">{formatDate(log.startTime)}</span>
                        </div>
                        <div className="summary-row">
                            <span className="label"><Activity size={16} /> Intensity</span>
                            <span className={`value tag ${log.severity?.toLowerCase()}`}>{log.severity || '-'}</span>
                        </div>
                        <div className="summary-row">
                            <span className="label"><Clock size={16} /> Duration</span>
                            <span className="value">{log.durationValue ? `${log.durationValue} ${log.durationUnit || 'hours'}` : '-'}</span>
                        </div>
                    </div>

                    {/* 2. Details List */}
                    <div className="summary-section">
                        <div className="summary-item">
                            <span className="label-block"><AlertCircle size={14} /> Symptoms</span>
                            <p className="text-block">{log.symptoms?.length ? log.symptoms.join(', ') : 'None recorded'}</p>
                        </div>

                        <div className="summary-item">
                            <span className="label-block"><Zap size={14} /> Triggers</span>
                            <p className="text-block">{log.triggers?.length ? log.triggers.join(', ') : 'None recorded'}</p>
                        </div>

                        <div className="summary-item">
                            <span className="label-block"><Pill size={14} /> Medication</span>
                            <p className="text-block">{log.medications?.length ? log.medications.join(', ') : 'None recorded'}</p>
                        </div>

                        <div className="summary-item">
                            <span className="label-block"><FileText size={14} /> Notes</span>
                            <p className="text-block notes">{log.notes || 'No notes added.'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LogDetailsModal;
