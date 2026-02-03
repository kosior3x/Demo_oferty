import os
import sys
import google.generativeai as genai

def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')

def validate_key(api_key):
    """Try to use the key with a simple request."""
    print("\n🔍 Weryfikacja klucza...")
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content("Hello")
        if response and response.text:
            return True, "Klucz jest poprawny!"
    except Exception as e:
        return False, f"Błąd: {str(e)}"
    return False, "Nieoczekiwany błąd weryfikacji."

def save_key(api_key):
    """Save key to .env file."""
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')

    # Read existing lines to preserve other vars if any
    lines = []
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            lines = f.readlines()

    # Filter out old key
    lines = [l for l in lines if not l.startswith('GOOGLE_API_KEY=')]

    # Add new key
    lines.append(f"GOOGLE_API_KEY={api_key}\n")

    with open(env_path, 'w') as f:
        f.writelines(lines)

    print(f"✅ Zapisano klucz w: {env_path}")

def main():
    clear_screen()
    print("========================================")
    print("🔧 VSpro API Key Fixer")
    print("========================================")
    print("Ten skrypt pomoże Ci naprawić problem z kluczem API Gemini.")
    print("\n1. Pobierz klucz z: https://makersuite.google.com/app/apikey")
    print("2. Skopiuj CAŁY ciąg znaków (ok. 39 znaków)")
    print("3. Wklej go poniżej (użyj 'Paste' w Termux)")
    print("----------------------------------------")

    while True:
        try:
            api_key = input("\n🔑 Wklej klucz API tutaj: ").strip()

            if not api_key:
                print("⚠️ Klucz nie może być pusty.")
                continue

            if len(api_key) < 30:
                print("⚠️ Klucz wydaje się za krótki. Sprawdź czy skopiowałeś całość.")
                confirm = input("Czy na pewno chcesz użyć tego klucza? (t/n): ")
                if confirm.lower() != 't':
                    continue

            valid, message = validate_key(api_key)

            if valid:
                print(f"✅ {message}")
                save_key(api_key)
                print("\n🎉 Sukces! Teraz możesz uruchomić agenta.")
                print("Uruchom: python VSpro_Agent_v4.0_COMPLETE.py")
                break
            else:
                print(f"❌ {message}")
                print("Spróbuj ponownie.")

        except KeyboardInterrupt:
            print("\n\nAnulowano.")
            sys.exit(0)

if __name__ == "__main__":
    main()
