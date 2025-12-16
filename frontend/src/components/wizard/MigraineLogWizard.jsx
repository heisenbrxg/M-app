import React, { useState } from 'react';
import { X, Plus, ChevronLeft, Check, Calendar, Clock } from 'lucide-react';
import { useMigraineData } from '../../context/MigraineContext';
import './MigraineLogWizard.css';

const STEPS = [
    { id: 'time', title: 'Start & End' },
    { id: 'duration', title: 'Duration' },
    { id: 'severity', title: 'Severity' },
    { id: 'symptoms', title: 'Symptoms' },
    { id: 'triggers', title: 'Triggers' },
    { id: 'medication', title: 'Medications' },
    { id: 'relief', title: 'Relief Methods' },
    { id: 'notes', title: 'Notes' },
];

const getCurrentDateTime = () => {
    const now = new Date();
    // Format: YYYY-MM-DDThh:mm for datetime-local
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
};

const INITIAL_DATA = {
    startTime: getCurrentDateTime(),
    endTime: getCurrentDateTime(),
    durationValue: '',
    durationUnit: 'hours',
    severity: '',
    symptoms: [],
    triggers: [],
    medications: [],
    reliefMethods: [],
    notes: '',
};

// Pre-defined options
const OPTIONS = {
    symptoms: [
        'Throbbing or pulsating head pain', 'Sensitivity to light (photophobia)',
        'Sensitivity to sound (phonophobia)', 'Nausea and vomiting',
        'Visual disturbances (aura)', 'Sensitivity to smell (osmophobia)',
        'Neck pain or stiffness', 'Brain fog or difficulty concentrating',
        'Dizziness or lightheadedness', 'Fatigue and exhaustion'
    ],
    triggers: [
        'Stress and anxiety', 'Skipped meals or fasting', 'Dehydration',
        'Sleep changes', 'Bright or flickering lights', 'Strong smells',
        'Hormonal changes', 'Certain foods and drinks', 'Caffeine changes',
        'Weather changes', 'Physical exertion', 'Medication overuse'
    ],
    medications: [
        'Triptans (e.g., Sumatriptan)', 'NSAIDs (e.g., Ibuprofen)',
        'Acetaminophen (Paracetamol)', 'Anti-nausea medications',
        'Gepants (e.g., Ubrogepant)', 'Ditans (e.g., Lasmiditan)',
        'Ergotamines', 'Combination pain relievers'
    ],
    reliefMethods: [
        'Resting in a dark, quiet room', 'Applying a cold compress',
        'Caffeine in small amounts', 'Hydrating with water', 'Sleeping',
        'Gentle head massage', 'Deep breathing or relaxation',
        'Acupressure', 'Aromatherapy', 'Gentle neck stretches'
    ]
};

