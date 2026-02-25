"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap, ZoomControl } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { AlertTriangle, Calendar, Info, MapPin, Plus } from "lucide-react"
import Badge from "../UI/Badge/Badge"
import Button from "../UI/Button/Button"
import { API_URL } from "../../config/api"
import "./MapComponent.css"

type DengueFoco = {
  id: string
  latitude: number
  longitude: number
  riskLevel: "alto_risco" | "medio_risco" | "baixo_risco"
  description: string
  reportDate: string
  address?: string
  status?: string
  createdAt?: string
  distance?: number
  user?: {
    id: number
    name: string
  }
  foto?: string
  photoUrl?: string
  reportadoPor?: string
}

interface MapComponentProps {
  radiusKm: number
  filters: {
    showHighRisk: boolean
    showMediumRisk: boolean
    showLowRisk: boolean
  }
  onOpenModal: () => void
  onOpenDetailsModal: (foco: DengueFoco) => void
  newFocos?: DengueFoco[]
  mapFocos?: DengueFoco[]
  onFocosLoaded?: (focos: DengueFoco[]) => void
  onRefreshFocos?: () => void
}

function LocationMarker() {
  const [position, setPosition] = useState<[number, number] | null>(null)
  const [accuracy, setAccuracy] = useState<number | null>(null)
  const map = useMap()

  useEffect(() => {
    const locationOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    }

    map.locate(locationOptions).on("locationfound", (e) => {
      const newPos: [number, number] = [e.latlng.lat, e.latlng.lng]
      setPosition(newPos)
      setAccuracy(e.accuracy)

      map.setView(newPos, map.getZoom())
    }).on("locationerror", (e) => {
      console.error("Erro ao obter localização:", e.message)
    })
  }, [map])

  return position === null ? null : (
    <>
      <Circle
        center={position}
        pathOptions={{
          fillColor: "blue",
          fillOpacity: 0.2,
          color: "blue",
          weight: 2
        }}
        radius={Math.min(accuracy || 50, 100)}
      />
      <Circle
        center={position}
        pathOptions={{
          fillColor: "blue",
          fillOpacity: 0.8,
          color: "white",
          weight: 2
        }}
        radius={8}
      />
    </>
  )
}

const getRiskColor = (riskLevel: string) => {
  switch (riskLevel) {
    case "alto_risco":
      return "#ef4444"
    case "medio_risco":
      return "#f59e0b"
    case "baixo_risco":
      return "#22c55e"
    default:
      return "#3b82f6"
  }
}

const getRiskText = (riskLevel: string) => {
  switch (riskLevel) {
    case "alto_risco":
      return "Alto risco"
    case "medio_risco":
      return "Médio risco"
    case "baixo_risco":
      return "Baixo risco"
    default:
      return "Desconhecido"
  }
}

