

## Plano: Autenticação com Perfis Admin e Usuário

### Resumo
Adicionar autenticação ao app com dois perfis:
- **Admin** (wnogueira@hotmail.com) — acesso total, pode editar/excluir dados, manutenção
- **Usuário** (apaulaalt@gmail.com) — acesso de consulta e criação de pedidos, sem poder excluir dados ou alterar configurações

### Implementação

#### 1. Banco de Dados (Migrations)
- Criar enum `app_role` com valores `admin` e `user`
- Criar tabela `user_roles` (user_id, role) com RLS e função `has_role()` security definer
- Criar tabela `profiles` (id, email, nome, created_at) com trigger para auto-criar perfil no signup

#### 2. Criar Usuários
- Criar os dois usuários via Supabase Auth (signup)
- Inserir roles: `admin` para wnogueira, `user` para apaulaalt

#### 3. Página de Login (`src/pages/Login.tsx`)
- Formulário simples com email + senha
- Redireciona para Dashboard após login
- Sem opção de cadastro (usuários são criados pelo admin)

#### 4. Auth Context (`src/hooks/useAuth.ts`)
- Hook com `onAuthStateChange` + `getSession`
- Expõe `user`, `role`, `signOut`, `loading`
- Consulta `user_roles` para determinar o papel

#### 5. Rotas Protegidas (`src/components/ProtectedRoute.tsx`)
- Componente wrapper que redireciona para `/login` se não autenticado
- Todas as rotas existentes ficam protegidas

#### 6. Controle de Acesso por Role
- **Admin**: acesso total (tudo que já existe)
- **User (Ana Paula)**: 
  - Pode ver Dashboard, Pedidos, Clientes, Produção, Produtos
  - Pode criar pedidos
  - **Não pode**: excluir pedidos/clientes, acessar página Vendedores, editar configurações financeiras (comissões)
  - Botões de exclusão e edição de vendedores ficam ocultos/desabilitados

#### 7. Sidebar e Layout
- Adicionar botão de logout no `AppSidebar`
- Ocultar itens de menu restritos conforme o role (ex: Vendedores só para admin)

### Arquivos a Criar
- `src/pages/Login.tsx`
- `src/hooks/useAuth.ts`
- `src/components/ProtectedRoute.tsx`

### Arquivos a Modificar
- `src/App.tsx` — adicionar rota `/login` e proteger demais rotas
- `src/components/layout/AppSidebar.tsx` — botão logout + filtrar menu por role
- `src/components/layout/AppLayout.tsx` — exibir nome do usuário no header
- Páginas com ações destrutivas (Pedidos, Clientes, Vendedores, Financeiro) — ocultar botões conforme role

### Segurança
- Roles armazenados em tabela separada (`user_roles`), nunca no profiles
- Função `has_role()` com `SECURITY DEFINER` para evitar recursão RLS
- Senhas nunca armazenadas no código — usuários criados via Supabase Auth