const MigraineLogWizard = ({ onClose }) => {
    const { addLog } = useMigraineData();
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState(INITIAL_DATA);
    const [customModalOpen, setCustomModalOpen] = useState(false);
    const [customInput, setCustomInput] = useState('');
    const [customOptions, setCustomOptions] = useState({
        symptoms: [], triggers: [], medications: [], reliefMethods: []
    });

    const stepInfo = STEPS[currentStep];

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(curr => curr + 1);
        } else {
            addLog(formData);
            onClose();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(curr => curr - 1);
        }
    };

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleSelection = (field, item) => {
        setFormData(prev => {
            const list = prev[field] || [];
            if (list.includes(item)) {
                return { ...prev, [field]: list.filter(i => i !== item) };
            }
            return { ...prev, [field]: [...list, item] };
        });
    };

    const handleAddCustom = () => {
        if (!customInput.trim()) return;
        const category = stepInfo.id; // symptoms, triggers, etc.

        // Add to custom options list for this category
        setCustomOptions(prev => ({
            ...prev,
            [category]: [...(prev[category] || []), customInput]
        }));

        // Automatically select the new option
        toggleSelection(category, customInput);

        setCustomInput('');
        setCustomModalOpen(false);
    };

    const renderContent = () => {
        switch (stepInfo.id) {
            case 'time':
                return (
                    <>
                        <h2 className="question-title">When did the attack start and end?</h2>

                        <div className="input-group">
                            <label className="input-label">Start Date & Time</label>
                            <div className="date-input-wrapper">
                                <Calendar className="input-icon" size={20} />
                                <input
                                    type="datetime-local"
                                    className="date-input"
                                    value={formData.startTime}
                                    onChange={(e) => updateField('startTime', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="input-label">End Date & Time</label>
                            <div className="date-input-wrapper">
                                <Clock className="input-icon" size={20} />
                                <input
                                    type="datetime-local"
                                    className="date-input"
                                    value={formData.endTime}
                                    onChange={(e) => updateField('endTime', e.target.value)}
                                />
                            </div>
                        </div>
                    </>
                );

            case 'duration':
                return (
                    <>
                        <h2 className="question-title">How long did the pain last?</h2>
                        <div className="duration-input-container">
                            <input
                                type="number"
                                placeholder="e.g., 4"
                                value={formData.durationValue}
                                onChange={(e) => updateField('durationValue', e.target.value)}
                            />
                            <select
                                value={formData.durationUnit}
                                onChange={(e) => updateField('durationUnit', e.target.value)}
                            >
                                <option value="hours">hours</option>
                                <option value="days">days</option>
                            </select>
                        </div>
                    </>
                );

            case 'severity':
                return (
                    <>
                        <h2 className="question-title">How painful was the attack?</h2>
                        <div className="severity-options">
                            {['Mild', 'Moderate', 'Severe'].map(level => (
                                <button
                                    key={level}
                                    className={`severity-btn ${formData.severity === level ? 'selected' : ''}`}
                                    onClick={() => updateField('severity', level)}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </>
                );

            case 'symptoms':
            case 'triggers':
            case 'medication':
            case 'relief':
                // Generic List Logic
                const categoryKey = stepInfo.id === 'medication' ? 'medications' :
                    stepInfo.id === 'relief' ? 'reliefMethods' : stepInfo.id;

                const questionMap = {
                    symptoms: "What were your symptoms?",
                    triggers: "What could have triggered the attack?",
                    medications: "Which acute medication did you take?",
                    reliefMethods: "Which relief method did you use?"
                };

                const listOptions = [...OPTIONS[categoryKey], ...(customOptions[categoryKey] || [])];

                return (
                    <>
                        <h2 className="question-title">{questionMap[categoryKey]} <span style={{ fontSize: '16px', fontWeight: '400', color: '#8E8E93' }}>(Select all that apply)</span></h2>

                        <button className="add-custom-btn" onClick={() => setCustomModalOpen(true)}>
                            <Plus size={18} /> Add Custom {stepInfo.title.slice(0, -1)}
                        </button>

                        <div className="checkbox-list">
                            {listOptions.map(item => (
                                <label key={item} className={`checkbox-item ${formData[categoryKey]?.includes(item) ? 'selected' : ''}`}>
                                    <input
                                        type="checkbox"
                                        checked={formData[categoryKey]?.includes(item) || false}
                                        onChange={() => toggleSelection(categoryKey, item)}
                                    />
                                    {item}
                                </label>
                            ))}
                        </div>
                    </>
                );

            case 'notes':
                return (
                    <>
                        <h2 className="question-title">Write additional notes if necessary</h2>
                        <textarea
                            className="full-notes"
                            placeholder="E.g., Pain was on the left side. Tried a hot shower, which helped slightly."
                            value={formData.notes}
                            onChange={(e) => updateField('notes', e.target.value)}
                        />
                    </>
                );

            default:
                return null;
        }
    };

    return (
        <div className="wizard-overlay">
            {/* Header */}
            <div className="wizard-header">
                <span className="progress-indicator">Step {currentStep + 1} of {STEPS.length}</span>
                <button className="wizard-close" onClick={onClose}><X size={24} /></button>
            </div>

            {/* Content */}
            <div className="wizard-content">
                {renderContent()}
            </div>

            {/* Footer */}
            <div className="wizard-footer">
                {currentStep > 0 ? (
                    <button className="nav-btn back" onClick={handleBack}>Back</button>
                ) : <div />} {/* Spacer */}

                <button className="nav-btn next" onClick={handleNext}>
                    {currentStep === STEPS.length - 1 ? 'Save Log' : 'Next'}
                </button>
            </div>

            {/* Custom Input Modal */}
            {customModalOpen && (
                <div className="modal-overlay">
                    <div className="custom-input-modal">
                        <h3 className="modal-title">Add Custom Option</h3>
                        <input
                            type="text"
                            className="date-input"
                            autoFocus
                            placeholder="Type here..."
                            value={customInput}
                            onChange={(e) => setCustomInput(e.target.value)}
                        />
                        <div className="modal-actions">
                            <button className="nav-btn back" style={{ padding: '10px 20px' }} onClick={() => setCustomModalOpen(false)}>Cancel</button>
                            <button className="nav-btn next" style={{ padding: '10px 20px', marginLeft: 0 }} onClick={handleAddCustom}>Add</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MigraineLogWizard;
