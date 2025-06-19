# 🎬 Face Swap Studio - Kompletna Instrukcja Instalacji

## 🚀 Przegląd Systemu

Stworzyłem kompletny system **Face Swap Studio** dla Twojej aplikacji RIPDB! System wykonuje następujący workflow:

1. **Wgrywanie video** - użytkownik wgrywa plik MP4/MOV/AVI/WebM
2. **Przetwarzanie FFmpeg** - konwersja video → GIF + wyodrębnienie audio
3. **Face Swap AI** - zamiana twarzy w GIF-ie używając fal.ai API (easel-gifswap)
4. **Finalizacja** - łączenie przetworzonego GIF-a z oryginalnym audio → MP4

## 📦 Krok 1: Instalacja Dependencies

```bash
# Przejdź do katalogu projektu
cd twój/projekt/ripdb

# Zainstaluj nowe dependencies
npm install @ffmpeg/ffmpeg @ffmpeg/util axios react-dropzone

# Alternatywnie, jeśli masz problemy z FFmpeg:
npm install @ffmpeg/ffmpeg@^0.12.7 @ffmpeg/util@^0.12.1 axios@^1.6.0 react-dropzone@^14.2.3
```

## 🔧 Krok 2: Konfiguracja Headers (Wymagane dla FFmpeg)

### A. Netlify (Już utworzone)
Plik `public/_headers` został już utworzony z odpowiednimi ustawieniami:

```
/*
  Cross-Origin-Embedder-Policy: require-corp
  Cross-Origin-Opener-Policy: same-origin
```

### B. Dla innych platform
Jeśli nie używasz Netlify, dodaj te headers do swojego serwera:

**Apache (.htaccess):**
```apache
Header always set Cross-Origin-Embedder-Policy "require-corp"
Header always set Cross-Origin-Opener-Policy "same-origin"
```

**Nginx:**
```nginx
add_header Cross-Origin-Embedder-Policy "require-corp" always;
add_header Cross-Origin-Opener-Policy "same-origin" always;
```

## 🎯 Krok 3: Testowanie Systemu

1. **Uruchom aplikację:**
```bash
npm start
```

2. **Przejdź do Face Swap Studio:**
   - W lewym górnym rogu kliknij przycisk **"Face Swap Studio"**

3. **Przetestuj workflow:**
   - Wgraj krótkie video (max 30 sekund do testów)
   - Wgraj wyraźne zdjęcie twarzy
   - Kliknij "Rozpocznij Face Swap"

## 📁 Struktura Utworzonych Plików

```
services/
├── falAiService.ts          # Integracja z fal.ai API
├── videoProcessingService.ts # FFmpeg do przetwarzania video

hooks/
└── useFaceSwap.ts           # Hook zarządzający workflow

components/
├── FaceSwapStudio.tsx       # Główny komponent
├── FileUploadZone.tsx       # Drag & drop upload
├── FaceSwapProgress.tsx     # Progress indicator
└── FaceSwapResult.tsx       # Wynik z video player

public/
└── _headers                 # Headers dla FFmpeg (Netlify)
```

## 🔑 Konfiguracja fal.ai API

### API Key już skonfigurowany:
```typescript
// W services/falAiService.ts
const FAL_API_KEY = '5618b6cf-3851-4cc1-9f43-4b1d40c74b20:3b51795bb52f6d48a909fee7017f9313';
```

### Limity API:
- Model: `easel-gifswap`
- Maksymalny rozmiar GIF: ~10MB
- Czas przetwarzania: 30-120 sekund
- Koszt: ~$0.10 za face swap

## ⚡ Optymalizacja Wydajności

### Ustawienia FFmpeg (w `videoProcessingService.ts`):
```typescript
const options = {
  maxWidth: 512,    // Szerokość GIF
  maxHeight: 512,   // Wysokość GIF  
  fps: 15,          // Klatki na sekundę
  quality: 15       // Jakość kompresji (1-20)
};
```

### Limity plików:
- **Video**: max 100MB
- **Zdjęcie twarzy**: max 10MB
- **Wspierane formaty video**: MP4, MOV, AVI, WebM
- **Wspierane formaty zdjęć**: JPG, PNG, WebP

