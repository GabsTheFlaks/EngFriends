#!/bin/bash
cd EngFriends

# Agente 1: Check files out of scope
echo "Agente 1 out of scope:"
git diff --name-only main..origin/agente-1-supabase-13490662522530032862 | grep -v -E "(src/lib/supabaseClient.ts|src/lib/database.types.ts|.env.example|.gitignore|supabase/schema.sql|src/vite-env.d.ts|package.json|package-lock.json)"

# Agente 2: Check files out of scope
echo "Agente 2 out of scope:"
git diff --name-only main..origin/feat/quality-1373134414219062782 | grep -v -E "(src/hooks/useAuth.ts|src/pages/Login.tsx|src/pages/Profile.tsx|src/components/AvatarPicker.tsx|public/avatars/.*|src/components/auth/Login.tsx|src/components/auth/Register.tsx)"

# Agente 3: Check out of scope
echo "Agente 3 out of scope:"
git diff --name-only main..origin/jules-17916039790868215668-b538d661 | grep -v -E "(src/hooks/useChat.ts|src/components/ChatBubble.tsx|src/components/tabs/ChatTab.tsx)"

# Agente 4: Check out of scope
echo "Agente 4 out of scope:"
git diff --name-only main..origin/feat/pwa-8466427432651526348 | grep -v -E "(src/lib/uploadChatMedia.ts|src/components/ChatBubble.tsx|src/components/tabs/ChatTab.tsx)"

# Agente 5: Check out of scope
echo "Agente 5 out of scope:"
git diff --name-only main..origin/feature/in-app-notifications-11687689691711277502 | grep -v -E "(src/hooks/useNotifications.ts|src/components/NotificationBell.tsx|src/context/NotificationsContext.tsx)"

# Agente 6: Check out of scope
echo "Agente 6 out of scope:"
git diff --name-only main..origin/feature/cloudflare-pages-push-sw-15932856553572703910 | grep -v -E "(public/_redirects|public/_headers|public/manifest.json|src/main.tsx|public/sw.js|src/lib/push.ts)"
