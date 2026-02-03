# VSpro Coding Agent v4.0 - Builder Edition

Kompletny, autonomiczny system do generowania kodu, naprawiania błędów i tworzenia projektów, działający na Twoim urządzeniu (Android/Windows/Linux).

## 🌟 Główne Funkcje

### 1. Auto-Naprawa (Auto-Fix)
Agent nie tylko pisze kod, ale go **uruchamia**. Jeśli napotka błąd, automatycznie analizuje go i poprawia kod (do 3 prób w trybie `accurate`).

### 2. Pięć Trybów Pracy
Przełączaj się komendą `/mode [nazwa]`:
- **accurate** (Domyślny): Powolny, dokładny, testuje kod.
- **fast**: Szybkie odpowiedzi, bez testów.
- **creative**: Nowatorskie rozwiązania, burza mózgów.
- **debug**: Szczegółowa analiza błędów, dużo logów.
- **teaching**: Tłumaczy kod jak nauczyciel.

### 3. Zarządzanie Projektami
Zamiast pojedynczych plików, agent potrafi tworzyć struktury projektów.
Po prostu napisz: `Stwórz projekt Django dla sklepu internetowego`.

### 4. Code Review
Poproś agenta o ocenę kodu: `Sprawdź ten plik pod kątem bezpieczeństwa`. Otrzymasz ocenę w skali 0-100 i listę sugestii.

## 📂 Struktura Plików

- `VSpro_Agent_v4.0_COMPLETE.py` - Główny silnik agenta.
- `fix_api_key.py` - Narzędzie naprawcze do klucza API.
- `workspace/` - Tutaj agent zapisuje wygenerowane pliki.
- `logs/` - Logi działania.

## 🔧 Rozwiązywanie Problemów

**Błąd: API Key not valid**
Twój klucz w `.env` jest prawdopodobnie ucięty lub nieprawidłowy.
Rozwiązanie: Uruchom `python fix_api_key.py` i wklej nowy klucz.

**Błąd: google.generativeai not found**
Rozwiązanie: `pip install google-generativeai --break-system-packages`

## 📜 Licencja
MIT License. Korzystaj do woli!
