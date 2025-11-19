#!/bin/bash

# Colori per output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Inizio deploy automatico...${NC}"

# Vai nella cartella dello script
cd "$(dirname "$0")"

# Aggiungi tutti i file modificati
git add .
echo -e "${GREEN}✅ File aggiunti${NC}"

# Chiedi messaggio commit
read -p "📝 Messaggio commit (premi INVIO per 'update'): " msg
msg=${msg:-update}

# Commit
git commit -m "$msg"
echo -e "${GREEN}✅ Commit fatto${NC}"

# Push
git push
echo -e "${GREEN}✅ Push completato!${NC}"

echo -e "${BLUE}🎉 Deploy completato! Attendi 10 secondi.${NC}"

# Pausa per leggere
read -p "Premi INVIO per chiudere..."