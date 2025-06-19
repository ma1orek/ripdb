import axios from 'axios';

const FAL_API_KEY = '5618b6cf-3851-4cc1-9f43-4b1d40c74b20:3b51795bb52f6d48a909fee7017f9313';
const FAL_BASE_URL = 'https://fal.run/fal-ai';

export interface FaceSwapRequest {
  source_image: string; // base64 lub URL do zdjęcia twarzy
  target_gif: string; // base64 lub URL do GIF-a
}

export interface FaceSwapResult {
  gif_url: string;
  success: boolean;
  error?: string;
}

class FalAiService {
  private apiKey: string;

  constructor() {
    this.apiKey = FAL_API_KEY;
  }

  // Główna metoda face swap z użyciem easel-gifswap
  async swapFaceInGif(sourceImage: File | Blob | string, targetGif: File | Blob | string): Promise<FaceSwapResult> {
    try {
      // Konwertuj pliki na base64 jeśli to konieczne
      const sourceImageBase64 = await this.fileToBase64(sourceImage);
      const targetGifBase64 = await this.fileToBase64(targetGif);

      console.log('🎭 Rozpoczynam face swap z fal.ai...');

      const response = await fetch(`${FAL_BASE_URL}/easel-gifswap`, {
        method: 'POST',
        headers: {
          'Authorization': `Key ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          source_image: sourceImageBase64,
          target_gif: targetGifBase64,
          face_restoration: true,
          face_upsample: true,
          codeformer_weight: 0.8,
          upscale: 1
        })
      });

      const data = await response.json();

      if (response.ok && data.gif_url) {
        console.log('✅ Face swap zakończony pomyślnie!');
        return {
          gif_url: data.gif_url,
          success: true
        };
      } else {
        throw new Error(data.detail || data.error || 'Brak URL GIF-a w odpowiedzi');
      }

    } catch (error: any) {
      console.error('❌ Błąd face swap:', error);
      return {
        gif_url: '',
        success: false,
        error: error.message || 'Nieznany błąd face swap'
      };
    }
  }

  // Alternatywna metoda z polling dla długich operacji
  async swapFaceInGifWithPolling(sourceImage: File | Blob | string, targetGif: File | Blob | string): Promise<FaceSwapResult> {
    try {
      const sourceImageBase64 = await this.fileToBase64(sourceImage);
      const targetGifBase64 = await this.fileToBase64(targetGif);

      console.log('🚀 Uruchamiam zadanie face swap...');

      // Rozpocznij zadanie
      const startResponse = await fetch(`${FAL_BASE_URL}/easel-gifswap`, {
        method: 'POST',
        headers: {
          'Authorization': `Key ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          source_image: sourceImageBase64,
          target_gif: targetGifBase64,
          face_restoration: true,
          face_upsample: true,
          codeformer_weight: 0.8,
          upscale: 1
        })
      });

      const startData = await startResponse.json();

      // Jeśli dostaliśmy od razu wynik
      if (startData.gif_url) {
        return {
          gif_url: startData.gif_url,
          success: true
        };
      }

      // Jeśli mamy request_id, polluj o status
      if (startData.request_id) {
        return await this.pollForResult(startData.request_id);
      }

      throw new Error('Brak request_id ani gif_url w odpowiedzi');

    } catch (error: any) {
      console.error('❌ Błąd face swap with polling:', error);
      return {
        gif_url: '',
        success: false,
        error: error.message || 'Nieznany błąd'
      };
    }
  }

  // Polling dla statusu zadania
  private async pollForResult(requestId: string, maxAttempts: number = 30): Promise<FaceSwapResult> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        console.log(`🔄 Sprawdzam status (${attempt + 1}/${maxAttempts})...`);

        const statusResponse = await fetch(
          `${FAL_BASE_URL}/easel-gifswap/requests/${requestId}`,
          {
            headers: {
              'Authorization': `Key ${this.apiKey}`
            }
          }
        );

        const statusData = await statusResponse.json();
        const status = statusData.status;
        
        if (status === 'COMPLETED') {
          console.log('✅ Zadanie zakończone!');
          return {
            gif_url: statusData.gif_url,
            success: true
          };
        } else if (status === 'FAILED') {
          throw new Error(statusData.error || 'Zadanie nie powiodło się');
        }

        // Czekaj przed następną próbą
        await new Promise(resolve => setTimeout(resolve, 3000));

      } catch (error) {
        if (attempt === maxAttempts - 1) {
          throw error;
        }
      }
    }

    throw new Error('Timeout - zadanie trwało zbyt długo');
  }

  // Pomocnicza metoda do konwersji pliku na base64
  private async fileToBase64(file: File | Blob | string): Promise<string> {
    if (typeof file === 'string') {
      return file; // Już jest base64 lub URL
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Sprawdź status API
  async checkApiStatus(): Promise<boolean> {
    try {
      const response = await fetch(`${FAL_BASE_URL}/easel-gifswap/health`, {
        headers: {
          'Authorization': `Key ${this.apiKey}`
        }
      });
      return response.ok;
    } catch (error) {
      console.error('❌ API fal.ai niedostępne:', error);
      return false;
    }
  }

  // Pobierz wynik jako blob do dalszego przetwarzania
  async downloadResultAsBlob(gifUrl: string): Promise<Blob> {
    try {
      const response = await fetch(gifUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.blob();
    } catch (error) {
      console.error('❌ Błąd pobierania GIF-a:', error);
      throw new Error('Nie udało się pobrać przetworzonego GIF-a');
    }
  }

  // Konwertuj Blob na File (pomocnicza metoda)
  private blobToFile(blob: Blob, fileName: string): File {
    return new File([blob], fileName, { type: blob.type });
  }
}

export const falAiService = new FalAiService();