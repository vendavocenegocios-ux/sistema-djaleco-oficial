

## Plano: Corrigir Loop Mobile, Dashboard Truncado e Aba Sistema

### 1. Corrigir Loop no Mobile e Botão Sair

**Causa raiz**: O hook `useAuthProvider` faz `await fetchRole()` dentro do callback `onAuthStateChange`. A documentação do Supabase alerta que não se deve fazer `await` de chamadas assíncronas dentro desse callback, pois isso bloqueia o processamento de eventos de autenticação subsequentes. Quando o `signOut` dispara, o callback tenta executar mas fica preso no `await` anterior, criando um deadlock/loop.

**Solução** (`src/hooks/useAuth.ts`):
- Usar `setTimeout` para desacoplar o `fetchRole` do callback do `onAuthStateChange` (não bloquear o callback)
- Garantir que `getSession()` execute primeiro e só depois registrar o listener
- Adicionar navegação para `/login` no `signOut` via `window.location`

### 2. Dashboard Truncado

**Causa raiz**: O grid `grid-cols-2 lg:grid-cols-5` com 5 colunas em telas médias/grandes faz os cards ficarem muito estreitos, truncando valores monetários como "R$ 2.098,46".

**Solução** (`src/pages/Dashboard.tsx`):
- Mudar grid para `grid-cols-2 md:grid-cols-3 xl:grid-cols-5` nos KPIs
- Adicionar `break-all` ou `text-wrap` nos valores monetários
- Reduzir o tamanho da fonte dos valores em telas menores
- Garantir que os cards financeiros também se adaptem: `grid-cols-2 md:grid-cols-2 xl:grid-cols-4`

### 3. Aba "Sistema" (Admin Only)

**Arquivos novos**: `src/pages/Sistema.tsx`

**Arquivos modificados**:
- `src/App.tsx` — adicionar rota `/sistema` protegida com `adminOnly`
- `src/components/layout/AppSidebar.tsx` — adicionar item "Sistema" no menu, visível apenas para admin

**Conteúdo da página Sistema**:
- **Saúde Geral**: indicador verde/amarelo/vermelho baseado na conectividade com Supabase
- **Banco de Dados**: contagem de tabelas, total de registros por tabela (pedidos, clientes, produtos, vendedores)
- **Autenticação**: número de usuários registrados, último login
- **Edge Functions**: listar as funções implantadas e status
- **Armazenamento**: informações sobre buckets
- **Latência**: medir tempo de resposta de uma query simples ao Supabase
- **Versão do App**: exibir data do build ou versão
- Cards com ícones e indicadores visuais de status (verde = ok, vermelho = problema)

Dados obtidos via queries diretas ao Supabase (contagens das tabelas, ping de latência, verificação de sessão auth).

### Resumo de Mudanças

| Arquivo | Ação |
|---------|------|
| `src/hooks/useAuth.ts` | Corrigir race condition no onAuthStateChange, melhorar signOut |
| `src/pages/Dashboard.tsx` | Ajustar grid responsivo para evitar truncamento |
| `src/pages/Sistema.tsx` | Criar página de saúde do sistema (admin only) |
| `src/App.tsx` | Adicionar rota `/sistema` |
| `src/components/layout/AppSidebar.tsx` | Adicionar "Sistema" no menu admin |

