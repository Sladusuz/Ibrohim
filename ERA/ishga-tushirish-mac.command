#!/bin/bash
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js o'rnatilmagan. nodejs.org dan LTS versiyasini o'rnating, so'ng qayta oching."
  open https://nodejs.org
  read -n 1
  exit 1
fi
echo "ERA sayti ishga tushmoqda... Bu oynani YOPMANG."
(sleep 2; open http://localhost:3000/admin; open http://localhost:3000) &
node server.js
