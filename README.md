# Sistema de Controle de Materiais - PMESP CPI-7

Sistema completo de gestão de materiais para a Polícia Militar do Estado de São Paulo - Comando de Policiamento do Interior 7.

## 🚀 Tecnologias

- **Frontend**: React + Vite + TypeScript
- **Backend**: Convex (banco de dados realtime)
- **Styling**: TailwindCSS
- **Autenticação**: Convex Auth
- **Gráficos**: Recharts
- **Notificações**: Sonner
- **Exportação**: XLSX, jsPDF

## 📦 Instalação

### 1. Instalar dependências

```bash
cd frontend
npm install
```

### 2. Configurar Convex

```bash
# Instalar Convex CLI globalmente (se ainda não tiver)
npm install -g convex

# Fazer login no Convex
npx convex login

# Inicializar projeto Convex
npx convex dev
```

O comando `npx convex dev` irá:
- Criar um projeto Convex (se ainda não existir)
- Gerar a URL do Convex
- Criar o arquivo `.env.local` com `VITE_CONVEX_URL`

### 3. Configurar autenticação

O sistema usa autenticação por senha do Convex Auth. O primeiro usuário que fizer login será automaticamente criado como administrador.

**Usuário admin padrão:**
- Email: `michelwilliam@policiamilitar.sp.gov.br`
- Senha: (será criada no primeiro login)

### 4. Inicializar dados padrão

Após fazer login como administrador:
1. Acesse a página "Unidades"
2. Clique em "Inicializar Sistema"
3. Isso criará as 10 unidades padrão e 7 categorias padrão

### 5. Executar o projeto

```bash
npm run dev
```

O sistema estará disponível em `http://localhost:5173`

## 🎯 Funcionalidades

### ✅ Autenticação e Controle de Acesso
- Login com email e senha
- Sistema de aprovação de usuários
- Dois níveis: Administrador e Usuário
- RLS (Row Level Security) implementado

### 📊 Dashboard
- Cards de resumo (total, por status)
- Gráfico de pizza: distribuição por status
- Gráfico de barras: materiais por unidade
- Busca global

### 📦 Gestão de Materiais
- CRUD completo
- Validação de patrimônio duplicado
- Badges de status coloridos:
  - 🟢 Verde: Operando
  - ⚪ Cinza: Descarga
  - 🔴 Vermelho: Baixado
- Deleção em lote
- Filtros por categoria, unidade e status

### 🏷️ Gestão de Categorias
- Criar, editar e deletar
- 7 categorias padrão

### 🏢 Gestão de Unidades
- Criar, editar e deletar
- 10 unidades pré-configuradas
- Contagem de materiais por unidade

### 👥 Gestão de Usuários (Admin)
- Aprovar/rejeitar novos usuários
- Editar papel (Admin/Usuário)
- Atribuir unidade
- Ativar/desativar usuários

### 📤 Importação e Exportação
- Importar CSV/XLSX
- Exportar CSV/XLSX/PDF
- PDF com cabeçalho institucional
- Opção de incluir gráficos no PDF

## 🔐 Segurança

- ✅ Autenticação obrigatória
- ✅ Controle de acesso baseado em papéis (RBAC)
- ✅ Validação de dados no backend
- ✅ Proteção contra patrimônios duplicados
- ✅ Usuários só podem editar seus próprios materiais
- ✅ Usuários só visualizam materiais de sua unidade
- ✅ Administradores têm acesso total

## 📝 Estrutura do Projeto

```
frontend/
├── src/
│   ├── components/     # Componentes reutilizáveis
│   ├── pages/          # Páginas do sistema
│   ├── hooks/          # Hooks customizados
│   └── App.tsx         # Componente principal
├── convex/
│   ├── schema.ts       # Schema do banco de dados
│   ├── materials.ts    # Funções de materiais
│   ├── categories.ts   # Funções de categorias
│   ├── units.ts        # Funções de unidades
│   ├── users.ts        # Funções de usuários
│   └── auth.ts         # Configuração de autenticação
└── public/             # Arquivos estáticos
```

## 🎨 Design

- **Cor Primária**: Azul (#1e40af - blue-900)
- **Paleta de Status**:
  - Verde (#10b981): Operando
  - Cinza (#6b7280): Descarga
  - Vermelho (#ef4444): Baixado
- **Layout**: Sidebar de navegação + área principal
- **Responsivo**: Funciona em desktop, tablet e mobile

## 🐛 Troubleshooting

### Erro: "VITE_CONVEX_URL não configurado"
Execute `npx convex dev` para gerar a URL do Convex.

### Erro de autenticação
Certifique-se de que o Convex Auth está configurado corretamente no arquivo `convex/auth.ts`.

### Erro ao inicializar sistema
Certifique-se de estar logado como administrador e que não há unidades/categorias já criadas.

## 📄 Licença

Sistema desenvolvido para uso exclusivo da PMESP - CPI-7.

