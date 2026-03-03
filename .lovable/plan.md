
# Plano: Abas de Pagamento, Etapas na Lista, Kanban Detalhado e Logo

## 1. Pagina de Pedidos -- Abas Pagos vs Pendentes

Adicionar tabs na pagina `Pedidos.tsx`:
- **Aba "Pagos"** (principal): mostra apenas pedidos com status pago (filtro por `valor_bruto > 0 AND taxa_pagarme > 0` ou por um campo de status de pagamento)
- **Aba "Pendentes"**: pedidos nao pagos ou sem confirmacao de pagamento

Como a tabela `pedidos` nao tem campo de status de pagamento, a logica sera:
- Pedidos com `nuvemshop_order_id` cujo status na Nuvemshop era "paid"/"closed" sao considerados pagos. O sync ja mapeia isso na etapa de producao.
- Alternativa mais simples e confiavel: considerar pedidos com `etapa_producao != 'Novo'` e `valor_bruto > 0` como pagos. Pedidos com `etapa_producao = 'Novo'` ou nulo sao pendentes.

**Decisao**: Usar a presenca de `taxa_pagarme > 0` OU `etapa_producao` diferente de "Novo"/"Cancelado" como indicador de pagamento. Cruzar com dados do Pagarme para popular `taxa_pagarme` nos pedidos.

### Dropdown de Etapa na Lista
Na tabela de pedidos, substituir o Badge da etapa por um `Select` dropdown com as etapas: Planejamento, Corte, Costura, Acabamento, Embalagem, Despachado, Entregue. Ao alterar, atualiza `etapa_producao` e `etapa_entrada_em` no banco -- sincronizando automaticamente com o Kanban.

### Etapa "Entregue"
Adicionar "Entregue" como ultima opcao no dropdown e no Kanban (opcional, so na lista pode ser suficiente).

---

## 2. Financeiro -- Separar Pagos/Pendentes no Pagarme

Na aba Pagar.me do Financeiro:
- Separar as transacoes em duas sub-abas: **"Pagos"** e **"Pendentes"**
- Agrupar pedidos pagos por periodo de deposito (data de pagamento `paid_at`) para facilitar conferencia com os depositos recebidos da Pagarme

---

## 3. Contabilizar Taxas Pagarme nos Pedidos

Criar logica no sync da Nuvemshop para buscar a taxa correspondente do Pagarme:
- Ao sincronizar, usar o `order_code` do Pagarme (que corresponde ao numero do pedido Nuvemshop) para preencher `taxa_pagarme` na tabela `pedidos`
- Recalcular `valor_liquido = valor_bruto - frete - taxa_pagarme`

Alternativa mais pratica: criar uma funcao no `nuvemshop-sync` que, apos importar pedidos, consulta a edge function `pagarme-extrato` para cruzar e atualizar os valores.

---

## 4. Producao (Kanban) -- Cards Detalhados e Prazos

### Aba "Prazos por Etapa"
Nova aba na pagina de Producao mostrando os prazos definidos:

| Etapa | Prazo |
|-------|-------|
| Corte | 4 dias |
| Costura | 10 dias |
| Acabamento | 2 dias |
| Embalagem | 1 dia |
| Despachado | 1 dia |

### Sistema de Cores por Prazo
Cada card no Kanban tera cor dinamica baseada no tempo na etapa:
- **Azul claro**: dentro do prazo (< 50% do tempo estimado)
- **Laranja**: entre 50% e 89% do tempo
- **Vermelho**: >= 90% do tempo estimado

Calculo: `percentual = horasNaEtapa / (prazoDias * 24) * 100`

### Cards Compactos e Informativos
Cada card mostrara:
- Numero do pedido + origem (badge pequeno)
- Nome do cliente
- Telefone (icone + numero)
- Cidade/Estado
- Itens: lista compacta (ex: "2x Jaleco Branco P, 1x Scrub Azul M")
- Tempo na etapa com indicador de cor

Para isso, o hook `usePedidos` precisara carregar os itens junto (ou criar query separada para pedidos com itens no Kanban).

### Layout das Colunas
- Reduzir `min-w` das colunas de 260px para ~220px
- Planejamento tera a mesma largura das demais (atualmente todas sao iguais, entao so ajustar o tamanho geral)
- Melhorar a fluidez do drag-and-drop com feedback visual (highlight da coluna ao arrastar sobre ela)

---

## 5. Logo 4x Maior

No `AppSidebar.tsx`:
- Sidebar expandida: `h-10` -> `h-40` (4x)
- Sidebar colapsada: `h-7` -> `h-28` (4x)

---

## Detalhes Tecnicos

### Arquivos a editar

```text
src/pages/Pedidos.tsx
  - Adicionar Tabs (Pagos / Pendentes)
  - Substituir Badge da etapa por Select dropdown
  - Importar useUpdatePedido

src/pages/Producao.tsx
  - Reescrever cards com dados detalhados (cliente, tel, endereco, itens)
  - Adicionar sistema de cores por prazo
  - Adicionar aba "Prazos" 
  - Reduzir largura das colunas
  - Melhorar feedback visual do drag-and-drop
  - Carregar pedido_itens junto

src/pages/Financeiro.tsx
  - Na aba Pagarme, separar em Pagos/Pendentes
  - Agrupar pagos por data de deposito

src/hooks/usePedidos.ts
  - Criar hook usePedidosComItens() que faz join de pedidos + pedido_itens

src/components/layout/AppSidebar.tsx
  - Aumentar tamanho da logo 4x

supabase/functions/nuvemshop-sync/index.ts
  - Apos sync, cruzar com Pagarme para popular taxa_pagarme
```

### Prazos por Etapa (constante)

```text
const PRAZOS_ETAPA: Record<string, number> = {
  Corte: 4,
  Costura: 10,
  Acabamento: 2,
  Embalagem: 1,
  Despachado: 1,
};
```

### Logica de Cor do Card

```text
function getCardColor(etapa, etapa_entrada_em):
  prazo = PRAZOS_ETAPA[etapa]
  if (!prazo || !etapa_entrada_em) return "default"
  horasPassadas = differenceInHours(now, etapa_entrada_em)
  percentual = horasPassadas / (prazo * 24) * 100
  if percentual >= 90: return "red" (border-red-400)
  if percentual >= 50: return "orange" (border-orange-400)
  return "blue" (border-blue-300)
```

### Criterio Pago vs Pendente (Pedidos)

Considerar pago quando:
- Nuvemshop: status original era "paid", "closed" ou "shipped" (o sync ja importa esses)
- O `valor_bruto > 0` e `etapa_producao` nao e "Novo" nem "Cancelado"

Pendente: `etapa_producao = 'Novo'` ou pedido sem confirmacao.

### Ordem de implementacao

1. Logo 4x maior (rapido)
2. Pedidos: abas Pagos/Pendentes + dropdown de etapa
3. Producao: cards detalhados + cores por prazo + aba prazos + colunas menores
4. Financeiro: separar pagos/pendentes no Pagarme + agrupamento
5. Sync: cruzar taxa Pagarme nos pedidos
