import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

interface CaptchaWidgetProps {
  value: string;
  onChange: (value: string) => void;
  isValid?: boolean;
  error?: string | null;
}

export const CaptchaWidget: React.FC<CaptchaWidgetProps> = ({
  value,
  onChange,
  isValid,
  error,
}) => {
  const [captchaCode, setCaptchaCode] = useState('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const generateCaptchaCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded confusing chars like I, O, 0, 1
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    onChange(''); // Reset user input on captcha refresh
  };

  useEffect(() => {
    generateCaptchaCode();
  }, []);

  // Expose current captcha code validation check
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !captchaCode) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas styling & dimensions
    const width = canvas.width;
    const height = canvas.height;

    // Dark cyber gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(0.5, '#1e293b');
    gradient.addColorStop(1, '#020617');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Random noise lines
    for (let i = 0; i < 6; i++) {
      ctx.strokeStyle = i % 2 === 0 ? 'rgba(45, 212, 191, 0.3)' : 'rgba(168, 85, 247, 0.3)';
      ctx.lineWidth = 1 + Math.random() * 2;
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.bezierCurveTo(
        Math.random() * width,
        Math.random() * height,
        Math.random() * width,
        Math.random() * height,
        Math.random() * width,
        Math.random() * height
      );
      ctx.stroke();
    }

    // Random noise dots
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.25})`;
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw distorion text
    const colors = ['#2dd4bf', '#a855f7', '#38bdf8', '#f43f5e', '#34d399'];
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 26px monospace';

    const charWidth = width / (captchaCode.length + 1);

    for (let i = 0; i < captchaCode.length; i++) {
      const char = captchaCode[i];
      const color = colors[i % colors.length];
      const x = (i + 1) * charWidth - 5;
      const y = height / 2 + (Math.random() * 6 - 3);
      const angle = (Math.random() * 0.4 - 0.2); // Small random rotation angle

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 6;
      ctx.fillText(char, -10, 0);
      ctx.restore();
    }
  }, [captchaCode]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold uppercase tracking-wider text-white/70 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-accent-teal" />
          CAPTCHA Verification
        </label>
        <button
          type="button"
          onClick={generateCaptchaCode}
          title="Generate new CAPTCHA"
          className="text-[11px] text-accent-teal hover:text-white flex items-center gap-1 transition-colors font-semibold cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" />
          Refresh CAPTCHA
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Canvas Display */}
        <div className="relative rounded-xl overflow-hidden border border-white/20 bg-black/40 flex items-center justify-center p-1 flex-shrink-0 shadow-inner">
          <canvas
            ref={canvasRef}
            width={180}
            height={48}
            className="rounded-lg select-none cursor-pointer"
            onClick={generateCaptchaCode}
            title="Click to refresh CAPTCHA code"
          />
        </div>

        {/* User Input */}
        <div className="relative flex-1">
          <input
            type="text"
            required
            maxLength={5}
            placeholder="Enter code"
            value={value}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            className={`w-full bg-black/30 border rounded-xl px-3.5 py-3 text-sm text-white uppercase tracking-widest placeholder:normal-case placeholder:tracking-normal placeholder-white/30 focus:outline-none transition-colors font-mono font-bold ${
              error
                ? 'border-accent-red focus:border-accent-red'
                : value.length === 5 && value.toUpperCase() === captchaCode
                ? 'border-accent-green focus:border-accent-green'
                : 'border-white/10 focus:border-accent-teal'
            }`}
          />
          {value.length === 5 && value.toUpperCase() === captchaCode && (
            <CheckCircle2 className="w-4 h-4 text-accent-green absolute right-3 top-1/2 -translate-y-1/2" />
          )}
        </div>
      </div>

      {/* Hidden helper element containing current code for parent comparison */}
      <input type="hidden" data-captcha-target={captchaCode} />
    </div>
  );
};
