

# Plano: Corrigir Texto de Copia WhatsApp

## Problemas Identificados

1. **CPF/CNPJ sem formato**: Armazenado como `17378901784`, precisa formatar como `173.789.017-84` (CPF) ou `XX.XXX.XXX/XXXX-XX` (CNPJ)
2. **Endereco/Bairro/CEP vazios**: Esses campos nao existem no banco. A Nuvemshop envia `shipping_address` com `address`, `locality` (bairro) e `zipcode`. Precisamos adicionar colunas e popular no sync.
3. **Pedido duplicando cor/tamanho**: O `nome_produto` ja contem "(Azul Marinho, P (38 a 40))" e o codigo adiciona `tamanho` e `cor` novamente. Solucao: usar so `nome_produto` sem anexar cor/tamanho.
4. **Profissao**: Deve vir do campo `clientes.observacoes`

## Alteracoes

### 1. Migracoes no banco -- adicionar colunas de endereco

Tabela `clientes`:
- `endereco` text nullable
- `bairro` text nullable
- `cep` text nullable

Tabela `pedidos`:
- `endereco` text nullable
- `bairro` text nullable
- `cep` text nullable

### 2. `nuvemshop-sync` -- popular endereco

Extrair do `order.shipping_address`:
- `address` -> endereco
- `locality` -> bairro  
- `zipcode` -> cep

Salvar tanto no pedido quanto no cliente.

### 3. `Pedidos.tsx` -- corrigir handleCopyWhatsApp

- Buscar cliente completo (documento, observacoes, endereco, bairro, cep)
- Formatar CPF/CNPJ com mascara
- Usar `observacoes` como PROFISSAO
- Usar endereco/bairro/cep do pedido (ou fallback do cliente)
- Itens: usar apenas `quantidade` + `nome_produto` (ja contem cor e tamanho no nome)

### Arquivos

- **Migracao SQL**: adicionar 6 colunas (3 em clientes, 3 em pedidos)
- `supabase/functions/nuvemshop-sync/index.ts` -- extrair e salvar endereco
- `src/pages/Pedidos.tsx` -- corrigir funcao de copia

