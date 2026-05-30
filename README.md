<div align="center">
  <img src="logo.svg" alt="Eng Friends Logo" width="600" />


  **A plataforma definitiva de estudos, ferramentas, fóruns e networking para estudantes de engenharia.**
  
  *The ultimate platform for studies, tools, forums, and networking for engineering students.*

  <p align="center">
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
    <img src="https://img.shields.io/badge/Cloudflare-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" alt="Cloudflare" />
    <img src="https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white" alt="PWA Ready" />
    <img src="https://img.shields.io/badge/-TestingLibrary-%23E33332?style=for-the-badge&logo=testing-library&logoColor=white" alt="Testing Library" />
    <img src="https://img.shields.io/badge/-Vitest-272D31?style=for-the-badge&logo=vitest&logoColor=FCC72B" alt="Vitest" />
  </p>
  
  <p align="center">
    <a href="#-versão-em-português">🇧🇷 Português</a> •
    <a href="#-english-version">🇺🇸 English</a>
  </p>
</div>

---

## 🇧🇷 Versão em Português

## 📖 Sobre o Projeto

**Eng Friends** é um aplicativo Progressivo (PWA) moderno e completo focado em conectar estudantes de engenharia. Ele oferece um espaço seguro para discussões acadêmicas, troca de materiais, chats em tempo real e ferramentas essenciais para o dia a dia do estudante. O aplicativo conta com um design limpo, focado em alta legibilidade e acesso rápido a funcionalidades.

## ✨ Funcionalidades

- **🗂️ Gestão de Disciplinas:** Organização e fluxo de estudos.
- **💬 Fóruns de Discussão:** Pergunte e responda dúvidas sobre matérias específicas.
- **🗣️ Chat Acadêmico em Tempo Real:** Comunique-se rapidamente com seus grupos de estudo com suporte para upload de mídia via Supabase Storage e streaming em tempo real.
- **🔔 Central de Notificações:** Sistema de notificações inteligente suportando Web Push Notifications (gerenciado via Service Worker e Cloudflare Worker).
- **📱 PWA (Progressive Web App):** Instalável na maioria dos dispositivos através de navegadores (Chrome, Safari, Edge) com suporte a acesso off-line via Service Workers.
- **🔒 Autenticação e Dados:** Backend robusto integrado com Supabase (Auth, Database com RLS e Storage).
- **🌗 Tema Escuro/Claro:** Experiência consistente e confortável em qualquer luminosidade.

## 🚀 Tecnologias Integradas

- **Front-end:** [React](https://reactjs.org/) (Hooks, Functional Components)
- **Build Tool:** [Vite](https://vitejs.dev/) - Tempo de carregamento incrivelmente rápido e HMR.
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/) - Escalabilidade e segurança na escrita de tipos.
- **Estilização:** [Tailwind CSS v4](https://tailwindcss.com/) - Utility-first e Design responsivo.
- **Backend & Real-time:** [Supabase](https://supabase.com/) - Gerenciamento de banco de dados, RLS, Storage e WebSockets.
- **Notificações & Deploy:** [Cloudflare](https://cloudflare.com/) - Cloudflare Pages para hospedagem e Workers independentes para Push Notifications.
- **Animações:** `motion/react` para transições de rotas suaves.
- **Ícones:** [Lucide React](https://lucide.dev/) - Minimalismo visual e consistência.
- **Alertas:** `react-hot-toast` para notificações intuitivas.
- **Testes:** [Vitest](https://vitest.dev/) e React Testing Library.

## 🛠️ Como rodar o projeto localmente

Siga o passo a passo abaixo para rodar o Eng Friends na sua máquina:

### 1. Clonar o repositório
```bash
git clone https://github.com/GabsTheFlaks/EngFriends.git
cd EngFriends
```

### 2. Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto copiando o `.env.example` e preencha com suas credenciais do Supabase:
```bash
cp .env.example .env
```

### 3. Instalar as dependências
```bash
npm install
```

### 4. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```

### 5. Executar os Testes (Opcional)
```bash
npm run test
```

### 6. Build de Produção
Para compilar a aplicação focada em performance (Gera PWA para deploy):
```bash
npm run build
```

---

## 🇺🇸 English Version

## 📖 About the Project

**Eng Friends** is a modern and comprehensive Progressive Web App (PWA) focused on connecting engineering students. It provides a safe space for academic discussions, material exchange, real-time chats, and essential tools for a student's daily life. The application features a clean design, focused on high readability and quick access to functionalities.

## ✨ Features

- **🗂️ Subject Management:** Organization and study workflow.
- **💬 Discussion Forums:** Ask and answer questions about specific subjects.
- **🗣️ Real-Time Academic Chat:** Communicate quickly with your study groups, supporting media uploads via Supabase Storage and real-time streaming.
- **🔔 Notification Center:** Smart notification system supporting Web Push Notifications (managed via Service Worker and an independent Cloudflare Worker).
- **📱 PWA (Progressive Web App):** Installable on most devices via browsers (Chrome, Safari, Edge) with offline access support through Service Workers.
- **🔒 Authentication & Data:** Robust backend integrated with Supabase (Auth, Database with strict RLS, and Storage).
- **🌗 Dark/Light Theme:** Consistent and comfortable experience in any lighting.

## 🚀 Integrated Technologies

- **Front-end:** [React](https://reactjs.org/) (Hooks, Functional Components)
- **Build Tool:** [Vite](https://vitejs.dev/) - Blazing fast load times and HMR.
- **Language:** [TypeScript](https://www.typescriptlang.org/) - Scalability and type safety.
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) - Utility-first and responsive design.
- **Backend & Real-time:** [Supabase](https://supabase.com/) - Database management, RLS, Storage, and WebSockets.
- **Notifications & Deploy:** [Cloudflare](https://cloudflare.com/) - Cloudflare Pages for hosting and independent Workers for Push Notifications.
- **Animations:** `motion/react` for smooth route transitions.
- **Icons:** [Lucide React](https://lucide.dev/) - Visual minimalism and consistency.
- **Alerts:** `react-hot-toast` for intuitive UI notifications.
- **Testing:** [Vitest](https://vitest.dev/) and React Testing Library.

## 🛠️ How to run the project locally

Follow the steps below to run Eng Friends on your machine:

### 1. Clone the repository
```bash
git clone https://github.com/GabsTheFlaks/EngFriends.git
cd EngFriends
```

### 2. Configure Environment Variables
Create a `.env` file in the root of the project by copying `.env.example` and fill it with your Supabase credentials:
```bash
cp .env.example .env
```

### 3. Install dependencies
```bash
npm install
```

### 4. Start the Development Server
```bash
npm run dev
```

### 5. Run Tests (Optional)
```bash
npm run test
```

### 6. Production Build
To compile the application focused on performance (Generates PWA for deployment):
```bash
npm run build
```

---

<div align="center">
  <p>Feito com ❤️ para facilitar a vida de estudantes de engenharia de Produção.</p>
  <p>Made with ❤️ to make industrial engineering students' lives easier.</p>
</div>
