"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { MapPin, Search, Camera, Upload, AlertTriangle, X, Loader2, CheckCircle, XCircle } from "lucide-react"
import { API_URL } from "../../config/api"
import "./DengueFocusModal.css"

interface DengueFocusModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (focusData: any) => void
}

interface LeafletMap {
  setView: (latlng: [number, number], zoom: number) => void
  on: (event: string, callback: (e: any) => void) => void
  remove: () => void
}

interface LeafletMarker {
  setLatLng: (latlng: [number, number]) => void
  remove: () => void
}

const LeafletMap: React.FC<{
  address: string
  onLocationSelect: (lat: number, lng: number, address: string) => void
  selectedLocation: { lat: number; lng: number } | null
}> = ({ address, onLocationSelect, selectedLocation }) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<LeafletMap | null>(null)
  const markerRef = useRef<LeafletMarker | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const geocodeAddress = async (address: string) => {
    if (!address.trim()) return null

    try {
      setIsLoading(true)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=br`,
      )
      const data = await response.json()

      if (data && data.length > 0) {
        return {
          lat: Number.parseFloat(data[0].lat),
          lng: Number.parseFloat(data[0].lon),
          display_name: data[0].display_name,
        }
      }
      return null
    } catch (error) {
      console.error("Erro na geocodificação:", error)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      )
      const data = await response.json()

      if (data && data.display_name) {
        return data.display_name
      }
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    } catch (error) {
      console.error("Erro na geocodificação reversa:", error)
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    }
  }

  useEffect(() => {
    if (!mapRef.current) return

    const loadLeaflet = async () => {
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        document.head.appendChild(link)
      }

      if (!(window as any).L) {
        await new Promise((resolve) => {
          const script = document.createElement("script")
          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          script.onload = resolve
          document.head.appendChild(script)
        })
      }

      const L = (window as any).L

      const map = L.map(mapRef.current).setView([-23.5505, -46.6333], 13)

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map)

      map.on("click", async (e: any) => {
        const { lat, lng } = e.latlng
        const address = await reverseGeocode(lat, lng)
        onLocationSelect(lat, lng, address)
      })

      mapInstanceRef.current = map
    }

    loadLeaflet()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
      }
    }
  }, [])

  useEffect(() => {
    if (!mapInstanceRef.current || !selectedLocation) return

    const L = (window as any).L
    if (!L) return

    if (markerRef.current) {
      markerRef.current.remove()
    }

    const marker = L.marker([selectedLocation.lat, selectedLocation.lng]).addTo(mapInstanceRef.current)
    markerRef.current = marker

    mapInstanceRef.current.setView([selectedLocation.lat, selectedLocation.lng], 16)
  }, [selectedLocation])

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (address.length > 10) {
        const result = await geocodeAddress(address)
        if (result) {
          onLocationSelect(result.lat, result.lng, address)
        }
      }
    }, 1000)

    return () => clearTimeout(timeoutId)
  }, [address])

  return (
    <div className="map-container">
      <div ref={mapRef} className="map" />
      {isLoading && (
        <div className="map-loading">
          <div className="loading-content">
            <Loader2 className="animate-spin" size={20} />
            <span>Buscando localização...</span>
          </div>
        </div>
      )}
      <div className="map-hint">Clique no mapa para selecionar ou digite o endereço</div>
    </div>
  )
}

const DengueFocusModal: React.FC<DengueFocusModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [address, setAddress] = useState("")
  const [description, setDescription] = useState("")
  const [riskLevel, setRiskLevel] = useState("")
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocalização não é suportada neste navegador")
      return
    }

    setIsGettingLocation(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
          )
          const data = await response.json()

          const currentAddress = data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`

          setAddress(currentAddress)
          setSelectedLocation({ lat: latitude, lng: longitude })
        } catch (error) {
          console.error("Erro ao obter endereço:", error)
          setAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`)
          setSelectedLocation({ lat: latitude, lng: longitude })
        } finally {
          setIsGettingLocation(false)
        }
      },
      (error) => {
        setIsGettingLocation(false)
        let errorMessage = "Erro ao obter localização"

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Permissão de localização negada. Permita o acesso à localização nas configurações do navegador."
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Localização indisponível no momento."
            break
          case error.TIMEOUT:
            errorMessage = "Tempo limite para obter localização excedido."
            break
        }

        alert(errorMessage)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    )
  }

  const handleLocationSelect = (lat: number, lng: number, newAddress: string) => {
    setSelectedLocation({ lat, lng })
    if (newAddress !== address) {
      setAddress(newAddress)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const mapRiskLevel = (risk: string) => {
    switch (risk) {
      case "alto":
        return "alto_risco"
      case "medio":
        return "medio_risco"
      case "baixo":
        return "baixo_risco"
      default:
        return risk
    }
  }

  const submitToAPI = async (focusData: any) => {
    const token = localStorage.getItem('authToken')

    if (!token) {
      throw new Error('Token de autenticação não encontrado. Faça login novamente.')
    }

    const url = `${API_URL}/dengue-focuses`

    if (focusData.photo) {
      const formData = new FormData()
      formData.append('latitude', focusData.location.lat.toString())
      formData.append('longitude', focusData.location.lng.toString())
      formData.append('description', focusData.description)
      formData.append('address', focusData.address)
      formData.append('riskLevel', mapRiskLevel(focusData.riskLevel))
      formData.append('photo', focusData.photo)

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } else {
      const jsonData = {
        latitude: focusData.location.lat,
        longitude: focusData.location.lng,
        description: focusData.description,
        address: focusData.address,
        riskLevel: mapRiskLevel(focusData.riskLevel)
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(jsonData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    }
  }

  const handleSubmit = async () => {
    if (!address || !description || !riskLevel || !selectedLocation) {
      alert("Por favor, preencha todos os campos obrigatórios e selecione uma localização no mapa")
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')

    const focusData = {
      address,
      description,
      riskLevel,
      location: selectedLocation,
      photo: selectedFile,
      timestamp: new Date().toISOString(),
    }

    try {
      const result = await submitToAPI(focusData)
      console.log("Foco registrado com sucesso:", result)

      setSubmitStatus('success')

      const enrichedFocusData = {
        ...focusData,
        apiResponse: result,
        photoUrl: result.data?.photoUrl,
        id: result.data?.id,
        reportadoPor: result.data?.user?.name || 'Você'
      }

      onSubmit(enrichedFocusData)

      setTimeout(() => {
        setAddress("")
        setDescription("")
        setRiskLevel("")
        setSelectedLocation(null)
        setSelectedFile(null)
        setPreviewUrl(null)
        setSubmitStatus('idle')
        onClose()
      }, 1500)

    } catch (error) {
      console.error("Erro ao registrar foco:", error)
      setSubmitStatus('error')
      alert(error instanceof Error ? error.message : "Erro ao registrar foco de dengue. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "alto_risco":
        return "risk-high"
      case "medio_risco":
        return "risk-medium"
      case "baixo_risco":
        return "risk-low"
      default:
        return "risk-default"
    }
  }

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case "alto":
        return <XCircle className="text-red-500" size={16} />
      case "medio":
        return <AlertTriangle className="text-yellow-500" size={16} />
      case "baixo":
        return <CheckCircle className="text-green-500" size={16} />
      default:
        return <AlertTriangle size={16} />
    }
  }

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  if (!isOpen) {
    return null
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <AlertTriangle className="text-orange-500" size={24} />
            Adicionar Novo Foco de Dengue
          </h2>
          <p className="modal-description">
            Registre um novo foco de dengue para monitoramento e controle epidemiológico.
          </p>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="address">Endereço do Foco *</label>
            <div className="input-container">
              <input
                id="address"
                type="text"
                placeholder="Digite o endereço completo (ex: Rua das Flores, 123, São Paulo - SP)"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="input-field"
              />
              <div className="input-actions">
                <button
                  type="button"
                  className="location-button"
                  onClick={getCurrentLocation}
                  disabled={isGettingLocation}
                  title="Usar minha localização atual"
                >
                  {isGettingLocation ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <MapPin size={16} />
                  )}
                  <span className="location-text">Atual</span>
                </button>
                <Search className="search-icon" size={16} />
              </div>
            </div>
            <p className="help-text">
              O mapa será atualizado automaticamente conforme você digita ou clique em "Atual" para usar sua localização
            </p>
          </div>

          <div className="form-group">
            <label>Localização no Mapa</label>
            <LeafletMap address={address} onLocationSelect={handleLocationSelect} selectedLocation={selectedLocation} />
            {selectedLocation && (
              <div className="coordinates">
                <MapPin size={16} />
                <span>
                  Coordenadas: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                </span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description">Descrição do Foco *</label>
            <textarea
              id="description"
              placeholder="Descreva as características do foco (tipo de recipiente, condições do local, etc.), deve ter no minimo 10 caracteres"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="textarea-field"
            />
          </div>

          <div className="form-group">
            <label>Foto do Local (Opcional)</label>
            <div className="photo-upload-container">
              <div className="upload-area">
                <label htmlFor="photo-upload" className="upload-label">
                  <div className="upload-content">
                    <Upload size={20} />
                    <span>{selectedFile ? selectedFile.name : "Clique para adicionar uma foto"}</span>
                  </div>
                </label>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="file-input"
                />
              </div>
              {previewUrl && (
                <div className="photo-preview">
                  <img src={previewUrl || "/placeholder.svg"} alt="Preview" />
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="risk-level">Nível de Risco *</label>
            <select
              id="risk-level"
              value={riskLevel}
              onChange={(e) => setRiskLevel(e.target.value)}
              className="select-field"
            >
              <option value="">Selecione o nível de risco</option>
              <option value="alto_risco">🔴 Alto Risco</option>
              <option value="medio_risco">🟡 Médio Risco</option>
              <option value="baixo_risco">🟢 Baixo Risco</option>
            </select>
          </div>

          {riskLevel && (
            <div className={`risk-preview ${getRiskColor(riskLevel)}`}>
              {getRiskIcon(riskLevel)}
              <span>Nível de Risco: {riskLevel === "alto_risco" ? "Alto" : riskLevel === "medio_risco" ? "Médio" : "Baixo"}</span>
            </div>
          )}

          {submitStatus === 'success' && (
            <div className="submit-status success">
              <CheckCircle size={16} />
              <span>Foco registrado com sucesso!</span>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="submit-status error">
              <XCircle size={16} />
              <span>Erro ao registrar foco. Tente novamente.</span>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="button button-secondary" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </button>
          <button className="button button-primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Camera size={16} />
            )}
            {isSubmitting ? 'Registrando...' : 'Registrar Foco'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DengueFocusModal