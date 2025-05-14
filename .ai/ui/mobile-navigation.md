# Specyfikacja biznesowa: Responsywny układ propozycji spotkań

## Kontekst biznesowy

Aplikacja "AI Planner" wykorzystująca stos technologiczny:
- Astro 5 dla efektywnego generowania stron 
- React 19 dla interaktywnych komponentów
- TypeScript 5 dla typowania
- Tailwind 4 do stylowania
- Shadcn/ui jako biblioteka komponentów UI

Funkcjonalność generowania propozycji spotkań jest kluczowym elementem aplikacji, ale obecnie jej układ nie jest zoptymalizowany dla urządzeń mobilnych, co powoduje obniżenie zadowolenia użytkowników korzystających z mniejszych ekranów.

## Cel specyfikacji

Zdefiniowanie zmian w układzie propozycji spotkań w komponencie `ProposalsPage`, które zapewnią optymalną prezentację treści na urządzeniach mobilnych, bez wpływu na wygląd i funkcjonalność na większych ekranach (desktop).

## Wymagania biznesowe

1. **Responsywny układ wyświetlania propozycji spotkań**
   - Na urządzeniach mobilnych propozycje powinny być wyświetlane jedna pod drugą (w pionie)
   - Na tabletach i komputerach zachować obecny układ poziomy z przewijaniem
   - Punkt przełączenia między widokami: standardowy breakpoint dla małych ekranów (sm) w Tailwind

2. **Dostosowanie karty propozycji**
   - Karta propozycji (`ProposalCard`) powinna wykorzystywać pełną dostępną szerokość na małych ekranach
   - Zachować obecną szerokość stałą na większych ekranach
   - Zachować wszystkie obecne funkcjonalności karty propozycji

3. **Zachowanie interaktywności**
   - Wszystkie funkcje interaktywne (wybór propozycji, akceptacja) muszą działać identycznie na wszystkich rozmiarach ekranu
   - Przyciski muszą być odpowiednio wymiarowane dla wygodnej obsługi dotykowej

## Komponent docelowy

Zmiany dotyczą następujących komponentów:
- **ProposalsPage.tsx**: Główny kontener widoku propozycji, wymaga modyfikacji kontenera listującego propozycje
- **ProposalCard.tsx**: Komponent karty propozycji, wymaga dostosowania szerokości

## Wzorce użycia

### Urządzenia mobilne (< 640px)
- Propozycje wyświetlane pionowo, jedna pod drugą
- Karty zajmują pełną dostępną szerokość
- Przewijanie pionowe listy propozycji

### Urządzenia desktop (≥ 640px)
- Zachowany obecny układ poziomy z przewijaniem
- Karty propozycji o stałej szerokości
- Przewijanie poziome listy propozycji

## Metryki sukcesu

1. Eliminacja poziomego przewijania na urządzeniach mobilnych
2. Zwiększenie czytelności propozycji na małych ekranach
3. Zachowanie wszystkich funkcjonalności i wizualnej spójności z resztą aplikacji

## Wyłączenia

Specyfikacja nie obejmuje zmian:
- W zawartości kart propozycji
- W logice aplikacji
- W formularzach i interakcjach
- W dialogu konfliktów

## Zależności

Implementacja powinna wykorzystywać:
- Responsywne warianty klas Tailwind
- Natywne mechanizmy responsywności Astro/React
- Komponenty Shadcn/ui zgodnie z ich dokumentacją 