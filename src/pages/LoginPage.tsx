import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "convex-generated/api.js";
import { toast } from "sonner";
import { useUser, useClerk, SignIn, SignUp, UserButton } from "@clerk/clerk-react";

export default function LoginPage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const clerk = useClerk();
  const syncClerkUser = useMutation(api.authCustom.syncClerkUser);
  const [showSignUp, setShowSignUp] = useState(false);

  // Sync user with our database when signed in
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      const syncUser = async () => {
        try {
          const result = await syncClerkUser({
            clerkUserId: user.id,
            email: user.primaryEmailAddress?.emailAddress || "",
            name: user.fullName || undefined,
          });

          if (result) {
            // Salvar dados do usuário no localStorage
            localStorage.setItem("userId", result.userId);
            localStorage.setItem("userEmail", result.email);
            localStorage.setItem("userName", result.name || "");
            localStorage.setItem("userRole", result.role);
            localStorage.setItem("clerkUserId", user.id);

            if (!result.approved) {
              localStorage.setItem("needsApproval", "true");
              toast.info("Sua solicitação de acesso foi registrada. Aguarde aprovação do administrador.");
              window.location.href = "/";
            } else if (!result.active) {
              localStorage.removeItem("needsApproval");
              toast.error("Usuário inativo. Contate o administrador.");
              clerk.signOut();
            } else {
              localStorage.removeItem("needsApproval");
              toast.success("Login realizado com sucesso!");
              window.location.href = "/";
            }
          }
        } catch (error: any) {
          console.error("Erro ao sincronizar usuário:", error);
          toast.error(error.message || "Erro ao fazer login");
          clerk.signOut();
        }
      };

      syncUser();
    }
  }, [isLoaded, isSignedIn, user, syncClerkUser, clerk]);

  // Show loading while Clerk loads
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-600">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  // User is signed in - show confirmation with user button
  if (isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-600">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-900 mb-2">PMESP</h1>
            <p className="text-gray-600">Controle de Materiais - CPI-7</p>
          </div>

          <div className="text-center">
            <p className="text-gray-600 mb-4">Você já está logado.</p>
            <div className="flex justify-center mb-4">
              <UserButton afterSignOutUrl="/" />
            </div>
            <button
              onClick={() => window.location.href = "/"}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Voltar ao início
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show sign in form
  if (!showSignUp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-600">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-900 mb-2">PMESP</h1>
            <p className="text-gray-600">Controle de Materiais - CPI-7</p>
          </div>

          <SignIn
            routing="hash"
            afterSignInUrl="/"
            fallbackRedirectUrl="/"
          />

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 mb-2">
              Novo usuário? Crie sua conta abaixo
            </p>
            <button
              onClick={() => setShowSignUp(true)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Criar Conta
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show sign up form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-600">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">PMESP</h1>
          <p className="text-gray-600">Controle de Materiais - CPI-7</p>
        </div>

        <SignUp
          routing="hash"
          afterSignUpUrl="/"
          fallbackRedirectUrl="/"
        />

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 mb-2">
            Já tem uma conta?
          </p>
          <button
            onClick={() => setShowSignUp(false)}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Fazer Login
          </button>
        </div>
      </div>
    </div>
  );
}