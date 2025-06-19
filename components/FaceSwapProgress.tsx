import React from 'react';
import { FaceSwapStep } from '../hooks/useFaceSwap';
import { 
  Loader2, 
  Video, 
  User, 
  Wand2, 
  Music, 
  CheckCircle,
  Clock
} from 'lucide-react';

interface FaceSwapProgressProps {
  step: FaceSwapStep;
  progress: number;
  message: string;
  videoFile?: File | null;
  faceImage?: File | null;
}

interface ProgressStepInfo {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  isActive: boolean;
  isCompleted: boolean;
}

export const FaceSwapProgress: React.FC<FaceSwapProgressProps> = ({
  step,
  progress,
  message,
  videoFile,
  faceImage
}) => {
  const steps: Record<string, ProgressStepInfo> = {
    'loading-ffmpeg': {
      icon: Loader2,
      title: 'Inicjalizacja',
      description: 'Ładowanie narzędzi FFmpeg...',
      isActive: step === 'loading-ffmpeg',
      isCompleted: false
    },
    'processing-video': {
      icon: Video,
      title: 'Przetwarzanie Video',
      description: 'Konwersja na GIF i wyodrębnianie audio...',
      isActive: step === 'processing-video',
      isCompleted: progress > 35
    },
    'face-swapping': {
      icon: Wand2,
      title: 'Face Swap AI',
      description: 'Zamiana twarzy z fal.ai...',
      isActive: step === 'face-swapping',
      isCompleted: progress > 70
    },
    'combining': {
      icon: Music,
      title: 'Finalizacja',
      description: 'Łączenie z oryginalnym dźwiękiem...',
      isActive: step === 'combining',
      isCompleted: progress >= 100
    }
  };

  const stepOrder = ['loading-ffmpeg', 'processing-video', 'face-swapping', 'combining'];

  return (
    <div className="glass-panel rounded-xl p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <h2 className="text-3xl font-bold text-white">Face Swap w toku...</h2>
        </div>
        <p className="text-gray-300">{message}</p>
      </div>

      {/* Files Info */}
      {(videoFile || faceImage) && (
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {videoFile && (
            <div className="glass rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Video className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="font-medium text-white">Video źródłowe</p>
                  <p className="text-sm text-gray-400">{videoFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                </div>
              </div>
            </div>
          )}

          {faceImage && (
            <div className="glass rounded-lg p-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-green-400" />
                <div>
                  <p className="font-medium text-white">Twarz docelowa</p>
                  <p className="text-sm text-gray-400">{faceImage.name}</p>
                  <p className="text-xs text-gray-500">
                    {(faceImage.size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Postęp</span>
          <span className="text-sm font-medium text-white">{progress}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-primary to-purple-500 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {stepOrder.map((stepKey, index) => {
          const stepInfo = steps[stepKey];
          const StepIcon = stepInfo.icon;
          
          return (
            <div
              key={stepKey}
              className={`
                flex items-center gap-4 p-4 rounded-lg transition-all
                ${stepInfo.isActive 
                  ? 'bg-primary/20 border border-primary/30' 
                  : stepInfo.isCompleted 
                    ? 'bg-green-900/20 border border-green-500/30'
                    : 'bg-gray-900/30 border border-gray-600/30'
                }
              `}
            >
              {/* Step Number/Icon */}
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center
                ${stepInfo.isActive 
                  ? 'bg-primary text-white' 
                  : stepInfo.isCompleted 
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-600 text-gray-300'
                }
              `}>
                {stepInfo.isCompleted ? (
                  <CheckCircle className="w-6 h-6" />
                ) : stepInfo.isActive ? (
                  <StepIcon className={`w-6 h-6 ${stepKey === 'loading-ffmpeg' ? 'animate-spin' : ''}`} />
                ) : (
                  <span className="text-lg font-bold">{index + 1}</span>
                )}
              </div>

              {/* Step Info */}
              <div className="flex-1">
                <h3 className={`font-bold ${
                  stepInfo.isActive ? 'text-primary' : 
                  stepInfo.isCompleted ? 'text-green-400' : 
                  'text-gray-400'
                }`}>
                  {stepInfo.title}
                </h3>
                <p className="text-sm text-gray-300">
                  {stepInfo.description}
                </p>
              </div>

              {/* Status Indicator */}
              <div className="text-right">
                {stepInfo.isCompleted && (
                  <div className="text-green-400 text-sm font-medium">
                    ✓ Zakończono
                  </div>
                )}
                {stepInfo.isActive && (
                  <div className="flex items-center gap-2 text-primary text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    W toku...
                  </div>
                )}
                {!stepInfo.isActive && !stepInfo.isCompleted && (
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Clock className="w-4 h-4" />
                    Oczekuje
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tips */}
      <div className="mt-8 bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
        <h4 className="font-medium text-blue-400 mb-2">💡 Wskazówki podczas przetwarzania:</h4>
        <ul className="text-sm text-blue-300 space-y-1">
          <li>• Nie zamykaj karty przeglądarki</li>
          <li>• Proces może potrwać od 1 do 5 minut</li>
          <li>• Jakość face swap zależy od wyraźności twarzy na zdjęciu</li>
          <li>• Im krótsze video, tym szybsze przetwarzanie</li>
        </ul>
      </div>
    </div>
  );
};