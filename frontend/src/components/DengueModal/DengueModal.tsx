"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { AlertTriangle, Calendar, MapPin, User, X, Edit2, Save, XCircle, Trash2 } from "lucide-react"
import "./DengueModal.css"

interface FocoDengueProps {
  id: string
  address: string
  latitude: number
  longitude: number
  riskLevel: "alto_risco" | "medio_risco" | "baixo_risco"
  description: string
  reportDate: string
  reportadoPor: string
  photoUrl?: string
}

interface FocoDengueModalProps {
  foco: FocoDengueProps | null
  isOpen: boolean
  onClose: () => void
  onUpdateFoco?: (focoId: string, updates: Partial<FocoDengueProps>) => Promise<void>
  onDeleteFoco?: (focoId: string) => Promise<void>
}

const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem('authToken')
  } catch (error) {
    console.error('Erro ao obter token de autenticação:', error)
    return null
  }
}

const updateFocoBackend = async (focoId: string, updates: { description?: string; riskLevel?: string }): Promise<void> => {
  const token = getAuthToken()
  if (!token) {
    throw new Error('Token de autenticação não encontrado')
  }

  const response = await fetch(`http://localhost:3000/api/v1/dengue-focuses/${focoId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(updates)
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `Erro HTTP: ${response.status}`)
  }

  return response.json()
}

const deleteFocoBackend = async (focoId: string): Promise<void> => {
  const token = getAuthToken()
  if (!token) {
    throw new Error('Token de autenticação não encontrado')
  }

  const response = await fetch(`http://localhost:3000/api/v1/dengue-focuses/${focoId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `Erro HTTP: ${response.status}`)
  }
}

