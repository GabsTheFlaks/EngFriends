# Architecture / Arquitetura

<p align="center">
  <a href="#-versão-em-português">🇧🇷 Português</a> •
  <a href="#-english-version">🇺🇸 English</a>
</p>

---

## 🇧🇷 Versão em Português

Este documento descreve as diretrizes de arquitetura do projeto Eng Friends.

### Visão Geral

O projeto é um aplicativo frontend moderno em React, construído com Vite e escrito estritamente em TypeScript. O backend é gerenciado inteiramente pelo Supabase, fornecendo autenticação, banco de dados relacional (PostgreSQL), storage e recursos em tempo real via WebSockets.

A aplicação está configurada como um Progressive Web App (PWA) utilizando arquivos de Service Worker manuais (`public/sw.js`) e manifesto (`public/manifest.json`), não dependendo de plugins geradores (como `vite-plugin-pwa`). O deploy é focado na plataforma Cloudflare Pages.

### Stack Tecnológica

1.  **Frontend & Build:**
    *   **React (v19):** Biblioteca base para UI.
    *   **Vite:** Bundler de alta performance.
    *   **TypeScript:** Fortemente tipado (uso do `any` implícito é proibido).
    *   **Tailwind CSS (v4):** Sistema de estilização base.
    *   **Lucide React:** Biblioteca padrão de ícones.
    *   **Motion/React:** Para animações e transições na UI.
    *   **React Router Dom:** Roteamento client-side.

2.  **Backend (Supabase):**
    *   **Auth:** Gerenciamento de autenticação e sessão.
    *   **Database (PostgreSQL):** Funciona como fonte de verdade. Variáveis de mock locais (ex: arrays mockados para chats) são estritamente proibidas quando a integração com Supabase estiver ativa.
    *   **Real-time:** Atualizações ao vivo (mensagens de chat, tipagem). Utiliza os canais de broadcast efêmeros do Supabase e subscrições via `postgres_changes`.
    *   **Storage:** Para upload de mídias no chat (limite de 5MB, com validação de tipo MIME).
    *   **RLS (Row Level Security):** Políticas estritas no banco. A exclusão de mensagens requer `auth.uid() = sender_id` e a gestão de salas de chat requer validação de `created_by`.

3.  **PWA e Push Notifications:**
    *   **Service Worker:** Arquivo manual em `public/sw.js`.
    *   **Push Notifications:** A inscrição é registrada no login e salva na tabela `push_subscriptions` do Supabase. A lógica de notificação Push no servidor é tratada de forma separada por um projeto de Cloudflare Worker independente.
    *   **Deploy Cloudflare Pages:** Requer os arquivos `public/_redirects` e `public/_headers` para garantir o funcionamento correto das rotas SPA e do escopo do Service Worker.

4.  **Testes e Qualidade:**
    *   **Testes:** Configuração com Vitest e React Testing Library (`npm run test`).
    *   **Linting:** ESLint e TypeScript Compiler (`npm run lint`).

### Padrões de Projeto & Diretrizes

*   **Comunicação em Tempo Real:** Subscrições de notificações do Supabase devem ser gerenciadas via hook customizado (`useNotifications`), sem o uso de um React Context global, conforme definição.
*   **Gestão de Ambientes:** Variáveis de ambiente seguem o padrão do Vite (`VITE_`). O arquivo `src/lib/supabaseClient.ts` implementa a técnica de *fail-fast*, disparando um erro explícito caso `VITE_SUPABASE_URL` ou `VITE_SUPABASE_ANON_KEY` não estejam definidos.
*   **Gerenciamento de Avatar:** Arquivos SVG estão no diretório `public/avatars/`. O perfil do usuário armazena um índice numérico (`avatar_index`) apontando para esses arquivos estáticos.
*   **UI/UX:** Novas interfaces devem adaptar-se e manter os componentes visuais existentes utilizando Tailwind CSS em vez de construir a partir do zero. Notificações devem ser tratadas nativamente via `react-hot-toast` em vez de `alert()`.
*   **Resolução de Conflitos (Merge):**
    *   Para Lógica/Segurança: Priorizar sempre a versão mais restritiva/segura.
    *   Para UI: Priorizar o branch com design mais recente.

---

## 🇺🇸 English Version

This document outlines the architectural guidelines for the Eng Friends project.

### Overview

The project is a modern frontend React application built with Vite and strictly authored in TypeScript. The backend is fully powered by Supabase, providing authentication, relational database (PostgreSQL), object storage, and real-time capabilities via WebSockets.

The application is configured as a Progressive Web App (PWA) using manual service worker (`public/sw.js`) and manifest (`public/manifest.json`) files rather than relying on generator plugins (like `vite-plugin-pwa`). Deployment is targeted for Cloudflare Pages.

### Technology Stack

1.  **Frontend & Build:**
    *   **React (v19):** Core UI library.
    *   **Vite:** High-performance bundler.
    *   **TypeScript:** Strongly typed (implicit `any` is strictly prohibited).
    *   **Tailwind CSS (v4):** Primary styling framework.
    *   **Lucide React:** Standard icon library.
    *   **Motion/React:** Used for UI animations and transitions.
    *   **React Router Dom:** Client-side routing.

2.  **Backend (Supabase):**
    *   **Auth:** Session and authentication management.
    *   **Database (PostgreSQL):** Serves as the ultimate source of truth. Local mock variables (e.g., mocked arrays for chats) are strictly forbidden once Supabase integration is active.
    *   **Real-time:** Live updates (chat messages, typing indicators). Utilizes Supabase ephemeral broadcast channels and `postgres_changes` subscriptions.
    *   **Storage:** For chat media uploads (enforcing a 5MB limit and MIME type validation).
    *   **RLS (Row Level Security):** Strict database policies. Message deletion requires `auth.uid() = sender_id` and room management requires `created_by` validation.

3.  **PWA and Push Notifications:**
    *   **Service Worker:** Maintained manually in `public/sw.js`.
    *   **Push Notifications:** Subscription is registered upon login and saved in the Supabase `push_subscriptions` table. The server-side Push Notification logic is handled separately by an independent Cloudflare Worker project.
    *   **Cloudflare Pages Deploy:** Requires `public/_redirects` and `public/_headers` to ensure correct SPA routing and Service Worker scope functioning.

4.  **Testing and Quality:**
    *   **Testing:** Set up with Vitest and React Testing Library (`npm run test`).
    *   **Linting:** ESLint and TypeScript Compiler (`npm run lint`).

### Design Patterns & Guidelines

*   **Real-time Communication:** Supabase notification subscriptions must be managed via a custom hook (`useNotifications`), without using a global React Context, as defined.
*   **Environment Management:** Environment variables follow the Vite standard (`VITE_`). The `src/lib/supabaseClient.ts` implements a *fail-fast* approach, throwing an explicit Error if `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` are not defined.
*   **Avatar Management:** SVG files are stored in the `public/avatars/` directory. The user profile stores a numeric index (`avatar_index`) pointing to these static files.
*   **UI/UX:** New interfaces should adapt and maintain existing visual components using Tailwind CSS rather than building from scratch. User alerts must be handled via `react-hot-toast` instead of native `alert()`.
*   **Merge Conflict Resolution:**
    *   For Logic/Security: Always prioritize the most restrictive/secure version.
    *   For UI: Prioritize the most recent branch.
