#!/bin/bash
echo "🚀 Rozpoczynam instalację VSpro Agent v4.0..."

# Update package lists
echo "📦 Aktualizacja pakietów..."
pkg update -y && pkg upgrade -y

# Install Python and dependencies
echo "🐍 Instalacja Pythona..."
pkg install python -y
pkg install clang -y
pkg install libffi -y

# Install pip packages
echo "📦 Instalacja bibliotek Python..."
pip install --upgrade pip
pip install google-generativeai --break-system-packages

# Create directories
echo "📂 Tworzenie struktury folderów..."
mkdir -p workspace
mkdir -p logs

# Set permissions
chmod +x fix_api_key.py
chmod +x VSpro_Agent_v4.0_COMPLETE.py

echo "✅ Instalacja zakończona!"
echo "➡️  Uruchom teraz: python fix_api_key.py"
