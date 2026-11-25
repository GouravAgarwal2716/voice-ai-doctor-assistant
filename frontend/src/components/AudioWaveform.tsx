import React, { useEffect, useRef } from 'react';

interface AudioWaveformProps {
  analyser: AnalyserNode | null;
  isActive: boolean;
  barColor?: string;
  className?: string;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  analyser,
  isActive,
  barColor = '#f43f5e',
  className = 'h-16 w-full'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser ? analyser.frequencyBinCount : 32;
    const dataArray = new Uint8Array(bufferLength);

    let phase = 0;

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      if (analyser && isActive) {
        analyser.getByteFrequencyData(dataArray);
      } else if (isActive) {
        // Dynamic organic pulse wave
        phase += 0.06;
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = Math.sin(phase + i * 0.25) * 35 + 45;
        }
      } else {
        // Flat baseline
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = 6;
        }
      }

      const numBars = 28;
      const barWidth = 3.5;
      const spacing = (width - numBars * barWidth) / (numBars + 1);

      for (let i = 0; i < numBars; i++) {
        const dataIndex = Math.floor((i / numBars) * (bufferLength / 2));
        const val = dataArray[dataIndex] || 0;
        const barHeight = Math.max(3.5, (val / 255) * height * 0.88);

        const x = spacing + i * (barWidth + spacing);
        const y = (height - barHeight) / 2;

        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, '#fb7185'); // rose-400
        gradient.addColorStop(0.5, '#fb923c'); // orange-400
        gradient.addColorStop(1, '#38bdf8'); // sky-400

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [analyser, isActive, barColor]);

  return (
    <canvas
      ref={canvasRef}
      width={260}
      height={64}
      className={className}
    />
  );
};
