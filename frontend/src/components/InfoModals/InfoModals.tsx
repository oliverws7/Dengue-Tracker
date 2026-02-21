"use client"

import React from "react"
import { X, Thermometer, ShieldCheck, AlertCircle, Droplets, Bug, Home, Heart } from "lucide-react"
import "./InfoModals.css"

interface ModalProps {
    isOpen: boolean
    onClose: () => void
}

export const SymptomsModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose()
    }

    const symptoms = [
        { title: "Febre Alta", desc: "Início repentino (39°C a 40°C), geralmente durando de 2 a 7 dias." },
        { title: "Dores no Corpo", desc: "Dores intensas nas articulações, músculos e atrás dos olhos." },
        { title: "Dor de Cabeça", desc: "Frequentemente sentida como uma pressão forte na região frontal." },
        { title: "Manchas Vermelhas", desc: "Erupções cutâneas que podem coçar, surgindo em várias partes do corpo." },
        { title: "Fadiga e Mal-estar", desc: "Cansaço extremo, prostração e perda de apetite." },
        { title: "Sintomas Gastrointestinais", desc: "Náuseas, vômitos e, em alguns casos, dor abdominal suave." },
    ]

    return (
        <div className="info-modal-overlay" onClick={handleBackdropClick}>
            <div className="info-modal-content">
                <button className="info-close-button" onClick={onClose}>
                    <X size={18} />
                </button>

                <div className="info-modal-header">
                    <div className="info-modal-title">
                        <Thermometer className="title-icon symptoms" size={28} />
                        <span>Principais Sintomas</span>
                    </div>
                    <p className="info-modal-subtitle">
                        A dengue pode se manifestar de forma leve ou grave. Fique atento aos sinais do seu corpo.
                    </p>
                </div>

                <div className="info-modal-body">
                    <div className="info-section">
                        <ul className="info-list">
                            {symptoms.map((item, index) => (
                                <li key={index} className="info-item">
                                    <div className="item-bullet bullet-symptoms" />
                                    <div className="item-content">
                                        <span className="item-title">{item.title}</span>
                                        <span className="item-desc">{item.desc}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="emergency-notice">
                        <AlertCircle className="emergency-icon" size={20} />
                        <div>
                            <p>Sinais de Alerta (Procure um médico imediatamente):</p>
                            <p style={{ marginTop: '4px', opacity: 0.9 }}>
                                Dor abdominal intensa, vômitos persistentes, sangramento de mucosas ou tontura ao levantar.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export const PreventionModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose()
    }

    const tips = [
        {
            icon: <Droplets size={18} />,
            title: "Elimine Água Parada",
            desc: "Verifique vasos de plantas, pneus, garrafas e qualquer recipiente que possa acumular água."
        },
        {
            icon: <Home size={18} />,
            title: "Cuidado com a Casa",
            desc: "Mantenha caixas d'água vedadas, calhas limpas e ralos fechados ou com telas."
        },
        {
            icon: <Bug size={18} />,
            title: "Proteção Individual",
            desc: "Use repelentes recomendados, instale telas em janelas e use roupas que cubram a pele."
        },
        {
            icon: <Heart size={18} />,
            title: "Conscientização",
            desc: "Ajude seus vizinhos a identificar possíveis focos. O combate é um esforço coletivo."
        }
    ]

    return (
        <div className="info-modal-overlay" onClick={handleBackdropClick}>
            <div className="info-modal-content">
                <button className="info-close-button" onClick={onClose}>
                    <X size={18} />
                </button>

                <div className="info-modal-header">
                    <div className="info-modal-title">
                        <ShieldCheck className="title-icon prevention" size={28} />
                        <span>Como se Prevenir</span>
                    </div>
                    <p className="info-modal-subtitle">
                        Pequenas atitudes diárias fazem toda a diferença para evitar a proliferação do mosquito Aedes aegypti.
                    </p>
                </div>

                <div className="info-modal-body">
                    <div className="info-section">
                        <ul className="info-list">
                            {tips.map((item, index) => (
                                <li key={index} className="info-item">
                                    <div style={{ color: '#10b981', marginTop: '4px' }}>{item.icon}</div>
                                    <div className="item-content">
                                        <span className="item-title">{item.title}</span>
                                        <span className="item-desc">{item.desc}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="info-section" style={{ marginTop: '24px', textAlign: 'center' }}>
                        <p style={{ fontSize: '14px', color: '#6b7280', fontStyle: 'italic' }}>
                            "10 minutos por semana são suficientes para vistoriar sua casa e eliminar focos."
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
