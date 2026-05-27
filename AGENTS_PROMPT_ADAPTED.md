Prompts de Agente — App Eng+ (Frontend)
Fluxo: Git Feature Branch Workflow
Cada agente trabalha numa branch isolada e faz push ao final.
O Agente 5 é o revisor/integrador — não faz código novo,
apenas valida e une o trabalho dos outros 4.
Ordem de disparo recomendada:

Agentes 1, 2, 3 e 4 podem rodar em paralelo
Agente 5 só deve ser disparado após os 4 anteriores terem feito push

---

Agente 1 — Segurança e Validações de Formulário
Branch: fix/security
Você é um Engenheiro Frontend especializado em Segurança e Validação de Dados.

Seu objetivo é reforçar a segurança do lado do cliente no repositório do aplicativo Eng+ (Frontend React).

### SETUP INICIAL — execute antes de qualquer coisa
npm install
git checkout -b fix/security

### TAREFA 1 — Validação de E-mail e Senha no Cadastro (Login.tsx e Register.tsx)
Arquivos: src/components/auth/Register.tsx e src/components/auth/Login.tsx
Atualmente, os formulários apenas usam a tag `required` nativa do HTML.
Atualize a função de submit em `Register.tsx` para:
- Validar se as senhas (senha e confirmar senha) coincidem. Se não, lançar um `alert` (ou `toast` futuramente) e impedir o submit.
- Validar se a senha possui no mínimo 8 caracteres.
Em `Login.tsx`, valide se o email informado contém o caractere `@` e um domínio válido. Se for inválido, exiba um alerta e aborte o submit.

### TAREFA 2 — Criação de .env.example
Na raiz do projeto, crie o arquivo `.env.example` com as variáveis necessárias documentadas (ex: VITE_API_URL, VITE_ENV), sem valores reais.
Se não houver variáveis específicas, crie com VITE_API_BASE_URL=http://localhost:3000/api.

### TAREFA 3 — Proteção contra múltiplos cliques
Em `Login.tsx` e `Register.tsx`, adicione um estado `isLoading` que desabilite o botão de submit (alterando sua opacidade e a prop `disabled`) enquanto o login/cadastro estiver "sendo processado" (use um setTimeout de 1s para simular).

### ENTREGA — execute ao final
git add .
git commit -m "fix(security): validacoes de formulario, bloqueio multi-click e env.example"
git push origin fix/security

Após o push, exiba:
- O diff completo de cada arquivo alterado
- A lista de vulnerabilidades de frontend corrigidas
- Qualquer item que requer decisão de arquitetura e NÃO foi implementado

NÃO altere nenhum arquivo fora do escopo acima.

---

Agente 2 — PWA e UX Mobile
Branch: feat/pwa
Você é um Engenheiro Frontend sênior especializado em PWA, Workbox e UX mobile.

Seu objetivo é converter o aplicativo React em um Progressive Web App instalável.

### SETUP INICIAL — execute antes de qualquer coisa
npm install
npm install vite-plugin-pwa --save-dev
git checkout -b feat/pwa

### TAREFA 1 — CSS nativo mobile (Quick Win)
Arquivo: src/index.css
Adicione o bloco de defesas globais de UI ao final do arquivo:
- `-webkit-tap-highlight-color: transparent` no `body`
- `overscroll-behavior-y: none` no `body`
- `user-select: none` no `body`
- `user-select: auto` em `input`, `textarea`, `p`
Não remova nenhuma regra existente.

### TAREFA 2 — Configuração do Vite PWA
Arquivo: vite.config.ts
Importe e configure a extensão `VitePWA` no array de plugins.
Configure-o para usar a estratégia `generateSW`, e no `manifest` configure:
- `name` e `short_name` como 'Eng+'
- `display: 'standalone'`
- `theme_color: '#ffffff'`
- Configure os ícones apontando para `logo.svg` ou arquivos em `public/`.

### TAREFA 3 — Safe Area no MobileLayout
Arquivo: src/components/layout/MobileLayout.tsx e src/components/layout/BottomNav.tsx
Verifique se a classe `pb-safe` está funcionando ou necessita do plugin Tailwind.
Instale `tailwindcss-safe-area` se necessário e configure no tailwind (ou via `@theme` no css do Tailwind v4) para dar padding correto na barra de navegação no iOS.

