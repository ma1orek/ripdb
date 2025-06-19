# 🚀 RIPDB + Claude Sonnet 4 - Dokładna Instrukcja Integracji

## 🔑 Krok 1: Uzyskanie API Key dla Claude Sonnet 4

### Opcja A: Bezpośrednio od Anthropic
1. Przejdź na [console.anthropic.com](https://console.anthropic.com)
2. Załóż konto lub zaloguj się
3. Przejdź do sekcji "API Keys"
4. Kliknij "Create Key"
5. Skopiuj swój klucz API (format: `sk-ant-...`)

### Opcja B: Przez OpenRouter (Alternatywa)
1. Przejdź na [openrouter.ai](https://openrouter.ai)
2. Załóż konto
3. Przejdź do "Keys" i utwórz klucz API
4. Będziesz mógł używać modelu `anthropic/claude-sonnet-4`

## 📦 Krok 2: Instalacja Zależności

```bash
cd /twój/projekt/ripdb
npm install @anthropic-ai/sdk dotenv
# lub alternatywnie:
npm install axios dotenv  # jeśli chcesz użyć OpenRouter
```

## 🔐 Krok 3: Konfiguracja Zmiennych Środowiskowych

Utwórz plik `.env.local` w głównym katalogu projektu:

```env
# Opcja A: Bezpośredni dostęp do Anthropic
ANTHROPIC_API_KEY=sk-ant-twój-klucz-api-tutaj

# Opcja B: Przez OpenRouter
OPENROUTER_API_KEY=sk-or-twój-klucz-openrouter-tutaj
```

Dodaj do `.gitignore`:
```gitignore
.env.local
.env
```

## 🛠️ Krok 4: Utworzenie Serwisu Claude API

Utwórz nowy plik: `services/claudeService.ts`

```typescript
// services/claudeService.ts
import Anthropic from '@anthropic-ai/sdk';

// Opcja A: Bezpośredni dostęp do Anthropic
class ClaudeService {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      // W przeglądarce może być potrzebny proxy
    });
  }

  async generateText(prompt: string, options?: {
    maxTokens?: number;
    temperature?: number;
    thinking?: boolean;
  }) {
    try {
      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: options?.maxTokens || 1000,
        temperature: options?.temperature || 0.7,
        messages: [{ role: 'user', content: prompt }],
        ...(options?.thinking && {
          thinking: { type: 'enabled', budgetTokens: 12000 }
        })
      });

      return {
        text: response.content[0].type === 'text' ? response.content[0].text : '',
        reasoning: (response as any).reasoning || null,
        success: true
      };
    } catch (error) {
      console.error('Claude API Error:', error);
      return {
        text: '',
        reasoning: null,
        success: false,
        error: error.message
      };
    }
  }

  // Opcjonalnie: Metoda specjalna dla analizy śmierci w filmach
  async analyzeDeathScene(deathDescription: string, movieTitle: string, actor: string) {
    const prompt = `
Jesteś ekspertem od scen śmierci w filmach. Przeanalizuj następującą scenę śmierci:

Aktor: ${actor}
Film: ${movieTitle}
Opis śmierci: ${deathDescription}

Dokonaj szczegółowej analizy:
1. Typ śmierci (kategoria)
2. Ocena realizmu (1-10)
3. Wpływ emocjonalny (1-10)
4. Podobne sceny w innych filmach
5. Ciekawostki o realizacji

Odpowiedz w formacie JSON.
`;

    return this.generateText(prompt, { thinking: true });
  }
}

// Opcja B: Przez OpenRouter (alternatywna implementacja)
class ClaudeServiceOpenRouter {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1';

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || '';
  }

  async generateText(prompt: string, options?: {
    maxTokens?: number;
    temperature?: number;
  }) {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://twoja-domena.com', // Opcjonalne
          'X-Title': 'RIPDB App' // Opcjonalne
        },
        body: JSON.stringify({
          model: 'anthropic/claude-sonnet-4',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: options?.maxTokens || 1000,
          temperature: options?.temperature || 0.7
        })
      });

      const data = await response.json();
      
      return {
        text: data.choices?.[0]?.message?.content || '',
        success: true
      };
    } catch (error) {
      console.error('OpenRouter API Error:', error);
      return {
        text: '',
        success: false,
        error: error.message
      };
    }
  }
}

export const claudeService = new ClaudeService();
// export const claudeService = new ClaudeServiceOpenRouter(); // Użyj tej linii dla OpenRouter
```

## 🧠 Krok 5: Integracja z Komponentami React

### A. Utwórz Hook dla Claude AI

Utwórz: `hooks/useClaudeAI.ts`

```typescript
// hooks/useClaudeAI.ts
import { useState } from 'react';
import { claudeService } from '../services/claudeService';

export const useClaudeAI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateDeathAnalysis = async (
    deathDescription: string, 
    movieTitle: string, 
    actor: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const result = await claudeService.analyzeDeathScene(
        deathDescription, 
        movieTitle, 
        actor
      );

      if (!result.success) {
        throw new Error(result.error || 'Błąd API');
      }

      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const generateText = async (prompt: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await claudeService.generateText(prompt, { thinking: true });
      
      if (!result.success) {
        throw new Error(result.error || 'Błąd API');
      }

      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateDeathAnalysis,
    generateText,
    loading,
    error
  };
};
```

### B. Dodaj Komponent AI Analysis

Utwórz: `components/AIDeathAnalysis.tsx`

```typescript
// components/AIDeathAnalysis.tsx
import React, { useState } from 'react';
import { useClaudeAI } from '../hooks/useClaudeAI';
import { Brain, Loader2, Sparkles } from 'lucide-react';

interface AIDeathAnalysisProps {
  deathDescription: string;
  movieTitle: string;
  actorName: string;
}

export const AIDeathAnalysis: React.FC<AIDeathAnalysisProps> = ({
  deathDescription,
  movieTitle,
  actorName
}) => {
  const { generateDeathAnalysis, loading, error } = useClaudeAI();
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [reasoning, setReasoning] = useState<string | null>(null);
  const [showReasoning, setShowReasoning] = useState(false);

  const handleAnalyze = async () => {
    const result = await generateDeathAnalysis(deathDescription, movieTitle, actorName);
    if (result) {
      setAnalysis(result.text);
      setReasoning(result.reasoning);
    }
  };

  return (
    <div className="glass-panel rounded-xl p-6 mt-6">
      <div className="flex items-center gap-3 mb-4">
        <Brain className="w-6 h-6 text-primary" />
        <h3 className="text-xl font-bold text-white">Claude AI Analysis</h3>
        <Sparkles className="w-5 h-5 text-primary animate-pulse" />
      </div>

      {!analysis ? (
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="w-full glass hover:glass-strong rounded-lg px-6 py-3 text-white transition-all disabled:opacity-50"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Claude analizuje scenę śmierci...
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Brain className="w-4 h-4" />
              Analizuj z Claude Sonnet 4
            </div>
          )}
        </button>
      ) : (
        <div className="space-y-4">
          <div className="bg-black/20 rounded-lg p-4">
            <h4 className="font-medium text-primary mb-2">Analiza AI:</h4>
            <div className="text-white whitespace-pre-wrap">{analysis}</div>
          </div>

          {reasoning && (
            <div>
              <button
                onClick={() => setShowReasoning(!showReasoning)}
                className="text-sm text-primary hover:text-primary-hover underline"
              >
                {showReasoning ? 'Ukryj' : 'Pokaż'} proces myślenia AI
              </button>
              
              {showReasoning && (
                <div className="mt-2 bg-gray-900/30 rounded-lg p-3">
                  <h5 className="text-xs text-gray-400 mb-2">ROZUMOWANIE CLAUDE:</h5>
                  <pre className="text-xs text-gray-300 whitespace-pre-wrap">{reasoning}</pre>
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => {
              setAnalysis(null);
              setReasoning(null);
            }}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Analizuj ponownie
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 bg-red-900/30 border border-red-500/30 rounded-lg p-3">
          <p className="text-red-400 text-sm">Błąd: {error}</p>
        </div>
      )}
    </div>
  );
};
```

### C. Dodaj Smart Search z Claude

Utwórz: `components/ClaudeSmartSearch.tsx`

```typescript
// components/ClaudeSmartSearch.tsx
import React, { useState } from 'react';
import { useClaudeAI } from '../hooks/useClaudeAI';
import { Search, Brain, Wand2 } from 'lucide-react';

interface ClaudeSmartSearchProps {
  onSuggestion: (query: string) => void;
}

export const ClaudeSmartSearch: React.FC<ClaudeSmartSearchProps> = ({
  onSuggestion
}) => {
  const { generateText, loading } = useClaudeAI();
  const [userQuery, setUserQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const generateSearchSuggestions = async () => {
    if (!userQuery.trim()) return;

    const prompt = `
Użytkownik szuka w bazie danych RIPDB (śmierci aktorów w filmach): "${userQuery}"

Zasugeruj 5 precyzyjnych zapytań wyszukiwania, które pomogą znaleźć to czego szuka. 
Baza zawiera: nazwy aktorów, tytuły filmów, rodzaje śmierci, lata produkcji.

Odpowiedz tylko listą zapytań, po jednym w linii, bez numeracji:
`;

    const result = await generateText(prompt);
    if (result?.text) {
      const searchSuggestions = result.text
        .split('\n')
        .filter(line => line.trim())
        .slice(0, 5);
      setSuggestions(searchSuggestions);
    }
  };

  return (
    <div className="glass-panel rounded-xl p-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-primary" />
        <h3 className="font-medium text-white">Smart Search z Claude</h3>
      </div>

      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            placeholder="Opisz czego szukasz w naturalnym języku..."
            className="w-full pl-10 pr-4 py-2 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-primary focus:outline-none"
          />
        </div>
        <button
          onClick={generateSearchSuggestions}
          disabled={loading || !userQuery.trim()}
          className="px-4 py-2 glass hover:glass-strong rounded-lg text-white transition-all disabled:opacity-50"
        >
          <Wand2 className="w-4 h-4" />
        </button>
      </div>

      {suggestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-400">Sugestie Claude:</p>
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSuggestion(suggestion)}
              className="w-full text-left p-2 bg-black/10 hover:bg-black/20 rounded-lg text-white text-sm transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
```

## 🔗 Krok 6: Integracja z Istniejącymi Komponentami

### Dodaj do ActorPage.tsx:

```typescript
// W components/ActorPage.tsx
import { AIDeathAnalysis } from './AIDeathAnalysis';

// W komponencie ActorPage, w sekcji pojedynczej śmierci:
{selectedDeath && (
  <div className="death-details">
    {/* ...istniejący kod... */}
    
    <AIDeathAnalysis
      deathDescription={selectedDeath.description}
      movieTitle={selectedDeath.movieTitle}
      actorName={actor.name}
    />
  </div>
)}
```

### Dodaj do SearchBar.tsx:

```typescript
// W components/SearchBar.tsx
import { ClaudeSmartSearch } from './ClaudeSmartSearch';

// Dodaj przed istniejącym search barem:
<ClaudeSmartSearch 
  onSuggestion={(query) => {
    // Ustaw query w search bar i wykonaj wyszukiwanie
    setSearchQuery(query);
    handleSearch(query);
  }}
/>
```

## 🎯 Krok 7: Dodatkowe Funkcje AI

### A. Generator Ciekawostek

```typescript
// W services/claudeService.ts dodaj:
async generateMovieTrivia(movieTitle: string, year: number) {
  const prompt = `
Wygeneruj 3 fascynujące ciekawostki o filmie "${movieTitle}" (${year}).
Skup się na: kulisach produkcji, scenach śmierci, specjalnych efektach.
Odpowiedz krótko i przystępnie.
`;

  return this.generateText(prompt);
}
```

### B. Porównywacz Śmierci

```typescript
// W services/claudeService.ts dodaj:
async compareDeaths(death1: any, death2: any) {
  const prompt = `
Porównaj te dwie sceny śmierci z filmów:

Śmierć 1: ${death1.actor} w "${death1.movie}" - ${death1.description}
Śmierć 2: ${death2.actor} w "${death2.movie}" - ${death2.description}

Przeanalizuj podobieństwa, różnice, wpływ na fabułę i realizm.
`;

  return this.generateText(prompt, { thinking: true });
}
```

## 🚀 Krok 8: Uruchomienie

1. **Sprawdź zmienne środowiskowe:**
```bash
# Dodaj do package.json scripts:
"dev": "ANTHROPIC_API_KEY=twój-klucz npm start"
```

2. **Uruchom aplikację:**
```bash
npm run dev
```

3. **Testuj funkcje AI:**
   - Wejdź na stronę aktora
   - Kliknij "Analizuj z Claude Sonnet 4"
   - Sprawdź Smart Search

## 🛡️ Krok 9: Zabezpieczenia i Optymalizacja

### A. Rate Limiting
```typescript
// Dodaj do claudeService.ts:
private lastRequest = 0;
private minInterval = 1000; // 1 sekunda między requestami

private async rateLimitedRequest<T>(fn: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const timeSinceLastRequest = now - this.lastRequest;
  
  if (timeSinceLastRequest < this.minInterval) {
    await new Promise(resolve => 
      setTimeout(resolve, this.minInterval - timeSinceLastRequest)
    );
  }
  
  this.lastRequest = Date.now();
  return fn();
}
```

### B. Cache Odpowiedzi
```typescript
// Dodaj prostą cache:
private cache = new Map<string, any>();

async generateTextWithCache(prompt: string) {
  const cacheKey = btoa(prompt).slice(0, 50);
  
  if (this.cache.has(cacheKey)) {
    return this.cache.get(cacheKey);
  }
  
  const result = await this.generateText(prompt);
  this.cache.set(cacheKey, result);
  
  return result;
}
```

## 🎉 Gotowe!

Teraz twoja aplikacja RIPDB ma pełną integrację z Claude Sonnet 4! Funkcje:

✅ **AI Analiza Scen Śmierci** - szczegółowe analizy z rozumowaniem
✅ **Smart Search** - inteligentne sugestie wyszukiwania  
✅ **Rozumowanie AI** - możliwość podglądu procesu myślenia Claude
✅ **Rate Limiting** - zabezpieczenie przed przekroczeniem limitów
✅ **Cache** - optymalizacja powtarzających się zapytań

## 🔧 Troubleshooting

**Problem z CORS?**
- Użyj serwera proxy lub API route w Next.js
- Przenieś logikę API do `/api` endpoints

**Błędy API?**
- Sprawdź poprawność klucza API
- Zweryfikuj limity użycia w konsoli Anthropic

**Wolne odpowiedzi?**
- Zmniejsz `maxTokens` w requestach
- Wyłącz `thinking` dla prostszych zapytań

Powodzenia z integracją Claude Sonnet 4 w RIPDB! 🚀