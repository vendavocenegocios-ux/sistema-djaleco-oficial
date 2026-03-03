

# Plano: Produtos no Novo Pedido, SuperFrete, Mascaras e Correções

## Problemas identificados

### Bug critico: Produtos nao carregam no formulario
A Edge Function `nuvemshop-products` retorna o array diretamente (`[{...}, {...}]`), mas `useNuvemProducts` faz `return data?.products || []` — `data.products` e `undefined`, resultado: lista vazia. Alem disso, tamanhos como "M (42)", "G (44)" estao sendo classificados como cores porque o `KNOWN_SIZES` so verifica match exato.

## Solucoes

### 1. Corrigir carregamento de produtos (bug)
**`src/pages/NovoPedido.tsx`** — na funcao `useNuvemProducts`, trocar `return data?.products || []` por `return Array.isArray(data) ? data : (data?.products || [])`.

### 2. Corrigir classificacao de tamanhos na Edge Function
**`supabase/functions/nuvemshop-products/index.ts`** — alem do match exato em KNOWN_SIZES, verificar se o valor comeca com um tamanho conhecido (regex: `/^(PP|P|M|G|GG|XG|EG)\b/i`). Valores como "M (42)", "PP (36)" serao classificados como tamanhos. Tambem adicionar `price` (menor preco entre variantes) ao retorno.

### 3. Mascaras de celular e CPF/CNPJ
**`src/pages/NovoPedido.tsx`** — adicionar funcoes de mascara:
- Celular: `(DD) 9XXXX-XXXX` — formata ao digitar
- CPF/CNPJ: `XXX.XXX.XXX-XX` ou `XX.XXX.XXX/XXXX-XX` — detecta automaticamente pelo tamanho

### 4. SuperFrete — rastreio e data de entrega
**`supabase/functions/superfrete-tracking/index.ts`** — nova Edge Function que:
- Recebe `pedido_id` ou `rastreio_codigo`
- Consulta API SuperFrete para obter status de rastreio e data de entrega
- Atualiza `rastreio_codigo` e `data_entrega` na tabela `pedidos`
- Quando etapa = "Entregue", preenche `data_entrega` com a data do SuperFrete

**`src/pages/PedidoDetalhe.tsx`** — exibir rastreio e data de entrega. Botao para consultar SuperFrete.

### 5. Calculo de frete via SuperFrete (exploratorio)
Sera avaliado se a API do SuperFrete permite calculo previo de frete com CEP de destino + peso. Se possivel, ao preencher CEP no formulario, calcular frete automaticamente. Caso contrario, manter campo manual.

### Arquivos afetados
- `supabase/functions/nuvemshop-products/index.ts` — corrigir sizes, adicionar price
- `src/pages/NovoPedido.tsx` — fix useNuvemProducts, mascaras telefone/CPF, exibir preco do produto
- `supabase/functions/superfrete-tracking/index.ts` — nova Edge Function
- `src/pages/PedidoDetalhe.tsx` — exibir rastreio/entrega, botao SuperFrete
- `supabase/config.toml` — registrar nova function

