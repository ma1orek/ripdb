import React, { useState, useEffect } from 'react';
import { DeathNode } from './DeathNode';
import { DeathEvent } from '../data/mockData';

interface DeathTimelineProps {
  deaths: DeathEvent[];
}

export function DeathTimeline({ deaths }: DeathTimelineProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Sort deaths chronologically
  const sortedDeaths = [...deaths].sort((a, b) => 
    new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime()
  );

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleNodeClick = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  if (sortedDeaths.length === 0) {
    return (
      <div className="glass rounded-xl p-8 text-center">
        <p className="text-muted-foreground">No death records found for this actor.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Timeline header */}
      <div className="text-center space-y-2 fade-in-up">
        <h2 className="text-3xl font-bold text-white">Death Timeline</h2>
        <p className="text-muted-foreground">
          Click on any node to view death details
        </p>
      </div>

      {/* Timeline container */}
      <div className="relative overflow-x-auto">
        <div className="min-w-max px-8">
          {/* Timeline line */}
          <div className="relative h-px bg-gradient-to-r from-transparent via-primary to-transparent mb-12">
            <div className="absolute inset-0 bg-primary/30 blur-sm" />
          </div>

          {/* Death nodes */}
          <div className="flex items-start justify-between gap-8 relative -mt-16 pb-8">
            {sortedDeaths.map((death, index) => (
              <div
                key={death.id}
                className={`slide-in-left ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <DeathNode
                  death={death}
                  index={index}
                  isActive={activeIndex === index}
                  onClick={() => handleNodeClick(index)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation hint */}
      <div className="text-center fade-in-up" style={{ animationDelay: '1s' }}>
        <p className="text-sm text-muted-foreground">
          Scroll horizontally to explore the complete timeline
        </p>
      </div>
    </div>
  );
}