### TAREFA 4 — InstallPrompt Component
Crie o componente `src/components/ui/InstallPrompt.tsx` que exibe visualmente para o usuário instalar o App (um botão simples ou modal).
Importe e adicione esse componente dentro de `App.tsx` logo antes do fechamento principal do `<MobileLayout>`.

### ENTREGA — execute ao final
git add .
git commit -m "feat(pwa): css mobile fixes, vite-plugin-pwa, install prompt e safe-area"
git push origin feat/pwa

Após o push, exiba:
- O diff completo de cada arquivo alterado
- Confirmação de que o app agora compila com Service Worker.

NÃO altere nenhum arquivo fora do escopo acima.

---

Agente 3 — Refatoração e Hooks
Branch: refactor/hooks
Você é um Engenheiro Frontend sênior especializado em React.

Seu objetivo é refatorar o sistema do aplicativo, eliminando código duplicado em `App.tsx` criando hooks reutilizáveis.

### SETUP INICIAL — execute antes de qualquer coisa
npm install
git checkout -b refactor/hooks

### TAREFA 1 — Extrair lógica de Notificações
Arquivo: src/App.tsx
Atualmente o `App.tsx` possui várias linhas gerenciando o estado de notificações (`notificationsList`, `activeToast`, funções `handleMarkAllAsRead`, `handleClearAll`, etc) e salvando em localStorage.
Crie um arquivo `src/hooks/useNotifications.ts` e mova toda essa lógica para lá.
O hook deve retornar: `{ notifications, activeToast, markAllAsRead, clearAll, toggleRead, triggerPushNotification }`.

### TAREFA 2 — Refatorar o Toast de Notificação Realtime
Arquivo: src/App.tsx
A parte do JSX que renderiza o "Real-time Slide-down Push Notification Toast" é gigante e está inline no `App.tsx`.
Extraia este bloco para um novo componente `src/components/ui/PushToast.tsx` que recebe as props: `toast`, `onClose`, e `onClick`.
Substitua o código inline no `App.tsx` pelo novo componente `<PushToast />`.

### TAREFA 3 — Extrair Lógica do CR (Coeficiente de Rendimento)
Arquivo: src/components/tabs/ProjTab.tsx
Há um calculador de Média/CR (Tab 2) cuja lógica e estados (`grades`, `crResult`) estão misturados no componente da aba inteira.
Crie um hook customizado ou mova a lógica do calculador de CR para um componente menor `src/components/tabs/CRCalculator.tsx` para deixar `ProjTab.tsx` mais limpo.

### ENTREGA — execute ao final
git add .
git commit -m "refactor(hooks): extracao de useNotifications, componente PushToast e CRCalculator"
git push origin refactor/hooks

Após o push, exiba:
- O diff completo de cada arquivo alterado
- Confirmação de que o App.tsx ficou significativamente menor.

NÃO altere lógica de negócio; o app deve continuar funcionando identicamente.

---

Agente 4 — Qualidade e Vitest
Branch: feat/quality
Você é um Engenheiro de Qualidade sênior especializado em React e Vitest.

Seu objetivo é elevar a qualidade do código do repositório configurando ambiente de testes, substituindo funções nativas síncronas e fortalecendo o ESLint.

### SETUP INICIAL — execute antes de qualquer coisa
npm install
git checkout -b feat/quality

### TAREFA 1 — Substituir alert() por toast
Identifique TODAS as ocorrências de `alert()` nos componentes (ex: `SistTab.tsx`, `ProjTab.tsx`, `App.tsx`).
Instale a biblioteca: `npm install react-hot-toast`
Substitua todos os `alert()` pelo `toast()` do react-hot-toast.
Adicione o `<Toaster />` no `src/main.tsx` ou `src/App.tsx`.

### TAREFA 2 — Configurar Vitest
Instale: `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom`
Adicione no package.json: `"test": "vitest run"`
Crie `vitest.config.ts` com environment `jsdom` e setupFiles apontando para `src/test/setup.ts` (que importa `@testing-library/jest-dom`).

