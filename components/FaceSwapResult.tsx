import React, { useState } from 'react';
import { 
  Download, 
  Share2, 
  Play, 
  Pause,
  RotateCcw,
  CheckCircle,
  Sparkles,
  Volume2,
  VolumeX
} from 'lucide-react';

interface FaceSwapResultProps {
  videoUrl: string;
  videoBlob: Blob;
  onDownload: () => void;
  onReset: () => void;
}

export const FaceSwapResult: React.FC<FaceSwapResultProps> = ({
  videoUrl,
  videoBlob,
  onDownload,
  onReset
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);

  const handlePlayPause = () => {
    if (!videoRef) return;

    if (isPlaying) {
      videoRef.pause();
    } else {
      videoRef.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleMuteToggle = () => {
    if (!videoRef) return;

    videoRef.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleShare = async () => {
    if (navigator.share && navigator.canShare({ files: [new File([videoBlob], 'face-swap.mp4', { type: 'video/mp4' })] })) {
      try {
        await navigator.share({
          title: 'Mój Face Swap Video',
          text: 'Sprawdź moje face swap video!',
          files: [new File([videoBlob], 'face-swap.mp4', { type: 'video/mp4' })]
        });
      } catch (error) {
        console.log('Sharing failed:', error);
        // Fallback do kopiowania linku
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(videoUrl).then(() => {
      alert('Link do video skopiowany do schowka!');
    }).catch(() => {
      alert('Nie udało się skopiować linku');
    });
  };

  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="glass-panel rounded-xl p-8">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <CheckCircle className="w-12 h-12 text-green-400" />
          <h2 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-primary bg-clip-text text-transparent">
            Face Swap Zakończony!
          </h2>
          <Sparkles className="w-10 h-10 text-yellow-400 animate-bounce" />
        </div>
        <p className="text-xl text-gray-300">
          Twoje video z face swap jest gotowe! 🎉
        </p>
      </div>

      {/* Video Player */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="relative bg-black rounded-xl overflow-hidden shadow-2xl">
          <video
            ref={setVideoRef}
            src={videoUrl}
            className="w-full h-auto"
            controls={false}
            loop
            muted={isMuted}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
          />
          
          {/* Custom Controls Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePlayPause}
                  className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 text-white" />
                  ) : (
                    <Play className="w-6 h-6 text-white ml-1" />
                  )}
                </button>
                
                <button
                  onClick={handleMuteToggle}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5 text-white" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>
              
              <div className="text-white text-sm bg-black/50 px-3 py-1 rounded-full">
                Face Swap Video • {formatFileSize(videoBlob.size)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <button
          onClick={onDownload}
          className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-xl font-bold text-white shadow-lg shadow-green-500/25 transition-all transform hover:scale-105"
        >
          <Download className="w-6 h-6" />
          Pobierz Video
          <span className="text-sm opacity-75">({formatFileSize(videoBlob.size)})</span>
        </button>
        
        <button
          onClick={handleShare}
          className="flex items-center gap-3 px-6 py-4 glass hover:glass-strong rounded-xl font-medium text-white transition-all"
        >
          <Share2 className="w-5 h-5" />
          Udostępnij
        </button>
        
        <button
          onClick={onReset}
          className="flex items-center gap-3 px-6 py-4 bg-gray-600 hover:bg-gray-700 rounded-xl font-medium text-white transition-all"
        >
          <RotateCcw className="w-5 h-5" />
          Nowy Face Swap
        </button>
      </div>

      {/* Stats & Info */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="glass rounded-xl p-4 text-center">
          <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">🎬</span>
          </div>
          <h3 className="font-bold text-white mb-1">Video Gotowe</h3>
          <p className="text-sm text-gray-400">Format MP4 z oryginalnym dźwiękiem</p>
        </div>
        
        <div className="glass rounded-xl p-4 text-center">
          <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">🤖</span>
          </div>
          <h3 className="font-bold text-white mb-1">AI Face Swap</h3>
          <p className="text-sm text-gray-400">Zaawansowana technologia fal.ai</p>
        </div>
        
        <div className="glass rounded-xl p-4 text-center">
          <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">⚡</span>
          </div>
          <h3 className="font-bold text-white mb-1">Rozmiar</h3>
          <p className="text-sm text-gray-400">{formatFileSize(videoBlob.size)}</p>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-6">
        <h3 className="font-bold text-purple-400 mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Co dalej?
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-white mb-2">💡 Wskazówki:</h4>
            <ul className="text-gray-300 space-y-1">
              <li>• Pobierz video do swojego urządzenia</li>
              <li>• Udostępnij w mediach społecznościowych</li>
              <li>• Wypróbuj różne zdjęcia twarzy</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2">🔧 Możliwości:</h4>
            <ul className="text-gray-300 space-y-1">
              <li>• Video zachowuje oryginalny dźwięk</li>
              <li>• Kompatybilne ze wszystkimi platformami</li>
              <li>• Profesjonalna jakość face swap</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};