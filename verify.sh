#!/bin/bash
cd EngFriends

echo "=== Agente 1: origin/agente-1-supabase-13490662522530032862 ==="
git diff main..origin/agente-1-supabase-13490662522530032862 --name-status

echo ""
echo "=== Agente 2: origin/feat/quality-1373134414219062782 ==="
git diff main..origin/feat/quality-1373134414219062782 --name-status

echo ""
echo "=== Agente 3: origin/jules-17916039790868215668-b538d661 ==="
git diff main..origin/jules-17916039790868215668-b538d661 --name-status

echo ""
echo "=== Agente 4: origin/feat/pwa-8466427432651526348 ==="
git diff main..origin/feat/pwa-8466427432651526348 --name-status

echo ""
echo "=== Agente 5: origin/feature/in-app-notifications-11687689691711277502 ==="
git diff main..origin/feature/in-app-notifications-11687689691711277502 --name-status

echo ""
echo "=== Agente 6: origin/feature/cloudflare-pages-push-sw-15932856553572703910 ==="
git diff main..origin/feature/cloudflare-pages-push-sw-15932856553572703910 --name-status