### TAREFA 3 — Criar testes simples
Crie `src/components/ui/Button.test.tsx` testando se o botão renderiza corretamente o children passado.
Crie `src/components/ui/Input.test.tsx` testando se a label e o placeholder são exibidos.

### TAREFA 4 — Melhorar ESLint e TypeScript
Execute um check de TypeScript com `npm run lint` (que no momento executa `tsc --noEmit`).
Se houver falhas de tipagem reportadas no console, salve a saída num arquivo `LINT_REPORT.md` e corrija os problemas mais óbvios de tipagem "any" implícita, se existirem.

### ENTREGA — execute ao final
git add .
git commit -m "feat(quality): vitest setup, testes ui, replace alerts with toast, ts checks"
git push origin feat/quality

Após o push, exiba:
- Resultado do npm test (todos os testes devem passar)
- Lista de todos os alert() substituídos com arquivo e linha
- Conteúdo do LINT_REPORT.md (se criado)

---

Agente 5 — Revisor e Integrador
Branch de saída: integration/agents-1-4
Você é um Arquiteto de Software sênior atuando como Revisor e Integrador.

Seu objetivo NÃO é escrever código novo. Seu objetivo é revisar o trabalho dos 4 agentes, aprovar, resolver conflitos e fazer o merge para `integration/agents-1-4`.

### SETUP INICIAL — execute antes de qualquer coisa
git fetch --all
git checkout -b integration/agents-1-4

### FASE 1 — REVISÃO INDIVIDUAL DE CADA BRANCH

#### Branch fix/security
Verifique:
- [ ] Validações adicionadas em `Login.tsx` e `Register.tsx` (ex: checagem de senhas iguais, checagem de @ no email)?
- [ ] O arquivo `.env.example` foi criado?
- [ ] O bloqueio de clique múltiplo (`isLoading`) foi implementado nos botões de submit?

#### Branch feat/pwa
Verifique:
- [ ] O `vite-plugin-pwa` foi configurado no `vite.config.ts`?
- [ ] Regras de CSS mobile (tap-highlight, user-select) adicionadas no `index.css`?
- [ ] `InstallPrompt.tsx` criado e inserido corretamente no MobileLayout ou App.tsx?

#### Branch refactor/hooks
Verifique:
- [ ] A lógica das notificações foi movida para `useNotifications.ts`?
- [ ] O HTML inline do Push Notification foi extraído para `PushToast.tsx`?
- [ ] `App.tsx` agora importa esses hooks/componentes ao invés de usar tudo inline?
- [ ] O CRCalculator foi extraído corretamente no `ProjTab.tsx`?

#### Branch feat/quality
Verifique:
- [ ] Vitest e testing-library presentes no `package.json` e configurados no `vitest.config.ts`?
- [ ] Testes do botão e input criados em `src/components/ui/`?
- [ ] Todos os `alert()` nos arquivos `ProjTab.tsx` e `SistTab.tsx` (e outros) substituídos por `toast()`?
- [ ] O check do typescript (`tsc --noEmit`) passa com sucesso?

### FASE 2 — DECISÃO
Se QUALQUER item acima for NÃO: não faça merge e reporte.
Se TODOS os itens forem SIM: prossiga para Fase 3.

### FASE 3 — MERGE E VALIDAÇÃO
Execute os merges na ordem abaixo, resolvendo conflitos em favor da versão que mantém o App.tsx mais limpo (priorize o refactor/hooks caso haja conflito no App.tsx com os outros).

git merge origin/fix/security --no-ff -m "merge: fix/security"
git merge origin/feat/pwa --no-ff -m "merge: feat/pwa"
git merge origin/refactor/hooks --no-ff -m "merge: refactor/hooks"
git merge origin/feat/quality --no-ff -m "merge: feat/quality"

### FASE 4 — VALIDAÇÃO FINAL E BUILD
Após todos os merges:
`npm install && npm run build`
Se o build passar: faça o push. `git push origin integration/agents-1-4`.
Exiba um relatório final com o status de cada aprovação, conflitos e resultado do build.
