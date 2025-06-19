import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export interface VideoProcessingResult {
  gifBlob?: Blob;
  audioBlob?: Blob;
  success: boolean;
  error?: string;
}

export interface VideoToGifOptions {
  maxWidth?: number;
  maxHeight?: number;
  fps?: number;
  quality?: number;
}

class VideoProcessingService {
  private ffmpeg: FFmpeg | null = null;
  private isLoaded = false;

  // Inicjalizacja FFmpeg
  async initializeFFmpeg(): Promise<boolean> {
    if (this.isLoaded && this.ffmpeg) {
      return true;
    }

    try {
      console.log('🎬 Inicjalizuję FFmpeg...');
      
      this.ffmpeg = new FFmpeg();
      
      // Załaduj FFmpeg core i wasm
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      await this.ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });

      this.isLoaded = true;
      console.log('✅ FFmpeg załadowany pomyślnie!');
      return true;

    } catch (error) {
      console.error('❌ Błąd inicjalizacji FFmpeg:', error);
      this.isLoaded = false;
      return false;
    }
  }

  // Konwertuj video na GIF + wyodrębnij audio
  async processVideo(
    videoFile: File, 
    options: VideoToGifOptions = {}
  ): Promise<VideoProcessingResult> {
    
    if (!await this.initializeFFmpeg() || !this.ffmpeg) {
      return {
        success: false,
        error: 'Nie udało się zainicjalizować FFmpeg'
      };
    }

    try {
      const {
        maxWidth = 480,
        maxHeight = 320,
        fps = 10,
        quality = 20
      } = options;

      console.log('🎥 Rozpoczynam przetwarzanie video...');

      // Wczytaj plik video do FFmpeg
      await this.ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));

      console.log('📸 Tworzę GIF...');
      
      // Konwertuj na GIF z opcjami optymalizacji
      await this.ffmpeg.exec([
        '-i', 'input.mp4',
        '-vf', `fps=${fps},scale=${maxWidth}:${maxHeight}:flags=lanczos,palettegen=max_colors=256`,
        '-y', 'palette.png'
      ]);

      await this.ffmpeg.exec([
        '-i', 'input.mp4',
        '-i', 'palette.png',
        '-vf', `fps=${fps},scale=${maxWidth}:${maxHeight}:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=${quality}`,
        '-y', 'output.gif'
      ]);

      console.log('🎵 Wyodrębniam audio...');
      
      // Wyodrębnij audio
      await this.ffmpeg.exec([
        '-i', 'input.mp4',
        '-vn', // tylko audio
        '-acodec', 'libmp3lame',
        '-ab', '128k',
        '-ar', '44100',
        '-y', 'audio.mp3'
      ]);

      // Pobierz wyniki
      const gifData = await this.ffmpeg.readFile('output.gif');
      const audioData = await this.ffmpeg.readFile('audio.mp3');

      // Konwertuj na Blob
      const gifBlob = new Blob([gifData], { type: 'image/gif' });
      const audioBlob = new Blob([audioData], { type: 'audio/mpeg' });

      // Wyczyść pliki tymczasowe
      await this.cleanupTempFiles();

      console.log('✅ Przetwarzanie video zakończone!');

      return {
        gifBlob,
        audioBlob,
        success: true
      };

    } catch (error) {
      console.error('❌ Błąd przetwarzania video:', error);
      await this.cleanupTempFiles();
      
      return {
        success: false,
        error: error.message || 'Nieznany błąd przetwarzania video'
      };
    }
  }

  // Połącz przetworzone GIF z audio w MP4
  async combineGifWithAudio(
    gifBlob: Blob, 
    audioBlob: Blob
  ): Promise<{ videoBlob?: Blob; success: boolean; error?: string }> {
    
    if (!await this.initializeFFmpeg() || !this.ffmpeg) {
      return {
        success: false,
        error: 'Nie udało się zainicjalizować FFmpeg'
      };
    }

    try {
      console.log('🎬 Łączę GIF z audio...');

      // Wczytaj pliki
      await this.ffmpeg.writeFile('processed.gif', await fetchFile(gifBlob));
      await this.ffmpeg.writeFile('audio.mp3', await fetchFile(audioBlob));

      // Połącz GIF z audio w MP4
      await this.ffmpeg.exec([
        '-i', 'processed.gif',
        '-i', 'audio.mp3',
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-pix_fmt', 'yuv420p',
        '-shortest', // zakończ gdy skończy się krótszy plik
        '-y', 'final_output.mp4'
      ]);

      // Pobierz wynik
      const videoData = await this.ffmpeg.readFile('final_output.mp4');
      const videoBlob = new Blob([videoData], { type: 'video/mp4' });

      await this.cleanupTempFiles();

      console.log('✅ Video z face swap gotowe!');

      return {
        videoBlob,
        success: true
      };

    } catch (error) {
      console.error('❌ Błąd łączenia GIF z audio:', error);
      await this.cleanupTempFiles();
      
      return {
        success: false,
        error: error.message || 'Nieznany błąd łączenia plików'
      };
    }
  }

  // Wyczyść pliki tymczasowe
  private async cleanupTempFiles(): Promise<void> {
    if (!this.ffmpeg) return;

    try {
      const files = ['input.mp4', 'palette.png', 'output.gif', 'audio.mp3', 'processed.gif', 'final_output.mp4'];
      
      for (const file of files) {
        try {
          await this.ffmpeg.deleteFile(file);
        } catch (e) {
          // Ignoruj błędy - plik może nie istnieć
        }
      }
    } catch (error) {
      console.warn('⚠️ Nie udało się wyczyścić wszystkich plików tymczasowych');
    }
  }

  // Sprawdź czy FFmpeg jest dostępny
  isFFmpegAvailable(): boolean {
    return this.isLoaded && this.ffmpeg !== null;
  }

  // Pobierz informacje o video
  async getVideoInfo(videoFile: File): Promise<{
    duration?: number;
    width?: number;
    height?: number;
    size: number;
  }> {
    return {
      size: videoFile.size,
      // Możemy dodać więcej informacji używając FFmpeg probe
    };
  }

  // Sprawdź czy plik jest wspierany
  isSupportedVideoFormat(file: File): boolean {
    const supportedTypes = [
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
      'video/x-msvideo', // AVI
      'video/webm'
    ];

    return supportedTypes.includes(file.type);
  }

  // Oszacuj czas przetwarzania
  estimateProcessingTime(fileSizeBytes: number): number {
    // Przybliżone oszacowanie: ~1 sekunda na każdy MB
    const fileSizeMB = fileSizeBytes / (1024 * 1024);
    return Math.max(10, fileSizeMB * 1.5); // minimum 10 sekund
  }
}

export const videoProcessingService = new VideoProcessingService();