#!/bin/bash
cd EngFriends

# Agente 3
echo "Agente 3:"
echo "useChat.ts criado com messages, loading, typingUsers, sendMessage e sendTyping?"
git show origin/jules-17916039790868215668-b538d661:src/hooks/useChat.ts | grep -E "(messages|loading|typingUsers|sendMessage|sendTyping)"
echo "useChat carrega as últimas 50 mensagens do banco ao montar?"
git show origin/jules-17916039790868215668-b538d661:src/hooks/useChat.ts | grep -E "(limit)"
echo "useChat escuta novos INSERTs via postgres_changes em tempo real?"
git show origin/jules-17916039790868215668-b538d661:src/hooks/useChat.ts | grep "postgres_changes"
echo "Indicador de digitação usa broadcast efêmero (não persiste no banco)?"
git show origin/jules-17916039790868215668-b538d661:src/hooks/useChat.ts | grep "broadcast"
echo "ChatBubble.tsx criado diferenciando mensagens próprias e de outros?"
git show origin/jules-17916039790868215668-b538d661:src/components/ChatBubble.tsx | grep "isOwn" || echo "no isOwn"
echo "ChatTab.tsx não contém nenhuma referência a localStorage?"
git show origin/jules-17916039790868215668-b538d661:src/components/tabs/ChatTab.tsx | grep localStorage || echo "no localStorage"
echo "Auto-scroll para última mensagem implementado?"
git show origin/jules-17916039790868215668-b538d661:src/components/tabs/ChatTab.tsx | grep -i scroll || echo "no auto-scroll"
echo "Lista de canais carregada da tabela rooms (não hardcoded)?"
git show origin/jules-17916039790868215668-b538d661:src/components/tabs/ChatTab.tsx | grep "from('rooms')" || echo "no rooms loaded from db"
echo "Algum arquivo fora do escopo foi alterado?"
git diff --name-only main..origin/jules-17916039790868215668-b538d661 | grep -v -E "(src/hooks/useChat.ts|src/components/ChatBubble.tsx|src/components/tabs/ChatTab.tsx|package.json|package-lock.json)"
