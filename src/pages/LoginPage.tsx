import { useState } from "react";
import { SignIn, SignUp, UserButton, useUser } from "@clerk/clerk-react";

export default function LoginPage() {
  const { isSignedIn, isLoaded } = useUser();
  const [showSignUp, setShowSignUp] = useState(false);

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

  // User is signed in - show confirmation (App.tsx will handle the redirect)
  if (isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-600">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-900 mb-2">PMESP</h1>
            <p className="text-gray-600">Controle de Materiais - CPI-7</p>
          </div>

          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mx-auto mb-4"></div>
            <p className="text-gray-600 mb-4">Autenticando no sistema...</p>
            <div className="flex justify-center mb-4">
              <UserButton afterSignOutUrl="/" />
            </div>
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