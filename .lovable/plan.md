

## Plano: Corrigir Drag & Drop Mobile + Botão PWA

### Problema 1: Drag & Drop no Mobile
O card tem um `<Link>` dentro do elemento draggable. No mobile, ao pressionar (long press), o navegador intercepta e abre o menu de contexto do link (como mostra a segunda imagem). O `touchAction: "none"` no div pai não impede o comportamento do `<Link>` dentro dele.

**Solução**: Separar a interação de toque (drag) da navegação (tap):
- Remover o `<Link>` wrapper do card
- No **tap rápido** (toque < 200ms sem mover), navegar programaticamente via `useNavigate`
- No **long press ou arrasto**, iniciar o drag (sem abrir link)
- Adicionar feedback visual durante o drag (opacity, scale)
- Usar `e.preventDefault()` no `touchStart` para evitar o menu de contexto do navegador no link

**Arquivo**: `src/pages/Producao.tsx`

### Problema 2: Botão PWA não aparece
O `beforeinstallprompt` só é disparado pelo navegador quando certas condições são atendidas (HTTPS, manifest válido, service worker registrado, sem estar já instalado). No preview do Lovable ou em HTTP, o evento nunca dispara, então `canInstall` fica `false`.

**Solução**: O botão já está implementado corretamente. O problema é que no ambiente de preview (Lovable) o PWA não é oferecido. Em produção (app.djaleco.com.br via Vercel com HTTPS), ele deve funcionar. Para garantir visibilidade, vou:
- Adicionar um fallback: se o navegador suportar PWA mas o prompt não apareceu em 3 segundos, mostrar um banner com instruções manuais ("Adicione à tela inicial" via menu do navegador)
- Isso cobre iOS Safari que nunca dispara `beforeinstallprompt`

**Arquivos**: `src/hooks/usePWA.ts`, `src/pages/Login.tsx`

### Resumo de Mudanças
1. **`src/pages/Producao.tsx`**: Substituir `<Link>` por tap programático + melhorar touch drag com delay de 150ms para distinguir tap vs drag
2. **`src/hooks/usePWA.ts`**: Adicionar detecção de iOS e fallback para instrução manual
3. **`src/pages/Login.tsx`**: Mostrar botão/instrução de instalação para iOS (que não suporta `beforeinstallprompt`)

