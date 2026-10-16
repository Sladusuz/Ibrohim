#!/usr/bin/env bash
# Loyihani GitHub'dagi eng so'nggi versiyaga yangilash (ma'lumotlar saqlanib qoladi)
set -euo pipefail
git -C /opt/impro pull --ff-only
systemctl restart impro
echo "Yangilandi."