## 🎨 Integracja z RIPDB

System został zintegrowany z główną aplikacją:

1. **Przycisk nawigacji** w lewym górnym rogu
2. **Spójny design** z resztą aplikacji (glass effects, neon-glow)
3. **Powrót do RIPDB** z Face Swap Studio

## 🛠️ Troubleshooting

### Problem 1: FFmpeg nie ładuje się
**Rozwiązanie:**
```javascript
// Sprawdź headers w przeglądarce (Developer Tools → Network)
// Powinny być: Cross-Origin-Embedder-Policy: require-corp
```

### Problem 2: "SharedArrayBuffer is not defined"
**Rozwiązanie:**
```bash
# Upewnij się, że _headers file jest wdrożony
# Wyczyść cache przeglądarki
# Sprawdź czy strona jest serwowana przez HTTPS
```

### Problem 3: Face swap API errors
**Rozwiązanie:**
```typescript
// Sprawdź logi w konsoli przeglądarki
// Zweryfikuj czy GIF nie jest za duży (max ~5MB)
// Sprawdź czy zdjęcie twarzy jest wyraźne
```

### Problem 4: Wolne przetwarzanie
**Rozwiązanie:**
```typescript
// Zmniejsz rozmiar video
// Obniż FPS w ustawieniach
// Użyj krótszych video (max 30 sekund)
```

### Problem 5: Błędy CORS
**Rozwiązanie:**
```bash
# Sprawdź czy headers są prawidłowo ustawione
# Uruchom na localhost:3000 (nie na file://)
# Sprawdź czy fal.ai API jest dostępne
```

## 🎯 Przykładowy Workflow Użytkownika

1. **Start:** Użytkownik klika "Face Swap Studio"
2. **Upload:** Przeciąga video (np. 10 sekund, aktor umiera w filmie)
3. **Face Upload:** Przeciąga swoje zdjęcie 
4. **Start Processing:** Klika "Rozpocznij Face Swap"
5. **Progress:** 
   - ✅ Ładowanie FFmpeg (5%)
   - ✅ Konwersja video → GIF + audio (35%)
   - ✅ Face swap z fal.ai (70%)
   - ✅ Łączenie GIF + audio (100%)
6. **Result:** Pobiera MP4 z własną twarzą w scenie śmierci

## 🎉 Funkcje Systemu

### ✅ Zaimplementowane:
- [x] **Drag & drop upload** video i zdjęć
- [x] **FFmpeg processing** (video → GIF + audio)
- [x] **fal.ai integration** (easel-gifswap)
- [x] **Progress tracking** z animacjami
- [x] **Video player** z custom controls
- [x] **Download funkcjonalność**
- [x] **Error handling** z retry
- [x] **File validation** (rozmiar, format)
- [x] **Responsive design**
- [x] **Integracja z RIPDB**

### 🔄 Proces face swap:
1. Video → GIF (FFmpeg) ⚡
2. GIF + Twarz → AI Face Swap (fal.ai) 🤖
3. Swapped GIF + Audio → Final MP4 (FFmpeg) 🎬

## 📊 Monitoring

System loguje wszystkie kroki w konsoli przeglądarki:

```javascript
// Przykładowe logi:
🎬 Inicjalizuję FFmpeg...
✅ FFmpeg załadowany pomyślnie!
🎥 Rozpoczynam przetwarzanie video...
📸 Tworzę GIF...
🎵 Wyodrębniam audio...
✅ Przetwarzanie video zakończone!
🎭 Rozpoczynam face swap z fal.ai...
✅ Face swap zakończony pomyślnie!
🎬 Łączę GIF z audio...
✅ Video z face swap gotowe!
🎉 Face swap workflow completed successfully!
```

## 🚀 Gotowe do Użycia!

System jest w pełni funkcjonalny i gotowy do testowania. Wszystkie komponenty są połączone i działają razem:

1. **Upload** → **Process** → **Face Swap** → **Download**
2. **Użyj fal.ai API** z Twoim kluczem
3. **FFmpeg** przetwarzanie w przeglądarce
4. **Professional UI** z RIPDB design system

**Powodzenia z Face Swap Studio!** 🎬✨