

# Plano: Corrigir status_pagamento dos pedidos existentes

## Problema raiz

A coluna `status_pagamento` foi criada com default `'pendente'`. O sync da Nuvemshop inclui a logica correta (`order.payment_status === "paid"` → `"recebido"`), mas a funcao esta morrendo por WORKER_LIMIT antes de completar as atualizacoes. Resultado: todos os 423 pedidos ficam com `"pendente"`.

## Solucao (2 partes)

### 1. SQL Migration — corrigir dados existentes

Todos os pedidos do site com `valor_bruto > 0` vieram da Nuvemshop e sao pedidos pagos (a Nuvemshop so sincroniza pedidos confirmados/pagos). Rodar:

```sql
UPDATE pedidos SET status_pagamento = 'recebido' 
WHERE origem = 'site' AND valor_bruto > 0 AND nuvemshop_order_id IS NOT NULL;
```

Isso corrige imediatamente todos os pedidos existentes.

### 2. Otimizar sync para nao estourar WORKER_LIMIT

Limitar o fetch de pedidos da Nuvemshop aos ultimos 3 meses (em vez de todos os 423+). Isso reduz drasticamente o volume de processamento e evita timeout. Pedidos futuros ja serao inseridos com `status_pagamento` correto pelo sync.

**Arquivo:** `supabase/functions/nuvemshop-sync/index.ts` — adicionar filtro `created_at_min` na chamada da API.

### Resultado esperado

- Aba **Recebidos**: pedidos do site pagos + pedidos WhatsApp marcados manualmente
- Aba **Pendentes**: pedidos sem confirmacao de pagamento (whatsapp novos, eventuais pedidos site nao pagos)

