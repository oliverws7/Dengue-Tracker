import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { casesAPI } from '../../services/api';
import { useNotifications } from '../../contexts/NotificationContext';

const CreateCase = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    city: '',
    location: '',
    type: 'outro', // Opções válidas: agua-parada, pneu, vaso-planta, lixo, outro
    description: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Mapeamento para o esquema do backend
    const dataToBackend = {
      endereco: `${formData.city} - ${formData.location}`,
      localizacao: {
        lat: -23.5505, // Coordenadas padrão obrigatórias
        lng: -46.6333
      },
      tipoCriadouro: formData.type, 
      descricao: formData.description,
      status: 'pendente'
    };

    try {
      await casesAPI.create(dataToBackend); 
      
      addNotification({
        type: 'success',
        message: 'Caso registado com sucesso!',
        title: 'Sucesso'
      });

      navigate('/dashboard'); 
    } catch (error) {
      console.error('Erro de Validação:', error.response?.data);
      addNotification({
        type: 'error',
        message: error.response?.data?.error || 'Erro de validação nos dados.',
        title: 'Erro ao Gravar'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-case-container">
      <form className="case-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Cidade</label>
          <input type="text" required value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
        </div>
        <div className="form-group">
          <label>Morada / Local</label>
          <input type="text" required value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
        </div>
        <div className="form-group">
          <label>Tipo de Foco</label>
          <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
            <option value="agua-parada">Água Parada</option>
            <option value="pneu">Pneus</option>
            <option value="vaso-planta">Vasos</option>
            <option value="lixo">Lixo</option>
            <option value="outro">Outro</option>
          </select>
        </div>
        <div className="form-group">
          <label>Descrição</label>
          <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
        </div>
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'A gravar...' : 'Confirmar Registo'}
        </button>
      </form>
    </div>
  );
};

export default CreateCase;