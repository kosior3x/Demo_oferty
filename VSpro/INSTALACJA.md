# Instrukcja Instalacji (Krok po Kroku)

## Android (Termux)

1. **Zaktualizuj Termux**
   ```bash
   pkg update && pkg upgrade
   ```

2. **Zainstaluj Pythona**
   ```bash
   pkg install python git clang libffi
   ```

3. **Pobierz VSpro**
   (Jeśli masz pliki w folderze Downloads)
   ```bash
   mkdir -p VSpro
   cp ~/storage/downloads/VSpro_Agent* VSpro/
   cd VSpro
   ```

4. **Uruchom Setup**
   ```bash
   chmod +x setup_android.sh
   ./setup_android.sh
   ```

5. **Skonfiguruj Klucz API**
   ```bash
   python fix_api_key.py
   ```

## Windows / Linux

1. Zainstaluj Python 3.10+ ze strony python.org.
2. Otwórz terminal/cmd w folderze z plikami.
3. Zainstaluj biblioteki:
   ```bash
   pip install google-generativeai
   ```
4. Utwórz plik `.env` z treścią `GOOGLE_API_KEY=twoj_klucz` lub użyj `python fix_api_key.py`.
5. Uruchom: `python VSpro_Agent_v4.0_COMPLETE.py`.
