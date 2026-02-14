"use client"

import { useState } from "react"
import Sidebar from "../../components/Sidebar/Sidebar"
import MapComponent from "../../components/Map/MapComponent"
import DengueFocusModal from "../../components/DengueFocusModal/DengueFocusModal"
import FocoDengueModal from "../../components/DengueModal/DengueModal"
import { Menu } from "lucide-react"
import Button from "../../components/UI/Button/Button"
import "./Home.css"

type FocoDengue = {
  id: string
  address: string
  latitude: number
  longitude: number
  riskLevel: "alto_risco" | "medio_risco" | "baixo_risco"
  description: string
  reportDate: string
  reportadoPor: string
  foto?: string
  photoUrl?: string
}

type DengueFocoMap = {
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


export default function Home() {
  const [radiusKm, setRadiusKm] = useState(5)
  const [showHighRisk, setShowHighRisk] = useState(true)
  const [showMediumRisk, setShowMediumRisk] = useState(true)
  const [showLowRisk, setShowLowRisk] = useState(true)
  const [activeTab, setActiveTab] = useState("filtros")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedFoco, setSelectedFoco] = useState<FocoDengue | null>(null)

  const [newFocos, setNewFocos] = useState<DengueFocoMap[]>([])

  const [mapFocos, setMapFocos] = useState<DengueFocoMap[]>([])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleModalSubmit = (newFoco: any) => {
  const focoForMap: DengueFocoMap = {
    id: newFoco.id || `temp-${Date.now()}`,
    latitude: newFoco.location.lat,
    longitude: newFoco.location.lng,
    riskLevel: newFoco.riskLevel,
    description: newFoco.description,
    reportDate: new Date().toLocaleDateString('pt-BR'),
    address: newFoco.address,
    status: 'Em análise',
    createdAt: newFoco.timestamp,
    distance: 0,
    user: {
      id: newFoco.apiResponse?.data?.user?.id || 0,
      name: newFoco.reportadoPor || 'Você'
    },
    photoUrl: newFoco.photoUrl,
    reportadoPor: newFoco.reportadoPor || 'Você'
  }

  setNewFocos(prev => [...prev, focoForMap])
  setIsModalOpen(false)
}

  const handleOpenDetailsModal = (foco: DengueFocoMap) => {
    const focoForModal: FocoDengue = {
      id: foco.id.toString(),
      address: foco.address || `${foco.latitude}, ${foco.longitude}`,
      latitude: foco.latitude,
      longitude: foco.longitude,
      riskLevel: foco.riskLevel,
      description: foco.description,
      reportDate: foco.reportDate || foco.createdAt || '',
      reportadoPor: foco.user?.name || foco.reportadoPor || 'Usuário não identificado',
      photoUrl: foco.photoUrl || foco.foto
    }
    
    setSelectedFoco(focoForModal)
    setIsDetailsModalOpen(true)
  }

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false)
    setSelectedFoco(null)
  }

  const handleUpdateFoco = async (focoId: string, updates: Partial<FocoDengue>) => {
  setMapFocos(prev => prev.map(foco => 
    foco.id === focoId 
      ? { 
          ...foco, 
          description: updates.description || foco.description,
          riskLevel: updates.riskLevel || foco.riskLevel
        }
      : foco
  ))

  setNewFocos(prev => prev.map(foco => 
    foco.id === focoId 
      ? { 
          ...foco, 
          description: updates.description || foco.description,
          riskLevel: updates.riskLevel || foco.riskLevel
        }
      : foco
  ))

  if (selectedFoco && selectedFoco.id === focoId) {
    setSelectedFoco(prev => prev ? { ...prev, ...updates } : null)
  }
}

const handleDeleteFoco = async (focoId: string) => {
  setMapFocos(prev => prev.filter(foco => foco.id !== focoId))
  setNewFocos(prev => prev.filter(foco => foco.id !== focoId))
  
  if (selectedFoco?.id === focoId) {
    setIsDetailsModalOpen(false)
    setSelectedFoco(null)
  }
}

  const handleFocosLoaded = (focos: DengueFocoMap[]) => {
    setMapFocos(focos)
    console.log(`${focos.length} focos carregados da API`)
  }

  const handleRefreshFocos = () => {
    console.log("Forçando atualização dos focos...")
  }

  return (
    <div className="home-container">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        radiusKm={radiusKm}
        setRadiusKm={setRadiusKm}
        showHighRisk={showHighRisk}
        setShowHighRisk={setShowHighRisk}
        showMediumRisk={showMediumRisk}
        setShowMediumRisk={setShowMediumRisk}
        showLowRisk={showLowRisk}
        setShowLowRisk={setShowLowRisk}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="mobile-menu-button">
        <Button onClick={toggleSidebar} className="icon-button">
          <Menu className="icon" />
        </Button>
      </div>

      <div className="mobile-action-buttons">
        <Button className="round-button" onClick={handleOpenModal}>
          <span className="icon map-pin-icon"></span>
        </Button>
        {activeTab === "filtros" ? (
          <Button className="round-button" onClick={() => setActiveTab("estatisticas")}>
            <span className="icon chart-icon"></span>
          </Button>
        ) : (
          <Button className="round-button" onClick={() => setActiveTab("filtros")}>
            <span className="icon layers-icon"></span>
          </Button>
        )}
      </div>

      <div className="map-container">
        <MapComponent
          radiusKm={radiusKm}
          filters={{
            showHighRisk,
            showMediumRisk,
            showLowRisk,
          }}
          onOpenModal={handleOpenModal}
          onOpenDetailsModal={handleOpenDetailsModal}
          newFocos={newFocos}
          mapFocos={mapFocos}
          onFocosLoaded={handleFocosLoaded}
          onRefreshFocos={handleRefreshFocos}
        />
      </div>

      {/* Modal para adicionar novo foco */}
      {isModalOpen && (
        <DengueFocusModal 
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleModalSubmit}
        />
      )}

      {/* Modal para exibir detalhes do foco */}
      <FocoDengueModal
        foco={selectedFoco}
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        onUpdateFoco={handleUpdateFoco}
        onDeleteFoco={handleDeleteFoco}
      />
    </div>
  )
}