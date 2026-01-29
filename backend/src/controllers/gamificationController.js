const User = require("../models/User");

const gamificationController = {
  // RANKING
  async getRanking(req, res) {
    try {
      const ranking = await User.find()
        .select("nome pontos nivel")
        .sort({ pontos: -1 })
        .limit(20);
      res.json({ success: true, ranking });
    } catch (error) {
      console.error('Erro ao buscar ranking:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar ranking',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // ESTATÍSTICAS
  async getEstatisticasGlobais(req, res) {
    try {
      const totalUsuarios = await User.countDocuments();
      const totalPontos = await User.aggregate([
        { $group: { _id: null, total: { $sum: "$pontos" } } }
      ]);
      
      res.json({
        success: true,
        estatisticas: {
          totalUsuarios,
          totalPontos: totalPontos[0]?.total || 0,
          atualizadoEm: new Date()
        }
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar estatísticas',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // PERFIL
  async getPerfil(req, res) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ 
          success: false, 
          message: 'Usuário não autenticado' 
        });
      }
      
      const usuario = await User.findById(req.user.id).select("nome pontos nivel");
      
      if (!usuario) {
        return res.status(404).json({ 
          success: false, 
          message: 'Usuário não encontrado' 
        });
      }
      
      res.json({ 
        success: true, 
        perfil: usuario 
      });
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar perfil',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // CONQUISTAS
  async verificarConquistas(req, res) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ 
          success: false, 
          message: 'Usuário não autenticado' 
        });
      }
      
      const usuario = await User.findById(req.user.id).select("conquistas");
      
      res.json({ 
        success: true, 
        conquistas: usuario?.conquistas || []
      });
    } catch (error) {
      console.error('Erro ao verificar conquistas:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao verificar conquistas',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // RECOMPENSA DIÁRIA - CORRIGIDO (Com validação de data)
  async recompensaDiaria(req, res) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ 
          success: false, 
          message: 'Usuário não autenticado' 
        });
      }
      
      const usuario = await User.findById(req.user.id);
      
      if (!usuario) {
        return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
      }

      // LÓGICA DE VALIDAÇÃO DE DATA
      const agora = new Date();
      if (usuario.ultimaRecompensa) {
        const ultimaData = new Date(usuario.ultimaRecompensa);
        
        // Verifica se é o mesmo dia, mês e ano
        const mesmoDia = ultimaData.getDate() === agora.getDate() &&
                         ultimaData.getMonth() === agora.getMonth() &&
                         ultimaData.getFullYear() === agora.getFullYear();
        
        if (mesmoDia) {
          return res.status(400).json({ 
            success: false, 
            message: 'Recompensa diária já resgatada hoje. Volte amanhã!' 
          });
        }
      }

      // Aplica a recompensa se passou na validação
      usuario.pontos = (usuario.pontos || 0) + 10;
      usuario.ultimaRecompensa = agora;
      await usuario.save();
      
      res.json({ 
        success: true, 
        message: "+10 pontos pela recompensa diária!",
        pontos: 10,
        totalPontos: usuario.pontos
      });
    } catch (error) {
      console.error('Erro ao processar recompensa:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao processar recompensa',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = gamificationController;