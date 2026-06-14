import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "convex-generated/api.js";
import { toast } from "sonner";

export default function LoginPage() {
  const login = useMutation(api.authCustom.login);
  const requestAccess = useMutation(api.users.requestAccess);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRequestAccess, setShowRequestAccess] = useState(false);

  // Formulário de solicitação
  const [reqEmail, setReqEmail] = useState("");
  const [reqName, setReqName] = useState("");
  const [reqPassword, setReqPassword] = useState("");
  const [reqPasswordConfirm, setReqPasswordConfirm] = useState("");
  const [reqLoading, setReqLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login({ email, password });
      localStorage.setItem("userId", user.userId);
      localStorage.setItem("userEmail", user.email);
      localStorage.setItem("userName", user.name || "");
      localStorage.setItem("userRole", user.role);
      toast.success("Login realizado com sucesso!");
      window.location.href = "/";
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();

    if (reqPassword !== reqPasswordConfirm) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (reqPassword.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    setReqLoading(true);
    try {
      await requestAccess({
        email: reqEmail,
        name: reqName,
        password: reqPassword,
      });
      toast.success("Solicitação enviada! Aguarde aprovação do administrador.");
      setShowRequestAccess(false);
      setReqEmail("");
      setReqName("");
      setReqPassword("");
      setReqPasswordConfirm("");
    } catch (error: any) {
      toast.error(error.message || "Erro ao solicitar acesso");
    } finally {
      setReqLoading(false);
    }
  };

  if (!showRequestAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-600">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-900 mb-2">PMESP</h1>
            <p className="text-gray-600">Controle de Materiais - CPI-7</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-900 text-white py-2 px-4 rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50 font-medium"
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
              ✉️ Solicitar Acesso (Novo Usuário)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-600">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="mb-4">
          <button
            type="button"
            onClick={() => {
              setShowRequestAccess(false);
              setReqEmail("");
              setReqName("");
              setReqPassword("");
              setReqPasswordConfirm("");
            }}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            ← Voltar para login
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
            <input
              type="email"
              value={reqEmail}
              onChange={(e) => setReqEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome Completo *
            </label>
            <input
              type="text"
              value={reqName}
              onChange={(e) => setReqName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Seu nome completo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha * (mínimo 6 caracteres)
            </label>
            <input
              type="password"
              value={reqPassword}
              onChange={(e) => setReqPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Crie uma senha"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Senha *
            </label>
            <input
              type="password"
              value={reqPasswordConfirm}
              onChange={(e) => setReqPasswordConfirm(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Confirme a senha"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            <p className="font-medium">ℹ️ Informação</p>
            <p className="mt-1">A unidade será atribuída pelo administrador após a aprovação da sua solicitação.</p>
          </div>

          <button
            type="submit"
            disabled={reqLoading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {reqLoading ? "Enviando..." : "Enviar Solicitação"}
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-gray-500">
          <p>Após enviar, aguarde a aprovação do administrador</p>
        </div>
      </div>
    </div>
  );
}
