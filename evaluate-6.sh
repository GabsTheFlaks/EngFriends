#!/bin/bash
cd EngFriends

# Agente 4 check
echo "Agente 4 ChatBubble:"
git show origin/feat/pwa-8466427432651526348:src/components/ChatBubble.tsx || echo "No ChatBubble.tsx in Agent 4"

echo "Agente 6 check:"
git show origin/feature/cloudflare-pages-push-sw-15932856553572703910:src/main.tsx | grep -i register || echo "no registerPush in main.tsx"
