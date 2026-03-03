

# Plano: Ajustar Pedidos e Criar Formulario de Novo Pedido

## 1. Renomear aba "Pagos" para "Recebidos" e ajustar filtro

A aba principal mostrara somente pedidos efetivamente pagos/recebidos. A logica `isPago` ja faz isso — basta renomear o label de "Pagos" para "Recebidos".

**Arquivo:** `src/pages/Pedidos.tsx` — trocar texto da tab.

## 2. Endereco completo no sync da Nuvemshop

O `shipping_address` da Nuvemshop tem campos separados: `address` (rua), `number`, `floor` (andar/apto/loja), `locality` (bairro), `zipcode`, `city`, `province`. Atualmente so capturamos `address`. Precisamos concatenar:

```
enderecoCliente = [address, number, floor].filter(Boolean).join(", ")
```

Exemplo resultado: `Rua Santa Rita da Estrela, 79, Apto 12`

**Arquivo:** `supabase/functions/nuvemshop-sync/index.ts` — ajustar linha 110 para concatenar `address`, `number` e `floor`.

## 3. Criar pagina de Novo Pedido com paste do WhatsApp

### Rota
- Adicionar rota `/pedidos/novo` em `App.tsx` (ANTES de `/pedidos/:id` para evitar conflito)

### Pagina `src/pages/NovoPedido.tsx`
- Formulario com campos: cliente_nome, cliente_telefone, cidade, estado, endereco, bairro, cep, valor_bruto, frete
- Area de texto "Colar dados do WhatsApp" que aceita o bloco padronizado e faz parse linha a linha:
  - Regex por label (`NOME:`, `CELULAR:`, etc.) para extrair valores
  - `PEDIDO:` — faz parse de `2x Produto Nome` e busca produtos na base (match por nome parcial em `pedido_itens` ou catalogo se houver)
- Botao "Preencher" que popula o formulario
- Botao "Salvar Pedido" que:
  1. Gera proximo numero WP (`getNextWPNumber`)
  2. Cria pedido via `useCreatePedido`
  3. Cria itens via `useCreatePedidoItem`
  4. Redireciona para `/pedidos/:id`

### Parse do texto WhatsApp
O texto colado segue o formato padrao que ja geramos:
```
NOME: Joao Silva
CELULAR: (11) 99999-9999
PROFISSAO: Enfermeira
ENDERECO COMPLETO: Rua X, 123, Apto 4
BAIRRO: Centro
CIDADE: Sao Paulo
ESTADO: SP
CEP: 01000-000
CPF/CNPJ: 123.456.789-00
DATA DO PEDIDO: 15/01/2025
PEDIDO: 2x Jaleco Branco P, 1x Scrub Azul M
```
Cada linha eh parseada com `split(":")` no primeiro `:` para separar label e valor.

Para os itens do pedido, parse `Nx nome_produto` e armazenamos como texto — o usuario pode ajustar manualmente antes de salvar.

### Arquivos a criar/editar
- **Criar:** `src/pages/NovoPedido.tsx`
- **Editar:** `src/App.tsx` — adicionar rota
- **Editar:** `supabase/functions/nuvemshop-sync/index.ts` — endereco completo
- **Editar:** `src/pages/Pedidos.tsx` — renomear aba

