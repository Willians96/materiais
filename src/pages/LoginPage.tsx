import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "convex-generated/api.js";
import { toast } from "sonner";

export default function LoginPage() {
  const login = useMutation(api.authCustom.login);
  const requestAccess = useMutation(api.users.requestAccess);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [showRequestAccess, setShowRequestAccess] = useState(false);
  const [requestName, setRequestName] = useState("");
  const [requestEmail, setRequestEmail] = useState("");
  const [requestEmailError, setRequestEmailError] = useState("");
  const [requestLoading, setRequestLoading] = useState(false);

  const validateEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) {
      setEmailError("");
      return false;
    }
    if (!emailRegex.test(value)) {
      setEmailError("Formato de email inválido. Ex: nome@exemplo.com");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (value) {
      validateEmail(value);
    } else {
      setEmailError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email before submitting
    if (!validateEmail(email)) {
      toast.error("Por favor, insira um email válido");
      return;
    }

    if (!password) {
      toast.error("Por favor, insira sua senha");
      return;
    }

    setLoading(true);

    try {
      // Fazer login usando autenticação customizada
      const user = await login({ email, password });
      
      // Verificar se usuário precisa de aprovação
      if ((user as any).needsApproval) {
        // Salvar dados temporariamente para página de solicitação
        localStorage.setItem("userId", user.userId);
        localStorage.setItem("userEmail", user.email);
        localStorage.setItem("userName", user.name || "");
        localStorage.setItem("userRole", user.role);
        localStorage.setItem("needsApproval", "true");
        
        toast.info("Sua solicitação de acesso foi registrada. Aguarde aprovação do administrador.");
        
        // Redirecionar para página de solicitação (será tratado no App.tsx)
        window.location.href = "/";
        return;
      }
      
      // Salvar dados do usuário no localStorage
      localStorage.setItem("userId", user.userId);
      localStorage.setItem("userEmail", user.email);
      localStorage.setItem("userName", user.name || "");
      localStorage.setItem("userRole", user.role);
      localStorage.removeItem("needsApproval");
      
      toast.success("Login realizado com sucesso!");
      
      // Recarregar página para atualizar o App
      window.location.href = "/";
    } catch (error: any) {
      const errorMessage = error.message || "";
      
      // Mensagens de erro mais específicas
      if (errorMessage.includes("não encontrado") || errorMessage.includes("não existe")) {
        toast.error("Email não cadastrado no sistema. Solicite acesso abaixo.");
      } else if (errorMessage.includes("senha") || errorMessage.includes("password")) {
        toast.error("Senha incorreta. Verifique sua senha e tente novamente.");
      } else if (errorMessage.includes("inativo") || errorMessage.includes("desativado")) {
        toast.error("Sua conta está inativa. Entre em contato com o administrador.");
      } else if (errorMessage.includes("aprovação") || errorMessage.includes("aprovado")) {
        toast.error("Sua conta ainda não foi aprovada. Aguarde a aprovação do administrador.");
      } else {
        toast.error(errorMessage || "Erro ao fazer login. Verifique suas credenciais.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email before submitting
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(requestEmail)) {
      setRequestEmailError("Formato de email inválido. Ex: nome@exemplo.com");
      return;
    }
    setRequestEmailError("");

    setRequestLoading(true);

    try {
      await requestAccess({
        email: requestEmail,
        name: requestName || undefined,
        // Unidade será atribuída pelo administrador
      });
      
      toast.success("Solicitação enviada! Aguarde aprovação do administrador.");
      
      // Limpar formulário
      setRequestEmail("");
      setRequestName("");
      setShowRequestAccess(false);
      
      // Mostrar mensagem informativa
      setTimeout(() => {
        toast.info("O administrador será notificado e você receberá acesso em breve.");
      }, 1000);
    } catch (error: any) {
      const errorMessage = error.message || "";
      if (errorMessage === "Usuário já existe") {
        toast.info("Este email já possui uma solicitação pendente. Aguarde aprovação do administrador.");
      } else if (errorMessage.includes("email") || errorMessage.includes("Email")) {
        toast.error("Email inválido. Verifique o formato do email.");
      } else {
        toast.error(errorMessage || "Erro ao solicitar acesso");
      }
    } finally {
      setRequestLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-600">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">PMESP</h1>
          <p className="text-gray-600">Controle de Materiais - CPI-7</p>
        </div>

        {!showRequestAccess ? (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    onBlur={() => email && validateEmail(email)}
                    required
                    className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      emailError 
                        ? "border-red-500 bg-red-50" 
                        : email && !emailError 
                          ? "border-green-500 bg-green-50" 
                          : "border-gray-300"
                    }`}
                    placeholder="seu@email.com"
                  />
                  {email && !emailError && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}
                </div>
                {emailError && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {emailError}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !!emailError}
                className="w-full bg-blue-900 text-white py-2 px-4 rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? "Entrando..." : "Entrar"}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">ou</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowRequestAccess(true)}
                className="mt-4 w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Solicitar Acesso (Novo Usuário)
                </span>
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4">
              <button
                type="button"
                onClick={() => {
                  setShowRequestAccess(false);
                  setRequestEmail("");
                  setRequestName("");
                  setRequestEmailError("");
                }}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Voltar para login
              </button>
            </div>

            <form onSubmit={handleRequestAccess} className="space-y-4">
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Solicitar Acesso</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Preencha os dados abaixo para solicitar acesso ao sistema
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={requestEmail}
                    onChange={(e) => {
                      setRequestEmail(e.target.value);
                      setRequestEmailError("");
                    }}
                    onBlur={() => {
                      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                      if (requestEmail && !emailRegex.test(requestEmail)) {
                        setRequestEmailError("Formato de email inválido");
                      }
                    }}
                    required
                    className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                      requestEmailError 
                        ? "border-red-500 bg-red-50" 
                        : requestEmail && !requestEmailError 
                          ? "border-green-500 bg-green-50" 
                          : "border-gray-300"
                    }`}
                    placeholder="seu@email.com"
                  />
                  {requestEmail && !requestEmailError && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}
                </div>
                {requestEmailError && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {requestEmailError}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={requestName}
                  onChange={(e) => setRequestName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="Seu nome completo"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                <p className="font-medium flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Informação
                </p>
                <p className="mt-1">A unidade será atribuída pelo administrador após a aprovação da sua solicitação.</p>
              </div>

              <button
                type="submit"
                disabled={requestLoading || !!requestEmailError}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {requestLoading ? "Enviando..." : "Enviar Solicitação"}
              </button>
            </form>

            <div className="mt-4 text-center text-xs text-gray-500">
              <p>Após enviar, aguarde a aprovação do administrador</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}