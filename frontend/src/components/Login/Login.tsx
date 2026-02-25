
import type React from "react"
import { useState, type FormEvent, useEffect } from "react"
import { Shield, MapPin, Users, Eye, EyeOff } from "../Icons/Icons"
import { LoginResponse } from "../../types/types"
import { useAuth } from "../../context/AuthContext"
import { API_URL } from "../../config/api"
import "./Login.css"

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [cpf, setCpf] = useState("")
  const [resetCode, setResetCode] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isRegisterMode, setIsRegisterMode] = useState(false)
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false)
  const [isResetCodeMode, setIsResetCodeMode] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const [mosquitoPosition, setMosquitoPosition] = useState({ x: 50, y: 50 })
  const [mosquitoVisible, setMosquitoVisible] = useState(true)
  const [mosquitoSpeed, setMosquitoSpeed] = useState(1)

  const { login: authLogin, isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      return
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (!mosquitoVisible) return

    const moveMosquito = () => {
      setMosquitoPosition(prev => {
        const deltaX = (Math.random() - 0.5) * 4 * mosquitoSpeed
        const deltaY = (Math.random() - 0.5) * 4 * mosquitoSpeed

        let newX = prev.x + deltaX
        let newY = prev.y + deltaY

        if (newX < 5) newX = 5
        if (newX > 95) newX = 95
        if (newY < 5) newY = 5
        if (newY > 95) newY = 95

        return { x: newX, y: newY }
      })
    }

    const interval = setInterval(moveMosquito, 100 + Math.random() * 100)
    return () => clearInterval(interval)
  }, [mosquitoVisible, mosquitoSpeed])

  useEffect(() => {
    const speedInterval = setInterval(() => {
      setMosquitoSpeed(0.5 + Math.random() * 1.5)
    }, 2000 + Math.random() * 3000)

    return () => clearInterval(speedInterval)
  }, [])

  const eliminateMosquito = () => {
    setMosquitoVisible(false)

    setTimeout(() => {
      setMosquitoPosition({
        x: Math.random() * 90 + 5,
        y: Math.random() * 90 + 5
      })
      setMosquitoVisible(true)
    }, 5000 + Math.random() * 5000)
  }

  const formatCPF = (value: string) => {
    const cpfNumbers = value.replace(/\D/g, '')

    if (cpfNumbers.length <= 11) {
      return cpfNumbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    }

    return cpfNumbers.slice(0, 11).replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCPF = formatCPF(e.target.value)
    setCpf(formattedCPF)
  }

  const clearForm = () => {
    setEmail("")
    setPassword("")
    setName("")
    setCpf("")
    setResetCode("")
    setError("")
    setSuccess("")
  }

  const toggleMode = async (e: React.MouseEvent, mode: 'login' | 'register' | 'forgot-password') => {
    e.preventDefault()

    setIsTransitioning(true)

    setTimeout(() => {
      setIsRegisterMode(false)
      setIsForgotPasswordMode(false)
      setIsResetCodeMode(false)

      switch (mode) {
        case 'register':
          setIsRegisterMode(true)
          break
        case 'forgot-password':
          setIsForgotPasswordMode(true)
          break
        case 'login':
        default:
          break
      }

      clearForm()

      setTimeout(() => {
        setIsTransitioning(false)
      }, 50)
    }, 200)
  }

  const handleForgotPassword = async () => {
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Código de recuperação enviado para seu email!")
        setTimeout(() => {
          setIsTransitioning(true)
          setTimeout(() => {
            setIsForgotPasswordMode(false)
            setIsResetCodeMode(true)
            setSuccess("Digite o código enviado para seu email")
            setIsTransitioning(false)
          }, 200)
        }, 1500)
      } else {
        setError(data.message || "Erro ao enviar código de recuperação. Tente novamente.")
      }
    } catch (err) {
      console.error("Erro ao fazer requisição:", err)
      setError("Erro de conexão. Verifique sua internet e tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async () => {
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          resetCode,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Nova senha enviada para seu email!")
        setTimeout(() => {
          toggleMode({ preventDefault: () => { } } as React.MouseEvent, 'login')
          setTimeout(() => setSuccess(""), 100)
        }, 2000)
      } else {
        setError(data.message || "Código inválido. Tente novamente.")
      }
    } catch (err) {
      console.error("Erro ao fazer requisição:", err)
      setError("Erro de conexão. Verifique sua internet e tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (isForgotPasswordMode) {
      await handleForgotPassword()
      return
    }

    if (isResetCodeMode) {
      await handleResetPassword()
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      if (isRegisterMode) {
        const response = await fetch(`${API_URL}/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
            cpf,
          }),
        })

        const data = await response.json()

        if (response.ok) {
          setSuccess("Cadastro realizado com sucesso! Você pode fazer login agora.")
          clearForm()
          setTimeout(() => {
            toggleMode(e as any, 'login')
            setSuccess("")
          }, 2000)
        } else {
          setError(data.message || "Erro ao realizar cadastro. Tente novamente.")
        }
      } else {

        const response = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        })

        // Tentar obter o JSON, mas lidar com o caso de não ser JSON
        let data: any
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          data = await response.json()
        } else {
          const text = await response.text()
          console.error("Resposta não-JSON do servidor:", text)
          throw new Error(`Servidor retornou erro ${response.status}: ${text.slice(0, 100)}`)
        }

        if (response.ok && data.status === "success") {
          setSuccess("Login realizado com sucesso!")
          authLogin(data.token, data.data.user)
          setEmail("")
          setPassword("")
          console.log("Login realizado com sucesso:", data.data.user)
        } else {
          // Se o servidor retornou um erro estruturado
          setError(data.message || "Credenciais inválidas. Tente novamente.")
        }
      }
    } catch (err: any) {
      console.error("Erro detalhado na requisição:", err)

      // Se for um erro que nós mesmos lançamos acima
      if (err.message && (err.message.includes("Servidor retornou erro") || err.message.includes("incorretos"))) {
        setError(err.message)
      } else {
        setError("Erro de conexão. Verifique se o servidor está online e sua internet funciona.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getCurrentMode = () => {
    if (isForgotPasswordMode) return 'forgot-password'
    if (isResetCodeMode) return 'reset-code'
    if (isRegisterMode) return 'register'
    return 'login'
  }

  const getModeConfig = () => {
    const mode = getCurrentMode()

    const configs = {
      'login': {
        title: 'Dengue Tracker',
        description: 'Acesse sua conta para monitorar e reportar focos de dengue',
        heroTitle: 'Monitore e Previna',
        heroDescription: 'Sua plataforma para monitoramento colaborativo de focos de dengue. Mantenha sua comunidade informada e protegida.',
        buttonText: 'Entrar na Plataforma',
        loadingText: 'Entrando...'
      },
      'register': {
        title: 'Dengue Tracker',
        description: 'Crie sua conta para começar a monitorar focos de dengue',
        heroTitle: 'Junte-se a Nós',
        heroDescription: 'Cadastre-se e faça parte da comunidade que combate a dengue. Sua participação é fundamental para manter todos protegidos.',
        buttonText: 'Criar Conta',
        loadingText: 'Cadastrando...'
      },
      'forgot-password': {
        title: 'Recuperar Senha',
        description: 'Digite seu email para receber o código de recuperação',
        heroTitle: 'Recupere sua Conta',
        heroDescription: 'Não se preocupe! Digite seu email e enviaremos um código para você redefinir sua senha.',
        buttonText: 'Enviar Código',
        loadingText: 'Enviando...'
      },
      'reset-code': {
        title: 'Código de Recuperação',
        description: 'Digite o código que você recebeu no seu email',
        heroTitle: 'Quase Pronto!',
        heroDescription: 'Digite o código de 6 dígitos que enviamos para seu email. Sua nova senha será enviada automaticamente.',
        buttonText: 'Confirmar Código',
        loadingText: 'Confirmando...'
      }
    }

    return configs[mode]
  }

  const config = getModeConfig()

  return (
    <div className="login-container">
      {mosquitoVisible && (
        <div
          className="mosquito"
          style={{
            left: `${mosquitoPosition.x}%`,
            top: `${mosquitoPosition.y}%`,
          }}
          onClick={eliminateMosquito}
          title="Clique para eliminar o mosquito! 🦟"
        >
          🦟
        </div>
      )}

      <div className="background-elements">
        <div className="bg-element bg-element-1"></div>
        <div className="bg-element bg-element-2"></div>
        <div className="bg-element bg-element-3"></div>
      </div>

      <div className="content-container">
        <div className="content-grid">
          <div className="login-form-container">
            <div className="login-form-wrapper slide-in-left">
              <div className={`card ${isTransitioning ? 'card-transitioning' : ''}`}>
                <div className="card-header">
                  <div className="logo-container">
                    <div className="logo">
                      <Shield className="logo-icon" />
                    </div>
                    <div className="logo-glow"></div>
                  </div>
                  <div className={`title-container ${isTransitioning ? 'title-transitioning' : 'fade-in'}`}>
                    <h2 className="card-title">{config.title}</h2>
                    <p className="card-description">
                      {config.description}
                    </p>
                  </div>
                </div>

                <div className="card-content">
                  <form onSubmit={handleSubmit} className={`login-form ${isTransitioning ? 'form-transitioning' : 'fade-in'}`}>
                    {error && (
                      <div className="error-message message-slide-in" style={{
                        color: '#ef4444',
                        backgroundColor: '#fef2f2',
                        padding: '12px',
                        borderRadius: '6px',
                        marginBottom: '16px',
                        border: '1px solid #fecaca',
                        fontSize: '14px'
                      }}>
                        {error}
                      </div>
                    )}

                    {success && (
                      <div className="success-message message-slide-in" style={{
                        color: '#22c55e',
                        backgroundColor: '#f0fdf4',
                        padding: '12px',
                        borderRadius: '6px',
                        marginBottom: '16px',
                        border: '1px solid #bbf7d0',
                        fontSize: '14px'
                      }}>
                        {success}
                      </div>
                    )}

                    {isRegisterMode && (
                      <div className={`form-group ${isTransitioning ? 'field-exit' : 'field-enter'}`}>
                        <label htmlFor="name" className="form-label">
                          Nome Completo
                        </label>
                        <input
                          id="name"
                          type="text"
                          placeholder="Seu nome completo"
                          className="form-input"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                    )}

                    <div className={`form-group ${isTransitioning ? 'field-exit' : 'field-enter'}`} style={{ animationDelay: isRegisterMode ? '0.1s' : '0s' }}>
                      <label htmlFor="email" className="form-label">
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        className="form-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    {isRegisterMode && (
                      <div className={`form-group ${isTransitioning ? 'field-exit' : 'field-enter'}`} style={{ animationDelay: '0.2s' }}>
                        <label htmlFor="cpf" className="form-label">
                          CPF
                        </label>
                        <input
                          id="cpf"
                          type="text"
                          placeholder="000.000.000-00"
                          className="form-input"
                          value={cpf}
                          onChange={handleCPFChange}
                          maxLength={14}
                          required
                        />
                      </div>
                    )}

                    {isResetCodeMode && (
                      <div className={`form-group ${isTransitioning ? 'field-exit' : 'field-enter'}`} style={{ animationDelay: '0.1s' }}>
                        <label htmlFor="resetCode" className="form-label">
                          Código de Recuperação
                        </label>
                        <input
                          id="resetCode"
                          type="text"
                          placeholder="Digite o código de 6 dígitos"
                          className="form-input"
                          value={resetCode}
                          onChange={(e) => setResetCode(e.target.value)}
                          maxLength={6}
                          required
                        />
                      </div>
                    )}

                    {!isForgotPasswordMode && !isResetCodeMode && (
                      <div className={`form-group ${isTransitioning ? 'field-exit' : 'field-enter'}`} style={{ animationDelay: isRegisterMode ? '0.3s' : '0.1s' }}>
                        <div className="label-container">
                          <label htmlFor="password" className="form-label">
                            Senha
                          </label>
                          {!isRegisterMode && (
                            <a
                              href="#"
                              onClick={(e) => toggleMode(e, 'forgot-password')}
                              className="forgot-password"
                            >
                              Esqueci minha senha
                            </a>
                          )}
                        </div>
                        <div className="password-input-container">
                          <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            className="form-input"
                            placeholder={isRegisterMode ? "Mínimo 6 caracteres" : ""}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            minLength={isRegisterMode ? 6 : undefined}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="toggle-password"
                          >
                            {showPassword ? <EyeOff className="eye-icon" /> : <Eye className="eye-icon" />}
                          </button>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`submit-button ${isTransitioning ? 'button-exit' : 'button-enter'}`}
                      style={{ animationDelay: isRegisterMode ? '0.4s' : '0.2s' }}
                    >
                      <span className="button-content">
                        {isLoading ? (
                          <>
                            <div className="spinner"></div>
                            {config.loadingText}
                          </>
                        ) : (
                          config.buttonText
                        )}
                      </span>
                      <div className="button-shine"></div>
                    </button>
                  </form>

                  {!isForgotPasswordMode && !isResetCodeMode && (
                    <>
                      <div className={`divider ${isTransitioning ? 'divider-exit' : 'fade-in'}`} style={{ animationDelay: '0.3s' }}>
                        <span className="divider-text">Ou</span>
                      </div>

                      <div className={`signup-container ${isTransitioning ? 'signup-exit' : 'fade-in'}`} style={{ animationDelay: '0.4s' }}>
                        <p className="signup-text">
                          {isRegisterMode ? "Já tem uma conta? " : "Não tem uma conta? "}
                          <a
                            href="#"
                            onClick={(e) => toggleMode(e, isRegisterMode ? 'login' : 'register')}
                            className="signup-link"
                          >
                            {isRegisterMode ? "Faça login" : "Cadastre-se gratuitamente"}
                          </a>
                        </p>
                        <p className="community-text">
                          {isRegisterMode
                            ? "Volte e acesse sua conta existente"
                            : "Junte-se à comunidade e ajude a prevenir a dengue"
                          }
                        </p>
                      </div>
                    </>
                  )}

                  {(isForgotPasswordMode || isResetCodeMode) && (
                    <div className={`signup-container ${isTransitioning ? 'signup-exit' : 'fade-in'}`} style={{ animationDelay: '0.3s' }}>
                      <p className="signup-text">
                        Lembrou da senha?
                        <a
                          href="#"
                          onClick={(e) => toggleMode(e, 'login')}
                          className="signup-link"
                        >
                          Voltar ao login
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="hero-section">
            <div className="hero-image-container slide-in-right">
              <div className="hero-image-wrapper">
                <div className="hero-circle">
                  <div className="hero-inner-circle">
                    <MapPin className="hero-icon" />
                  </div>
                </div>

                <div className="floating-icon floating-icon-1">
                  <Shield className="floating-icon-image" />
                </div>
                <div className="floating-icon floating-icon-2">
                  <Users className="floating-icon-image" />
                </div>
                <div className="floating-icon floating-icon-3">
                  <MapPin className="floating-icon-image" />
                </div>
              </div>
            </div>

            <div className={`hero-content ${isTransitioning ? 'hero-transitioning' : 'fade-in'}`}>
              <h1 className="hero-title">
                {config.heroTitle}
              </h1>
              <p className="hero-description">
                {config.heroDescription}
              </p>

              <div className="features-grid slide-in-bottom">
                <div className="feature">
                  <div className="feature-icon-container">
                    <MapPin className="feature-icon" />
                  </div>
                  <p className="feature-title">Monitore</p>
                  <p className="feature-description">Focos na região</p>
                </div>
                <div className="feature">
                  <div className="feature-icon-container feature-icon-orange">
                    <Shield className="feature-icon" />
                  </div>
                  <p className="feature-title">Reporte</p>
                  <p className="feature-description">Novos focos</p>
                </div>
                <div className="feature">
                  <div className="feature-icon-container feature-icon-blue">
                    <Users className="feature-icon" />
                  </div>
                  <p className="feature-title">Colabore</p>
                  <p className="feature-description">Com a comunidade</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login