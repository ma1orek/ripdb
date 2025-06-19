import React, { useState } from 'react';
import { useFaceSwap } from '../hooks/useFaceSwap';
import { FileUploadZone } from './FileUploadZone';
import { FaceSwapProgress } from './FaceSwapProgress';
import { FaceSwapResult } from './FaceSwapResult';
import { 
  Video, 
  User, 
  Play, 
  RotateCcw, 
  AlertCircle, 
  Sparkles,
  Wand2
} from 'lucide-react';

export const FaceSwapStudio: React.FC = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [faceImage, setFaceImage] = useState<File | null>(null);
  
  const {
    state,
    performFaceSwap,
    reset,
    downloadFinalVideo,
    canStart,
    validateFiles,
    estimateProcessingTime,
    isProcessing,
    isCompleted,
    hasError,
    isIdle
  } = useFaceSwap();

  const handleStartFaceSwap = async () => {
    if (!videoFile || !faceImage) return;
    
    const validationErrors = validateFiles(videoFile, faceImage);
    if (validationErrors.length > 0) {
      alert('Błędy walidacji:\n' + validationErrors.join('\n'));
      return;
    }

    await performFaceSwap(videoFile, faceImage);
  };

  const handleReset = () => {
    reset();
    setVideoFile(null);
    setFaceImage(null);
  };

  const estimatedTime = videoFile ? estimateProcessingTime(videoFile) : 0;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Wand2 className="w-10 h-10 text-primary animate-pulse" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              Face Swap Studio
            </h1>
            <Sparkles className="w-8 h-8 text-purple-400 animate-bounce" />
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Zamień twarze w video używając zaawansowanej AI. 
            Wgraj video i zdjęcie twarzy, a otrzymasz profesjonalny face swap!
          </p>
        </div>

        {/* Status indicator */}
        <div className="glass-panel rounded-xl p-4 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                hasError ? 'bg-red-400 animate-pulse' :
                isProcessing ? 'bg-yellow-400 animate-pulse' :
                isCompleted ? 'bg-green-400' :
                'bg-gray-400'
              }`} />
              <span className="font-medium">
                {hasError ? 'Błąd' :
                 isProcessing ? 'Przetwarzanie...' :
                 isCompleted ? 'Zakończono' :
                 'Gotowy'}
              </span>
              {estimatedTime > 0 && isIdle && (
                <span className="text-sm text-muted-foreground">
                  (~{Math.ceil(estimatedTime)}s szacowany czas)
                </span>
              )}
            </div>
            
            {(isCompleted || hasError) && (
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 glass hover:glass-strong rounded-lg transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Nowy Face Swap
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        {isIdle && (
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Video Upload */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Video className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">1. Wgraj Video</h2>
              </div>
              
              <FileUploadZone
                accept="video/*"
                onFileSelect={setVideoFile}
                selectedFile={videoFile}
                title="Przeciągnij video tutaj"
                description="Obsługiwane formaty: MP4, MOV, AVI, WebM (max 100MB)"
                icon={<Video className="w-12 h-12 text-primary" />}
              />
              
              {videoFile && (
                <div className="glass rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Video className="w-5 h-5 text-green-400" />
                    <div>
                      <p className="font-medium text-white">{videoFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Face Image Upload */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">2. Wgraj Zdjęcie Twarzy</h2>
              </div>
              
              <FileUploadZone
                accept="image/*"
                onFileSelect={setFaceImage}
                selectedFile={faceImage}
                title="Przeciągnij zdjęcie tutaj"
                description="Najlepiej wyraźne zdjęcie twarzy (max 10MB)"
                icon={<User className="w-12 h-12 text-primary" />}
              />
              
              {faceImage && (
                <div className="glass rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-green-400" />
                    <div>
                      <p className="font-medium text-white">{faceImage.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(faceImage.size / (1024 * 1024)).toFixed(1)} MB
                      </p>
                    </div>
                  </div>
                  
                  {/* Preview obrazka */}
                  <div className="mt-3">
                    <img 
                      src={URL.createObjectURL(faceImage)}
                      alt="Podgląd twarzy"
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Start Button */}
        {isIdle && (
          <div className="text-center mb-8">
            <button
              onClick={handleStartFaceSwap}
              disabled={!canStart(videoFile, faceImage)}
              className={`
                px-8 py-4 rounded-xl font-bold text-lg transition-all transform
                ${canStart(videoFile, faceImage)
                  ? 'bg-gradient-to-r from-primary to-purple-500 hover:from-primary-hover hover:to-purple-600 hover:scale-105 text-white shadow-lg shadow-primary/25'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <Play className="w-6 h-6" />
                Rozpocznij Face Swap
                {estimatedTime > 0 && (
                  <span className="text-sm opacity-75">
                    (~{Math.ceil(estimatedTime)}s)
                  </span>
                )}
              </div>
            </button>
            
            {!canStart(videoFile, faceImage) && (
              <p className="text-sm text-muted-foreground mt-2">
                Wgraj video i zdjęcie twarzy aby rozpocząć
              </p>
            )}
          </div>
        )}

        {/* Progress */}
        {isProcessing && (
          <FaceSwapProgress 
            step={state.step}
            progress={state.progress}
            message={state.message}
            videoFile={videoFile}
            faceImage={faceImage}
          />
        )}

        {/* Error */}
        {hasError && (
          <div className="glass-panel rounded-xl p-6 border border-red-500/30 bg-red-900/20">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-400" />
              <h3 className="text-xl font-bold text-red-400">Wystąpił błąd</h3>
            </div>
            <p className="text-red-300 mb-4">{state.error}</p>
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              Spróbuj ponownie
            </button>
          </div>
        )}

        {/* Result */}
        {isCompleted && state.finalVideoUrl && (
          <FaceSwapResult
            videoUrl={state.finalVideoUrl}
            videoBlob={state.finalVideo!}
            onDownload={() => downloadFinalVideo()}
            onReset={handleReset}
          />
        )}

        {/* Info Panel */}
        <div className="mt-12 glass-panel rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Jak to działa?
          </h3>
          <div className="grid md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-xl">🎬</span>
              </div>
              <p className="font-medium mb-1">1. Przetwarzanie Video</p>
              <p className="text-muted-foreground">Konwersja na GIF + wyodrębnienie dźwięku</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-xl">🤖</span>
              </div>
              <p className="font-medium mb-1">2. Face Swap AI</p>
              <p className="text-muted-foreground">Zaawansowana AI zamienia twarze w GIF</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-xl">🎵</span>
              </div>
              <p className="font-medium mb-1">3. Łączenie z Audio</p>
              <p className="text-muted-foreground">GIF + oryginalny dźwięk = MP4</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-xl">✨</span>
              </div>
              <p className="font-medium mb-1">4. Gotowe!</p>
              <p className="text-muted-foreground">Pobierz swoje face swap video</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};