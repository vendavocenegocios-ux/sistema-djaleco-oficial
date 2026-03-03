

# Plano: Completar pedido com valores, pagamento e corrigir copia WhatsApp

## 3 problemas + 1 pergunta

### 1. Copia WhatsApp nao inclui tamanho e cor
**Arquivo:** `src/pages/Pedidos.tsx` linha 99-101

Hoje: `2x Scrub Samara, 2x Scrub Samara`
Corrigir para: `2x Scrub Samara (Lilás) GG (46), 2x Scrub Samara (Rosa) M (42)`

Alterar o `pedidoDesc` para incluir cor e tamanho de cada item.

### 2. Valor bruto zerado — auto-calcular a partir dos precos dos produtos

**Migration:** Adicionar coluna `preco_unitario numeric` na tabela `pedido_itens` para guardar o preco de cada item.

**`src/pages/NovoPedido.tsx`:**
- Ao selecionar produto no combobox, guardar `price` do produto Nuvemshop no item
- Calcular `valor_bruto` automaticamente: soma de `quantidade * preco_unitario` de todos os itens
- Exibir preco unitario ao lado de cada item
- O usuario pode ainda editar o valor bruto manualmente se quiser

**`src/pages/PedidoDetalhe.tsx`:**
- Exibir preco unitario de cada item na lista de itens

### 3. Campos de pagamento

**Migration:** Adicionar colunas na tabela `pedidos`:
- `forma_pagamento text` (PIX, Cartao de Credito, etc.)
- `parcelas integer default 1`

O campo `status_pagamento` ja existe (default 'pendente').

**`src/pages/NovoPedido.tsx`:**
- Adicionar Select para status de pagamento: "Pendente" / "Recebido"
- Adicionar Select para forma de pagamento: "PIX" / "Cartao de Credito"
- Se cartao, mostrar campo de parcelas (1x a 12x)
- Pedido com status "recebido" vai para a aba principal

**`src/pages/PedidoDetalhe.tsx`:**
- Exibir e permitir editar status de pagamento e forma de pagamento

### 4. SuperFrete — como funciona

A integracao ja esta implementada. Funciona assim:
- Quando um pedido tem `rastreio_codigo` ou `superfrete_order_id`, o botao "Consultar SuperFrete" na tela do pedido consulta a API
- Se o pacote foi entregue, atualiza automaticamente a etapa para "Entregue" e preenche `data_entrega`
- Para pedidos do WhatsApp, o codigo de rastreio precisa ser preenchido manualmente no pedido (ou vira do SuperFrete se o envio for feito por la)

### Arquivos afetados
- `src/pages/Pedidos.tsx` — corrigir copia WhatsApp com tamanho/cor
- `src/pages/NovoPedido.tsx` — preco unitario, calculo automatico valor bruto, campos pagamento
- `src/pages/PedidoDetalhe.tsx` — exibir preco unitario, status/forma pagamento
- Migration SQL — `preco_unitario` em `pedido_itens`, `forma_pagamento` e `parcelas` em `pedidos`

