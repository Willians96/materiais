// RequestAccessPage foi descontinuado
// O fluxo de solicitação agora é feito diretamente no LoginPage
// Este arquivo existe apenas para compatibilidade de imports

export default function RequestAccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Solicitação enviada</h1>
          <p className="text-gray-600">
            Aguarde a aprovação do administrador. Você será notificado por email.
          </p>
        </div>
      </div>
    </div>
  );
}
