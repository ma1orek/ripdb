import React, { useState, useEffect, useRef } from 'react';
import { Film, Calendar, User, Info } from 'lucide-react';
import { DeathEvent } from '../data/mockData';

interface NeuralDeathMapProps {
  deaths: DeathEvent[];
  actorName: string;
}

interface NodePosition {
  x: number;
  y: number;
  death: DeathEvent;
  connections: number[];
}

export function NeuralDeathMap({ deaths, actorName }: NeuralDeathMapProps) {
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  const [nodePositions, setNodePositions] = useState<NodePosition[]>([]);
  const [isAnimating, setIsAnimating] = useState(true);
  const svgRef = useRef<SVGSVGElement>(null);

  // Generate neural network layout
  useEffect(() => {
    if (deaths.length === 0) return;

    const centerX = 400;
    const centerY = 300;
    const radius = 200;
    
    const positions: NodePosition[] = deaths.map((death, index) => {
      const angle = (index / deaths.length) * 2 * Math.PI;
      const nodeRadius = radius + (Math.random() - 0.5) * 100;
      
      return {
        x: centerX + Math.cos(angle) * nodeRadius,
        y: centerY + Math.sin(angle) * nodeRadius,
        death,
        connections: generateConnections(index, deaths.length)
      };
    });

    setNodePositions(positions);
    
    // Stop animation after initial load
    setTimeout(() => setIsAnimating(false), 3000);
  }, [deaths]);

  const generateConnections = (currentIndex: number, totalNodes: number): number[] => {
    const connections: number[] = [];
    const connectionCount = Math.min(3, totalNodes - 1);
    
    for (let i = 0; i < connectionCount; i++) {
      let targetIndex;
      do {
        targetIndex = Math.floor(Math.random() * totalNodes);
      } while (targetIndex === currentIndex || connections.includes(targetIndex));
      
      connections.push(targetIndex);
    }
    
    return connections;
  };

  const formatYear = (dateString: string) => {
    return new Date(dateString).getFullYear();
  };

  const getDeathTypeColor = (type: string) => {
    const colors = {
      violent: '#FF4444',
      heroic: '#8B45FF',
      tragic: '#4ECDC4',
      comedic: '#F9CA24',
      supernatural: '#FF6B9D'
    };
    return colors[type as keyof typeof colors] || '#8B45FF';
  };

  if (deaths.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-8 text-center">
        <p className="text-muted-foreground">No death records found for this actor.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Map Header */}
      <div className="text-center space-y-2 fade-in-up">
        <h2 className="bg-gradient-to-r from-white to-primary bg-clip-text text-transparent">
          Neural Death Map
        </h2>
        <p className="text-muted-foreground">
          Interactive network of {actorName}'s on-screen deaths
        </p>
      </div>

      {/* Neural Network Visualization */}
      <div className="relative w-full h-[600px] glass-panel rounded-2xl overflow-hidden">
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox="0 0 800 600"
          className="absolute inset-0"
        >
          {/* Background grid */}
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(139, 69, 255, 0.1)" strokeWidth="1"/>
            </pattern>
            <radialGradient id="nodeGradient">
              <stop offset="0%" stopColor="rgba(139, 69, 255, 0.8)"/>
              <stop offset="100%" stopColor="rgba(139, 69, 255, 0.3)"/>
            </radialGradient>
          </defs>
          
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Neural connections */}
          {nodePositions.map((node, index) =>
            node.connections.map(connectionIndex => {
              const targetNode = nodePositions[connectionIndex];
              if (!targetNode) return null;
              
              return (
                <line
                  key={`${index}-${connectionIndex}`}
                  x1={node.x}
                  y1={node.y}
                  x2={targetNode.x}
                  y2={targetNode.y}
                  className="neural-connection"
                  style={{ animationDelay: `${index * 0.5}s` }}
                />
              );
            })
          )}
          
          {/* Death nodes */}
          {nodePositions.map((node, index) => (
            <g key={node.death.id}>
              {/* Node glow effect */}
              <circle
                cx={node.x}
                cy={node.y}
                r="30"
                fill="url(#nodeGradient)"
                className={`neural-pulse ${selectedNode === index ? 'opacity-100' : 'opacity-60'}`}
                style={{ animationDelay: `${index * 0.3}s` }}
              />
              
              {/* Main node */}
              <circle
                cx={node.x}
                cy={node.y}
                r="20"
                fill={getDeathTypeColor(node.death.deathType)}
                stroke="rgba(255, 255, 255, 0.3)"
                strokeWidth="2"
                className="cursor-pointer liquid-animation hover:stroke-white"
                onClick={() => setSelectedNode(selectedNode === index ? null : index)}
              />
              
              {/* Year label */}
              <text
                x={node.x}
                y={node.y + 40}
                textAnchor="middle"
                className="fill-white text-sm font-medium"
              >
                {formatYear(node.death.releaseDate)}
              </text>
            </g>
          ))}
        </svg>

        {/* Floating detail card */}
        {selectedNode !== null && nodePositions[selectedNode] && (
          <div 
            className="absolute z-10 w-80 glass-strong rounded-xl p-6 shadow-2xl fade-in-up"
            style={{
              left: Math.min(nodePositions[selectedNode].x + 50, 400),
              top: Math.max(nodePositions[selectedNode].y - 100, 20)
            }}
          >
            <div className="space-y-4">
              {/* Movie poster and title */}
              <div className="flex gap-4">
                <img
                  src={nodePositions[selectedNode].death.posterUrl}
                  alt={nodePositions[selectedNode].death.movieTitle}
                  className="w-16 h-24 rounded-lg object-cover ring-2 ring-primary/30"
                />
                <div className="flex-1">
                  <h4 className="font-bold text-white mb-1">
                    {nodePositions[selectedNode].death.movieTitle}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {formatYear(nodePositions[selectedNode].death.releaseDate)} • {nodePositions[selectedNode].death.director}
                  </p>
                  {nodePositions[selectedNode].death.imdbRating && (
                    <div className="flex items-center gap-1 mt-1">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <span className="text-sm text-yellow-400">
                        {nodePositions[selectedNode].death.imdbRating}/10
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Character */}
              <div className="flex items-center gap-2 text-primary">
                <User className="w-4 h-4" />
                <span className="font-medium">{nodePositions[selectedNode].death.character}</span>
              </div>

              {/* Death description */}
              <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                <p className="text-sm text-destructive-foreground font-medium">
                  💀 {nodePositions[selectedNode].death.deathDescription}
                </p>
              </div>

              {/* Genre and box office */}
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{nodePositions[selectedNode].death.genre}</span>
                {nodePositions[selectedNode].death.boxOffice && (
                  <span>{nodePositions[selectedNode].death.boxOffice}</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="glass-panel rounded-xl p-4">
        <h4 className="text-sm font-medium text-white mb-3">Death Types</h4>
        <div className="flex flex-wrap gap-4">
          {['violent', 'heroic', 'tragic', 'comedic', 'supernatural'].map(type => (
            <div key={type} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getDeathTypeColor(type) }}
              />
              <span className="text-sm text-muted-foreground capitalize">{type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}