export default function FocoDengueModal({ foco, isOpen, onClose, onUpdateFoco, onDeleteFoco }: FocoDengueModalProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [editingRisk, setEditingRisk] = useState(false)
  const [editingDescription, setEditingDescription] = useState(false)
  const [tempRiskLevel, setTempRiskLevel] = useState<"alto_risco" | "medio_risco" | "baixo_risco">("baixo_risco")
  const [tempDescription, setTempDescription] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const [localFoco, setLocalFoco] = useState<FocoDengueProps | null>(foco)
  
  const currentFocoIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (foco && foco.id !== currentFocoIdRef.current) {
      setLocalFoco(foco)
      setEditingRisk(false)
      setEditingDescription(false)
      setUpdateError(null)
      setDeleteError(null)
      setImageLoaded(false)
      setImageError(false)
      currentFocoIdRef.current = foco.id
    } else if (foco && foco.id === currentFocoIdRef.current) {
      setLocalFoco(foco)
    }
  }, [foco])

  useEffect(() => {
    if (!isOpen) {
      setEditingRisk(false)
      setEditingDescription(false)
      setUpdateError(null)
      setDeleteError(null)
      setShowDeleteConfirm(false)
      currentFocoIdRef.current = null
    }
  }, [isOpen])

  useEffect(() => {
    if (localFoco && isOpen) {
      console.log('Dados do foco no modal:', {
        id: localFoco.id,
        photoUrl: localFoco.photoUrl,
        address: localFoco.address,
        reportadoPor: localFoco.reportadoPor
      })
    }
  }, [localFoco, isOpen])

  useEffect(() => {
    if (localFoco && isOpen) {
      try {
        const userData = localStorage.getItem('userData')
        if (userData) {
          const user = JSON.parse(userData)
          setIsOwner(user.name === localFoco.reportadoPor)
          console.log(`Verificação de propriedade: ${user.name} === ${localFoco.reportadoPor} = ${user.name === localFoco.reportadoPor}`)
        }
      } catch (error) {
        console.error('Erro ao verificar dados do usuário:', error)
        setIsOwner(false)
      }
    }
  }, [localFoco, isOpen])

  if (!localFoco || !isOpen) return null

  const getRiscoClass = (risco: string) => {
    switch (risco) {
      case "alto_risco":
        return "risco-alto"
      case "medio_risco":
        return "risco-medio"
      case "baixo_risco":
        return "risco-baixo"
      default:
        return ""
    }
  }

  const getRiscoIcon = (risco: string) => {
    switch (risco) {
      case "alto_risco":
        return "🔴"
      case "medio_risco":
        return "🟡"
      case "baixo_risco":
        return "🟢"
      default:
        return "⚪"
    }
  }

  const formatarData = (data: string) => {
    try {
      return new Date(data).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      return data
    }
  }

  const riscoClass = getRiscoClass(localFoco.riskLevel)
  const riscoIcon = getRiscoIcon(localFoco.riskLevel)

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleImageLoad = () => {
    setImageLoaded(true)
    setImageError(false)
  }

  const handleImageError = () => {
    setImageError(true)
    setImageLoaded(false)
  }

  const handleEditRisk = () => {
    setTempRiskLevel(localFoco.riskLevel)
    setEditingRisk(true)
    setUpdateError(null)
  }

  const handleEditDescription = () => {
    setTempDescription(localFoco.description)
    setEditingDescription(true)
    setUpdateError(null)
  }

  const handleSaveRisk = async () => {
    if (tempRiskLevel === localFoco.riskLevel) {
      setEditingRisk(false)
      return
    }

    setIsUpdating(true)
    setUpdateError(null)
    
    try {
      console.log(`Atualizando grau de risco do foco ${localFoco.id}: ${localFoco.riskLevel} -> ${tempRiskLevel}`)
      
      await updateFocoBackend(localFoco.id, { riskLevel: tempRiskLevel })
      
      const updatedFoco = { ...localFoco, riskLevel: tempRiskLevel }
      setLocalFoco(updatedFoco)
      
      if (onUpdateFoco) {
        await onUpdateFoco(localFoco.id, { riskLevel: tempRiskLevel })
        console.log(`Callback onUpdateFoco chamado para foco ${localFoco.id}`)
      }
      
      setEditingRisk(false)
      console.log(`Grau de risco atualizado com sucesso: ${tempRiskLevel}`)
    } catch (error) {
      console.error('Erro ao atualizar grau de risco:', error)
      setUpdateError(error instanceof Error ? error.message : 'Erro ao atualizar grau de risco')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSaveDescription = async () => {
    if (tempDescription.trim() === localFoco.description.trim()) {
      setEditingDescription(false)
      return
    }

    setIsUpdating(true)
    setUpdateError(null)
    
    try {
      console.log(`Atualizando descrição do foco ${localFoco.id}`)
      
      await updateFocoBackend(localFoco.id, { description: tempDescription.trim() })
      
      const updatedFoco = { ...localFoco, description: tempDescription.trim() }
      setLocalFoco(updatedFoco)
      
      if (onUpdateFoco) {
        await onUpdateFoco(localFoco.id, { description: tempDescription.trim() })
        console.log(`Callback onUpdateFoco chamado para foco ${localFoco.id}`)
      }
      
      setEditingDescription(false)
      console.log('Descrição atualizada com sucesso')
    } catch (error) {
      console.error('Erro ao atualizar descrição:', error)
      setUpdateError(error instanceof Error ? error.message : 'Erro ao atualizar descrição')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCancelRisk = () => {
    setEditingRisk(false)
    setTempRiskLevel(localFoco.riskLevel)
    setUpdateError(null)
  }

  const handleCancelDescription = () => {
    setEditingDescription(false)
    setTempDescription(localFoco.description)
    setUpdateError(null)
  }

  const handleDeleteFoco = async () => {
    setIsDeleting(true)
    setDeleteError(null)
    
    try {
      console.log(`Excluindo foco ${localFoco.id}`)
      
      await deleteFocoBackend(localFoco.id)
      
      if (onDeleteFoco) {
        await onDeleteFoco(localFoco.id)
        console.log(`Callback onDeleteFoco chamado para foco ${localFoco.id}`)
      }
      
      console.log('Foco excluído com sucesso')
      setShowDeleteConfirm(false)
      onClose()
    } catch (error) {
      console.error('Erro ao excluir foco:', error)
      setDeleteError(error instanceof Error ? error.message : 'Erro ao excluir foco')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false)
    setDeleteError(null)
  }

  return (
    <div 
      className="modal-backdrop"
      onClick={handleBackdropClick}
    >
      <div className="modal-container">
        <div className={`modal-header ${riscoClass}`}>
          <div className="modal-header-backdrop"></div>
          <div className="modal-title">
            <div className="icon-container">
              <AlertTriangle className="icon-alert" />
            </div>
            <div>
              <h2 className="title-text">Detalhes do Foco de Dengue</h2>
              <p className="subtitle-text">ID: #{localFoco.id}</p>
            </div>
            {isOwner && (
              <button 
                onClick={() => setShowDeleteConfirm(true)} 
                className="btn-delete-header"
                title="Excluir foco"
                disabled={isUpdating || isDeleting}
              >
                <Trash2 className="icon-delete" />
              </button>
            )}
          </div>
        </div>

        <div className="modal-content">
          <div className="modal-body">
            {updateError && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '0.5rem',
                padding: '0.75rem',
                marginBottom: '1rem',
                color: '#dc2626',
                fontSize: '0.875rem'
              }}>
                <strong>Erro:</strong> {updateError}
              </div>
            )}

            <div className="risco-container">
              <div className="risco-card">
                <span className="risco-icon">{riscoIcon}</span>
                <div>
                  <p className="risco-label">Grau de Risco</p>
                  {editingRisk ? (
                    <div className="edit-risk-container">
                      <select 
                        value={tempRiskLevel} 
                        onChange={(e) => setTempRiskLevel(e.target.value as "alto_risco" | "medio_risco" | "baixo_risco")}
                        className="risk-select"
                        disabled={isUpdating}
                      >
                        <option value="baixo_risco">Baixo Risco</option>
                        <option value="medio_risco">Médio Risco</option>
                        <option value="alto_risco">Alto Risco</option>
                      </select>
                      <div className="edit-buttons">
                        <button 
                          onClick={handleSaveRisk} 
                          className="btn-save"
                          disabled={isUpdating}
                        >
                          {isUpdating ? (
                            <div style={{
                              width: "1rem",
                              height: "1rem",
                              border: "2px solid #ffffff",
                              borderTop: "2px solid transparent",
                              borderRadius: "50%",
                              animation: "spin 1s linear infinite"
                            }}></div>
                          ) : (
                            <Save className="icon-edit" />
                          )}
                        </button>
                        <button 
                          onClick={handleCancelRisk} 
                          className="btn-cancel"
                          disabled={isUpdating}
                        >
                          <XCircle className="icon-edit" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="risk-display">
                      <span className={`risco-badge ${riscoClass}`}>
                        {localFoco.riskLevel === "alto_risco"
                          ? "Alto Risco"
                          : localFoco.riskLevel === "medio_risco"
                            ? "Médio Risco"
                            : "Baixo Risco"}
                      </span>
                      {isOwner && (
                        <button 
                          onClick={handleEditRisk} 
                          className="btn-edit"
                          disabled={isUpdating || isDeleting}
                        >
                          <Edit2 className="icon-edit" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="foto-container">
              <h3 className="section-title">
                📸 Evidência Fotográfica
              </h3>
              {localFoco.photoUrl ? (
                <div className="foto-wrapper">
                  <div className={`foto-overlay ${imageLoaded ? 'loaded' : ''}`}></div>
                  {!imageLoaded && !imageError && (
                    <div className="foto-loading">
                      <div className="loading-text">
                        <div style={{
                          width: "2rem",
                          height: "2rem",
                          border: "4px solid #e5e7eb",
                          borderTop: "4px solid #3b82f6",
                          borderRadius: "50%",
                          animation: "spin 1s linear infinite",
                          margin: "0 auto 0.5rem"
                        }}></div>
                        <p>Carregando imagem...</p>
                      </div>
                    </div>
                  )}
                  {imageError ? (
                    <div className="foto-placeholder">
                      <div className="placeholder-icon">📷</div>
                      <p className="placeholder-title">Erro ao carregar imagem</p>
                      <p className="placeholder-subtitle">Verifique a conexão ou tente novamente</p>
                    </div>
                  ) : (
                    <img
                      src={localFoco.photoUrl}
                      alt="Foto do foco de dengue"
                      className={`foto-image ${imageLoaded ? 'loaded' : ''}`}
                      style={{ width: "100%", height: "100%" }}
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                    />
                  )}
                </div>
              ) : (
                <div className="foto-placeholder">
                  <div className="placeholder-icon">📷</div>
                  <p className="placeholder-title">Sem foto disponível</p>
                  <p className="placeholder-subtitle">Nenhuma evidência fotográfica foi fornecida</p>
                </div>
              )}
            </div>

            <div className="info-card">
              <h3 className="section-title">
                📍 Localização
              </h3>
              <div className="location-content">
                <div className="address-container">
                  <MapPin className="address-icon" />
                  <div>
                    <p className="address-label">Endereço</p>
                    <p className="address-text">{localFoco.address}</p>
                  </div>
                </div>

                <div className="coordinates-container">
                  <div className="coordinate-card latitude">
                    <p className="coordinate-label latitude">Latitude</p>
                    <p className="coordinate-value latitude">{localFoco.latitude}°</p>
                  </div>
                  <div className="coordinate-card longitude">
                    <p className="coordinate-label longitude">Longitude</p>
                    <p className="coordinate-value longitude">{localFoco.longitude}°</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="info-card">
              <div className="section-header">
                <h3 className="section-title">
                  📝 Descrição Detalhada
                </h3>
                {isOwner && !editingDescription && (
                  <button 
                    onClick={handleEditDescription} 
                    className="btn-edit"
                    disabled={isUpdating || isDeleting}
                  >
                    <Edit2 className="icon-edit" />
                  </button>
                )}
              </div>
              <div className="description-container">
                {editingDescription ? (
                  <div className="edit-description-container">
                    <textarea
                      value={tempDescription}
                      onChange={(e) => setTempDescription(e.target.value)}
                      className="description-textarea"
                      rows={4}
                      disabled={isUpdating}
                      placeholder="Descreva o foco de dengue..."
                    />
                    <div className="edit-buttons">
                      <button 
                        onClick={handleSaveDescription} 
                        className="btn-save"
                        disabled={isUpdating}
                      >
                        {isUpdating ? (
                          <>
                            <div style={{
                              width: "1rem",
                              height: "1rem",
                              border: "2px solid #ffffff",
                              borderTop: "2px solid transparent",
                              borderRadius: "50%",
                              animation: "spin 1s linear infinite",
                              marginRight: "0.5rem"
                            }}></div>
                            Salvando...
                          </>
                        ) : (
                          <>
                            <Save className="icon-edit" />
                            Salvar
                          </>
                        )}
                      </button>
                      <button 
                        onClick={handleCancelDescription} 
                        className="btn-cancel"
                        disabled={isUpdating}
                      >
                        <XCircle className="icon-edit" />
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="description-text">{localFoco.description}</p>
                )}
              </div>
            </div>

            <div className="info-card">
              <h3 className="section-title">
                ℹ️ Informações do Reporte
              </h3>
              <div className="report-info-container">
                <div className="report-card date">
                  <div className="report-header">
                    <Calendar className="report-icon date" />
                    <span className="report-label date">Data de Reporte</span>
                  </div>
                  <p className="report-value date">{formatarData(localFoco.reportDate)}</p>
                </div>
                <div className="report-card reporter">
                  <div className="report-header">
                    <User className="report-icon reporter" />
                    <span className="report-label reporter">Reportado Por</span>
                  </div>
                  <p className="report-value reporter">{localFoco.reportadoPor}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="btn-fechar"
            onClick={onClose}
            disabled={isUpdating || isDeleting}
          >
            <X className="icon-fechar" />
            Fechar
          </button>
        </div>

        {showDeleteConfirm && (
          <div className="delete-modal-backdrop">
            <div className="delete-modal">
              <div className="delete-modal-header">
                <div className="delete-icon-container">
                  <Trash2 className="delete-icon" />
                </div>
                <h3 className="delete-title">Confirmar Exclusão</h3>
                <p className="delete-subtitle">
                  Tem certeza que deseja excluir este foco de dengue? Esta ação não pode ser desfeita.
                </p>
                <div className="delete-info">
                  <p><strong>ID:</strong> #{localFoco.id}</p>
                  <p><strong>Local:</strong> {localFoco.address}</p>
                  <p><strong>Risco:</strong> {
                    localFoco.riskLevel === "alto_risco" ? "Alto Risco" :
                    localFoco.riskLevel === "medio_risco" ? "Médio Risco" : "Baixo Risco"
                  }</p>
                </div>
                {deleteError && (
                  <div style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    marginTop: '1rem',
                    color: '#dc2626',
                    fontSize: '0.875rem'
                  }}>
                    <strong>Erro:</strong> {deleteError}
                  </div>
                )}
              </div>
              <div className="delete-modal-footer">
                <button 
                  onClick={handleCancelDelete}
                  className="btn-cancel-delete"
                  disabled={isDeleting}
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleDeleteFoco}
                  className="btn-confirm-delete"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <div className="delete-spinner"></div>
                      Excluindo...
                    </>
                  ) : (
                    <>
                      <Trash2 className="icon-delete" />
                      Excluir
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}