const getRiskBadgeVariant = (riskLevel: string): "destructive" | "warning" | "success" | "default" => {
  switch (riskLevel) {
    case "alto_risco":
      return "destructive"
    case "medio_risco":
      return "warning"
    case "baixo_risco":
      return "success"
    default:
      return "default"
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return "Data não informada"

  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch (error) {
    return "Data inválida"
  }
}

export default function MapComponent({
  radiusKm,
  filters,
  onOpenModal,
  onOpenDetailsModal,
  newFocos = [],
  mapFocos = [],
  onFocosLoaded
}: MapComponentProps) {
  const [userLocation, setUserLocation] = useState<[number, number]>([-3.7319, -38.5267])
  const [apiFocos, setApiFocos] = useState<DengueFoco[]>([])
  const [locationError, setLocationError] = useState<string | null>(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(true)
  const [isLoadingFocos, setIsLoadingFocos] = useState(false)
  const [focosError, setFocosError] = useState<string | null>(null)

  const fetchNearbyFocos = async (lat: number, lng: number) => {
    setIsLoadingFocos(true)
    setFocosError(null)

    try {
      const token = localStorage.getItem('authToken')

      const response = await fetch(
        `${API_URL}/dengue-focuses/nearby?latitude=${lat}&longitude=${lng}&radius=${radiusKm}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Token de autenticação inválido')
        }
        throw new Error(`Erro na requisição: ${response.status}`)
      }

      const data = await response.json()

      if (data.status === 'success') {
        const transformedFocos = data.data.map((foco: any) => ({
          id: foco.id.toString(),
          latitude: parseFloat(foco.latitude),
          longitude: parseFloat(foco.longitude),
          riskLevel: foco.riskLevel,
          description: foco.description,
          reportDate: formatDate(foco.createdAt),
          address: foco.address || `${foco.latitude}, ${foco.longitude}`,
          status: foco.status === 'monitorando' ? 'Em análise' :
            foco.status === 'resolvido' ? 'Resolvido' : foco.status,
          createdAt: foco.createdAt,
          distance: foco.distance,
          user: foco.user,
          foto: foco.foto,
          photoUrl: foco.photoUrl || foco.foto,
          reportadoPor: foco.user?.name || 'Usuário não identificado'
        }))

        if (mapFocos.length === 0) {
          setApiFocos(transformedFocos)

          if (onFocosLoaded) {
            onFocosLoaded(transformedFocos)
          }
        }

        console.log(`${transformedFocos.length} focos encontrados no raio de ${radiusKm}km`)
      } else {
        throw new Error(data.message || 'Erro ao buscar focos')
      }
    } catch (error) {
      console.error('Erro ao buscar focos:', error)
      setFocosError(error instanceof Error ? error.message : 'Erro desconhecido')
      if (mapFocos.length === 0) {
        setApiFocos([])
      }
    } finally {
      setIsLoadingFocos(false)
    }
  }

  useEffect(() => {
    const defaultIcon = L.Icon.Default.extend({
      options: {
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      },
    })

    L.Marker.prototype.options.icon = new defaultIcon()

    if (navigator.geolocation) {
      const options = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation: [number, number] = [
            position.coords.latitude,
            position.coords.longitude
          ]
          setUserLocation(newLocation)
          setIsLoadingLocation(false)
          setLocationError(null)

          console.log("Localização obtida:", {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(position.timestamp).toLocaleString()
          })

          fetchNearbyFocos(position.coords.latitude, position.coords.longitude)
        },
        (error) => {
          setIsLoadingLocation(false)
          let errorMessage = "Erro desconhecido"

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Permissão de localização negada pelo usuário"
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Localização indisponível"
              break
            case error.TIMEOUT:
              errorMessage = "Timeout ao obter localização"
              break
          }

          setLocationError(errorMessage)
          console.error("Erro de geolocalização:", errorMessage, error)

          fetchNearbyFocos(userLocation[0], userLocation[1])
        },
        options
      )
    } else {
      setIsLoadingLocation(false)
      setLocationError("Geolocalização não é suportada neste navegador")

      fetchNearbyFocos(userLocation[0], userLocation[1])
    }
  }, [])

  useEffect(() => {
    if (!isLoadingLocation && mapFocos.length === 0) {
      fetchNearbyFocos(userLocation[0], userLocation[1])
    }
  }, [radiusKm])

  const allFocos = mapFocos.length > 0 ? [...mapFocos, ...newFocos] : [...apiFocos, ...newFocos]

  const uniqueFocos = allFocos.reduce((acc: DengueFoco[], foco) => {
    const existingIndex = acc.findIndex(f => f.id === foco.id)
    if (existingIndex !== -1) {
      acc[existingIndex] = foco
    } else {
      acc.push(foco)
    }
    return acc
  }, [])

  const filteredFocos = uniqueFocos.filter((foco) => {
    if (foco.riskLevel === "alto_risco" && !filters.showHighRisk) return false
    if (foco.riskLevel === "medio_risco" && !filters.showMediumRisk) return false
    if (foco.riskLevel === "baixo_risco" && !filters.showLowRisk) return false
    return true
  })

  const userIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  })

  const handleDetailsClick = (foco: DengueFoco) => {
    onOpenDetailsModal(foco)
  }

  const handleNavigateClick = (foco: DengueFoco) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${foco.latitude},${foco.longitude}`
    window.open(url, '_blank')
  }

  useEffect(() => {
    console.log('MapComponent - Estado dos focos:', {
      apiFocos: apiFocos.length,
      mapFocos: mapFocos.length,
      newFocos: newFocos.length,
      uniqueFocos: uniqueFocos.length,
      filteredFocos: filteredFocos.length
    })
  }, [apiFocos.length, mapFocos.length, newFocos.length, uniqueFocos.length, filteredFocos.length])

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      {isLoadingLocation && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 1000,
          backgroundColor: '#3b82f6',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '12px'
        }}>
          🔍 Obtendo sua localização...
        </div>
      )}

      {isLoadingFocos && (
        <div style={{
          position: 'absolute',
          top: isLoadingLocation ? '60px' : '20px',
          left: '20px',
          zIndex: 1000,
          backgroundColor: '#10b981',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '12px'
        }}>
          📍 Carregando focos próximos...
        </div>
      )}

      {locationError && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 1000,
          backgroundColor: '#ef4444',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '12px',
          maxWidth: '250px'
        }}>
          ⚠️ {locationError}
        </div>
      )}

      {focosError && (
        <div style={{
          position: 'absolute',
          top: locationError ? '60px' : '20px',
          left: '20px',
          zIndex: 1000,
          backgroundColor: '#f59e0b',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '12px',
          maxWidth: '250px'
        }}>
          ⚠️ Erro ao carregar focos: {focosError}
        </div>
      )}

      <button
        onClick={onOpenModal}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          backgroundColor: '#ef4444',
          color: 'white',
          border: 'none',
          borderRadius: '50px',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          fontSize: '14px',
          fontWeight: '600',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#dc2626'
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#ef4444'
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}
      >
        <Plus size={18} />
        Registrar Foco
      </button>

      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        zIndex: 1000,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: '8px 12px',
        borderRadius: '8px',
        fontSize: '12px',
        color: '#374151'
      }}>
        📊 {filteredFocos.length} focos encontrados no raio de {radiusKm}km
        {newFocos.length > 0 && (
          <span style={{ color: '#10b981', fontWeight: 'bold', marginLeft: '8px' }}>
            ({newFocos.length} novo{newFocos.length > 1 ? 's' : ''})
          </span>
        )}
      </div>

      <MapContainer
        center={userLocation}
        zoom={14}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
        className="map-container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ZoomControl position="bottomright" />

        <Circle
          center={userLocation}
          pathOptions={{
            fillColor: "#3b82f6",
            fillOpacity: 0.05,
            color: "#3b82f6",
            weight: 2,
            dashArray: "5, 5",
          }}
          radius={radiusKm * 1000}
        />

        <Marker position={userLocation} icon={userIcon}>
          <Popup className="custom-popup">
            <div className="popup-content">
              <h3>Sua localização</h3>
              <p>Este é o ponto central do seu raio de busca.</p>
              {locationError && (
                <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                  Localização aproximada
                </p>
              )}
            </div>
          </Popup>
        </Marker>

        {filteredFocos.map((foco) => {
          const isNewFoco = newFocos.some(newFoco => newFoco.id === foco.id)

          return (
            <Marker
              key={`${foco.id}-${isNewFoco ? 'new' : 'existing'}-${foco.riskLevel}-${foco.description.slice(0, 10)}`}
              position={[foco.latitude, foco.longitude]}
              icon={L.divIcon({
                className: "custom-div-icon",
                html: `
                  <div style="
                    background-color: ${getRiskColor(foco.riskLevel)};
                    width: ${isNewFoco ? '24px' : '20px'};
                    height: ${isNewFoco ? '24px' : '20px'};
                    border-radius: 50%;
                    border: ${isNewFoco ? '3px solid #10b981' : '2px solid white'};
                    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    ${isNewFoco ? 'animation: pulse 2s infinite;' : ''}
                  ">
                    ${foco.riskLevel === "alto_risco" ? '<div style="width: 6px; height: 6px; background: white; border-radius: 50%;"></div>' : ""}
                  </div>
                  ${isNewFoco ? `
                    <style>
                      @keyframes pulse {
                        0% { transform: scale(1); }
                        50% { transform: scale(1.1); }
                        100% { transform: scale(1); }
                      }
                    </style>
                  ` : ''}
                `,
                iconSize: [isNewFoco ? 24 : 20, isNewFoco ? 24 : 20],
                iconAnchor: [isNewFoco ? 12 : 10, isNewFoco ? 12 : 10],
              })}
            >
              <Popup className="custom-popup">
                <div className="popup-content">
                  <div className="popup-header">
                    <AlertTriangle className="icon-alert" />
                    <div>
                      <h3>
                        Foco de Dengue
                        {isNewFoco && <span style={{ color: '#10b981', fontSize: '12px', marginLeft: '4px' }}>(NOVO)</span>}
                      </h3>
                      <p>{foco.address}</p>
                    </div>
                  </div>

                  <div className="popup-badges">
                    <Badge variant={getRiskBadgeVariant(foco.riskLevel)}>{getRiskText(foco.riskLevel)}</Badge>
                    {foco.status && <Badge variant="outline">{foco.status}</Badge>}
                    {foco.distance !== undefined && (
                      <Badge variant="outline">{foco.distance.toFixed(1)}km</Badge>
                    )}
                    {isNewFoco && <Badge variant="success">Recém adicionado</Badge>}
                  </div>

                  <p className="popup-description">{foco.description}</p>

                  <div className="popup-date">
                    <Calendar className="icon-calendar" />
                    Reportado em: {foco.reportDate}
                  </div>

                  {foco.user && (
                    <div className="popup-date">
                      <Info className="icon-info" />
                      Reportado por: {foco.user.name}
                    </div>
                  )}

                  <div className="popup-actions">
                    <Button
                      variant="outline"
                      className="popup-button"
                      onClick={() => handleDetailsClick(foco)}
                    >
                      <Info className="icon-info" /> Detalhes
                    </Button>
                    <Button
                      variant="default"
                      className="popup-button"
                      onClick={() => handleNavigateClick(foco)}
                    >
                      <MapPin className="icon-pin" /> Navegar
                    </Button>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}

        <LocationMarker />
      </MapContainer>
    </div>
  )
}