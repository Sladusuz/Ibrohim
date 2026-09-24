#!/usr/bin/env bash
# BISRARO saytini GitHub'ga yuklash (macOS / Linux / Git Bash)
set -e
cd "$(dirname "$0")"
REPO=https://github.com/Sladusuz/bisraro.git

[ -d .git ] || git init
git checkout -B main
git add -A
git commit -m "BISRARO sayti" || true
git remote remove origin 2>/dev/null || true
git remote add origin "$REPO"
git push -u origin main

echo "Tayyor! Repozitoriy: https://github.com/Sladusuz/bisraro"
echo "Sayt (Pages yoqilgandan keyin): https://sladusuz.github.io/bisraro/"
