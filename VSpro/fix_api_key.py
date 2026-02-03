#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
FIX API KEY PROBLEM
Interaktywny helper do naprawy błędu "API key not valid"
"""

import os
import sys
from pathlib import Path

def main():
    print("=" * 70)
    print("🔧 VSpro Agent - Naprawa Klucza API")
    print("=" * 70)

    # Wykryj ścieżkę bazową
    if os.path.exists("/storage/emulated/0"):
        base_path = Path("/storage/emulated/0/VSpro")
        system = "Android (Termux)"
    else:
        # Default to current directory if not on Android or if explicitly running from elsewhere
        base_path = Path(os.getcwd())
        if base_path.name != "VSpro":
             # Try to find VSpro if we are one level up
             if (base_path / "VSpro").exists():
                 base_path = base_path / "VSpro"
        system = "Windows/Linux"

    print(f"\n🖥️  System: {system}")
    print(f"📁 Ścieżka: {base_path}")

    base_path.mkdir(parents=True, exist_ok=True)

    print("\n" + "─" * 70)
    print("KROK 1: Pobierz klucz API")
    print("─" * 70)
    print("\n1. Otwórz w przeglądarce: https://makersuite.google.com/app/apikey")
    print("2. Zaloguj się kontem Google")
    print("3. Kliknij 'Create API Key'")
    print("4. SKOPIUJ CAŁY KLUCZ (zaczyna się od AIzaSy...)")

    print("\n" + "─" * 70)
    print("KROK 2: Wklej klucz")
    print("─" * 70)

    api_key = input("\n🔑 Wklej klucz API tutaj: ").strip()

    if not api_key:
        print("\n❌ Błąd: Nie podano klucza!")
        return 1

    if not api_key.startswith("AIzaSy"):
        print(f"\n⚠️ UWAGA: Klucz powinien zaczynać się od 'AIzaSy', a twój zaczyna się od '{api_key[:7]}'")
        confirm = input("Czy na pewno to prawidłowy klucz? (y/n): ")
        if confirm.lower() != 'y':
            print("❌ Anulowano")
            return 1

    if len(api_key) < 30:
        print(f"\n⚠️ UWAGA: Klucz jest bardzo krótki ({len(api_key)} znaków). Normalnie powinien mieć ~39 znaków.")
        confirm = input("Czy na pewno skopiowałeś CAŁY klucz? (y/n): ")
        if confirm.lower() != 'y':
            print("❌ Anulowano")
            return 1

    print("\n" + "─" * 70)
    print("KROK 3: Zapisz klucz")
    print("─" * 70)

    # Utwórz plik .env
    env_file = base_path / ".env"
    try:
        with open(env_file, "w") as f:
            f.write(f"GOOGLE_API_KEY={api_key}\n")

        print(f"\n✅ Zapisano do: {env_file}")
    except Exception as e:
        print(f"\n❌ Błąd zapisu .env: {e}")

        # Spróbuj api_key.txt jako fallback
        try:
            key_file = base_path / "api_key.txt"
            with open(key_file, "w") as f:
                f.write(api_key)
            print(f"✅ Zapisano do: {key_file} (fallback)")
        except Exception as e2:
            print(f"❌ Błąd zapisu api_key.txt: {e2}")
            return 1

    print("\n" + "─" * 70)
    print("KROK 4: Test połączenia")
    print("─" * 70)

    print("\n🧪 Testuję połączenie z Gemini API...")

    try:
        import google.generativeai as genai

        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')

        # Prosty test
        response = model.generate_content("Odpowiedz tylko: OK")

        if response and response.text:
            print(f"\n✅ SUKCES! API działa poprawnie.")
            print(f"📝 Odpowiedź Gemini: {response.text.strip()}")
        else:
            print("\n⚠️ API odpowiedziało, ale bez treści")

    except ImportError:
        print("\n⚠️ Biblioteka google-generativeai nie zainstalowana")
        print("\nZainstaluj:")

        if system.startswith("Android"):
            print("  pip install google-generativeai --break-system-packages")
        else:
            print("  pip install google-generativeai")

        print("\nPo instalacji uruchom ponownie ten skrypt.")

    except Exception as e:
        error_msg = str(e)

        if "API key not valid" in error_msg or "API_KEY_INVALID" in error_msg:
            print("\n❌ BŁĄD: Klucz API nadal nieprawidłowy!")
            print("\n🔍 Możliwe przyczyny:")
            print("  1. Klucz został źle skopiowany (brakuje fragmentu)")
            print("  2. Klucz wygasł lub został usunięty w Google Cloud")
            print("  3. API Gemini nie jest włączone dla tego klucza")
            print("\n💡 Rozwiązanie:")
            print("  - Stwórz NOWY klucz na: https://makersuite.google.com/app/apikey")
            print("  - Upewnij się że kopiujesz CAŁY klucz (zaznacz wszystko!)")
            return 1

        elif "RESOURCE_EXHAUSTED" in error_msg:
            print("\n⚠️ Limit zapytań wyczerpany (quota)")
            print("Klucz API jest PRAWIDŁOWY, ale osiągnąłeś dzienny limit.")
            print("Poczekaj do jutra lub użyj innego klucza.")

        else:
            print(f"\n❌ Błąd API: {e}")
            return 1

    print("\n" + "=" * 70)
    print("🎉 GOTOWE!")
    print("=" * 70)
    print("\nTeraz możesz uruchomić agenta:")
    print(f"  cd {base_path}")
    print("  python agent.py")
    print("\n👋 Powodzenia!")

    return 0


if __name__ == "__main__":
    sys.exit(main())
