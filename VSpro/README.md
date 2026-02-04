# VSpro Agent v4.0 (Builder Edition)

Kompletny system agenta kodującego w 4 plikach.

## 📂 Zawartość
1. **VSpro_Agent_v4.0_COMPLETE.py** - Główny program (Agent).
2. **fix_api_key.py** - Narzędzie do naprawy klucza API.
3. **setup_android.sh** - Instalator (Android/Termux).
4. **README.md** - Ta instrukcja.

## 🚀 Szybki Start

### Krok 1: Instalacja
W terminalu (Termux):
```bash
chmod +x setup_android.sh
./setup_android.sh
```

### Krok 2: Klucz API
Jeśli nie masz klucza w `.env`, uruchom:
```bash
python fix_api_key.py
```
*(Pobierz klucz z: https://makersuite.google.com/app/apikey)*

### Krok 3: Uruchomienie
```bash
python VSpro_Agent_v4.0_COMPLETE.py
```

## 💡 Jak używać?

**Tryby pracy:**
- `/mode accurate` (Domyślny) - Dokładny, z testami.
- `/mode fast` - Szybki, bez testów.
- `/mode creative` - Kreatywny.

**Przykłady komend:**
- "Stwórz grę Snake w Pythonie."
- "Przeanalizuj plik data.csv i zrób wykres."
- "/project fastapi" (Tworzy strukturę projektu).

## 🔧 Rozwiązywanie problemów
- **Błąd API**: Uruchom `python fix_api_key.py`.
- **Brak bibliotek**: Uruchom `./setup_android.sh`.
