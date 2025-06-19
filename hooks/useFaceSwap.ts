import { useState, useCallback } from 'react';
import { videoProcessingService } from '../services/videoProcessingService';
import { falAiService } from '../services/falAiService';

export type FaceSwapStep = 
  | 'idle'
  | 'loading-ffmpeg'
  | 'processing-video'
  | 'face-swapping'
  | 'combining'
  | 'completed'
  | 'error';

export interface FaceSwapState {
  step: FaceSwapStep;
  progress: number;
  message: string;
  error?: string;
  
  // Pliki wejściowe
  videoFile?: File;
  faceImage?: File;
  
  // Pliki pośrednie
  originalGif?: Blob;
  originalAudio?: Blob;
  swappedGif?: Blob;
  
  // Wynik końcowy
  finalVideo?: Blob;
  finalVideoUrl?: string;
}

export const useFaceSwap = () => {
  const [state, setState] = useState<FaceSwapState>({
    step: 'idle',
    progress: 0,
    message: 'Gotowy do rozpoczęcia'
  });

  // Reset stanu
  const reset = useCallback(() => {
    setState({
      step: 'idle',
      progress: 0,
      message: 'Gotowy do rozpoczęcia'
    });
  }, []);

  // Uaktualnij stan
  const updateState = useCallback((updates: Partial<FaceSwapState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Główna funkcja face swap
  const performFaceSwap = useCallback(async (videoFile: File, faceImage: File) => {
    try {
      updateState({
        step: 'loading-ffmpeg',
        progress: 5,
        message: 'Ładuję narzędzia do przetwarzania video...',
        videoFile,
        faceImage,
        error: undefined
      });

      // Krok 1: Inicjalizacja FFmpeg
      const ffmpegReady = await videoProcessingService.initializeFFmpeg();
      if (!ffmpegReady) {
        throw new Error('Nie udało się załadować narzędzi do przetwarzania video');
      }

      updateState({
        step: 'processing-video',
        progress: 15,
        message: 'Konwertuję video na GIF i wyodrębniam dźwięk...'
      });

      // Krok 2: Przetwarzanie video (video -> GIF + audio)
      const videoResult = await videoProcessingService.processVideo(videoFile, {
        maxWidth: 512,
        maxHeight: 512,
        fps: 15,
        quality: 15
      });

      if (!videoResult.success || !videoResult.gifBlob || !videoResult.audioBlob) {
        throw new Error(videoResult.error || 'Błąd przetwarzania video');
      }

      updateState({
        progress: 35,
        message: 'Video przetworzone! Przygotowuję face swap...',
        originalGif: videoResult.gifBlob,
        originalAudio: videoResult.audioBlob
      });

      // Krok 3: Face swap (GIF + zdjęcie twarzy -> nowy GIF)
      updateState({
        step: 'face-swapping',
        progress: 45,
        message: 'Wykonuję face swap z fal.ai...'
      });

      const faceSwapResult = await falAiService.swapFaceInGif(faceImage, videoResult.gifBlob);

      if (!faceSwapResult.success || !faceSwapResult.gif_url) {
        throw new Error(faceSwapResult.error || 'Błąd face swap');
      }

      updateState({
        progress: 70,
        message: 'Face swap zakończony! Pobieram przetworzone GIF...'
      });

      // Pobierz przetworzone GIF
      const swappedGifBlob = await falAiService.downloadResultAsBlob(faceSwapResult.gif_url);

      updateState({
        progress: 80,
        message: 'GIF pobrany! Łączę z dźwiękiem...',
        swappedGif: swappedGifBlob
      });

      // Krok 4: Łączenie GIF z audio (GIF + audio -> MP4)
      updateState({
        step: 'combining',
        progress: 85,
        message: 'Łączę przetworzone video z oryginalnym dźwiękiem...'
      });

      const combineResult = await videoProcessingService.combineGifWithAudio(
        swappedGifBlob,
        videoResult.audioBlob
      );

      if (!combineResult.success || !combineResult.videoBlob) {
        throw new Error(combineResult.error || 'Błąd łączenia video z dźwiękiem');
      }

      // Krok 5: Zakończenie
      const finalVideoUrl = URL.createObjectURL(combineResult.videoBlob);

      updateState({
        step: 'completed',
        progress: 100,
        message: 'Face swap zakończony pomyślnie! 🎉',
        finalVideo: combineResult.videoBlob,
        finalVideoUrl
      });

      console.log('🎉 Face swap workflow completed successfully!');

    } catch (error) {
      console.error('❌ Face swap error:', error);
      updateState({
        step: 'error',
        progress: 0,
        message: 'Wystąpił błąd podczas face swap',
        error: error.message || 'Nieznany błąd'
      });
    }
  }, [updateState]);

  // Sprawdź czy można rozpocząć proces
  const canStart = useCallback((videoFile?: File, faceImage?: File): boolean => {
    return !!(
      videoFile && 
      faceImage && 
      state.step === 'idle' &&
      videoProcessingService.isSupportedVideoFormat(videoFile)
    );
  }, [state.step]);

  // Pobierz final video
  const downloadFinalVideo = useCallback((filename: string = 'face-swapped-video.mp4') => {
    if (!state.finalVideo) return;

    const url = URL.createObjectURL(state.finalVideo);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [state.finalVideo]);

  // Sprawdź support dla plików
  const validateFiles = useCallback((videoFile?: File, faceImage?: File) => {
    const errors: string[] = [];

    if (videoFile) {
      if (!videoProcessingService.isSupportedVideoFormat(videoFile)) {
        errors.push('Nieobsługiwany format video. Użyj MP4, MOV, AVI lub WebM.');
      }
      if (videoFile.size > 100 * 1024 * 1024) { // 100MB limit
        errors.push('Plik video jest za duży. Maksymalny rozmiar: 100MB.');
      }
    }

    if (faceImage) {
      if (!faceImage.type.startsWith('image/')) {
        errors.push('Plik twarzy musi być obrazem.');
      }
      if (faceImage.size > 10 * 1024 * 1024) { // 10MB limit
        errors.push('Zdjęcie twarzy jest za duże. Maksymalny rozmiar: 10MB.');
      }
    }

    return errors;
  }, []);

  // Oszacuj całkowity czas przetwarzania
  const estimateProcessingTime = useCallback((videoFile?: File): number => {
    if (!videoFile) return 0;
    
    const videoProcessingTime = videoProcessingService.estimateProcessingTime(videoFile.size);
    const faceSwapTime = 30; // ~30 sekund dla face swap
    const combiningTime = 10; // ~10 sekund na łączenie
    
    return videoProcessingTime + faceSwapTime + combiningTime;
  }, []);

  return {
    // Stan
    state,
    
    // Akcje
    performFaceSwap,
    reset,
    downloadFinalVideo,
    
    // Pomocnicze
    canStart,
    validateFiles,
    estimateProcessingTime,
    
    // Statusy
    isProcessing: ['loading-ffmpeg', 'processing-video', 'face-swapping', 'combining'].includes(state.step),
    isCompleted: state.step === 'completed',
    hasError: state.step === 'error',
    isIdle: state.step === 'idle'
  };
};