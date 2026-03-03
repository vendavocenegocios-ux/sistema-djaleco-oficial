
ALTER TABLE public.pedido_itens ADD COLUMN IF NOT EXISTS preco_unitario numeric DEFAULT 0;
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS forma_pagamento text;
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS parcelas integer DEFAULT 1;
