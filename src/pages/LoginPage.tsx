import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "convex-generated/api.js";
import { toast } from "sonner";
import { useUser, useClerk, SignedIn, SignedOut, SignIn, SignUp, UserButton } from "@clerk/clerk-react";

export default function LoginPage() {
  const { user, isSignedIn } = useUser();
  const clerk = useClerk();
  const syncClerkUser = useMutation(api.authCustom.syncClerkUser);

  // Sync user with our database when signed in
  useEffect(() => {
    if (isSignedIn && user) {
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
              // Usuário precisa de aprovação
              localStorage.setItem("needsApproval", "true");
              toast.info("Sua solicitação de acesso foi registrada. Aguarde aprovação do administrador.");
              // Recarregar para mostrar página de solicitação
              window.location.href = "/";
            } else if (!result.active) {
              // Usuário inativo
              localStorage.removeItem("needsApproval");
              toast.error("Usuário inativo. Contate o administrador.");
              clerk.signOut();
            } else {
              // Login bem sucedido
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
  }, [isSignedIn, user, syncClerkUser, clerk]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-600">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">PMESP</h1>
          <p className="text-gray-600">Controle de Materiais - CPI-7</p>
        </div>

        {/* Show Clerk components based on auth state */}
        <SignedIn>
          <div className="text-center">
            <p className="text-gray-600 mb-4">Você já está logado.</p>
            <div className="flex items-center justify-center mb-4">
              <UserButton afterSignOutUrl="/" />
            </div>
            <p className="text-sm text-gray-500">
              Se não for redirecionado, clique em "Voltar ao início"
            </p>
          </div>
        </SignedIn>

        <SignedOut>
          <div>
            <SignIn
              routing="path"
              path="/login"
              signUpUrl="/signup"
              afterSignInUrl="/"
              fallbackRedirectUrl="/"
            />
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 mb-4">
                Novo usuário? Crie sua conta abaixo
              </p>
              <SignUp
                routing="path"
                path="/signup"
                signInUrl="/login"
                afterSignUpUrl="/"
                fallbackRedirectUrl="/"
              />
            </div>
          </div>
        </SignedOut>
      </div>
    </div>
  );
}