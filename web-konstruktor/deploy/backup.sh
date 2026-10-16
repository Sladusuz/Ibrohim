#!/usr/bin/env bash
# Ma'lumotlar papkasining zaxira nusxasi (oxirgi 14 kun saqlanadi)
set -euo pipefail
mkdir -p /var/backups/impro
tar czf "/var/backups/impro/impro-$(date +%F).tar.gz" -C /var/lib/impro .
find /var/backups/impro -name 'impro-*.tar.gz' -mtime +14 -delete
