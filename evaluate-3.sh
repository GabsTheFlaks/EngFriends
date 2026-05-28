#!/bin/bash
cd EngFriends

echo "Agente 2 details:"
echo "Tela /login implementada com modo login e modo cadastro?"
git ls-tree -r origin/feat/quality-1373134414219062782 | grep Login.tsx
git show origin/feat/quality-1373134414219062782:src/components/auth/Login.tsx | grep -i mode || echo "no mode found"
echo "What is in Login.tsx?"
git show origin/feat/quality-1373134414219062782:src/components/auth/Login.tsx | head -n 15

echo ""
echo "Rotas protegidas redirecionam para /login quando session é null?"
git show origin/feat/quality-1373134414219062782:src/App.tsx | grep -i login
