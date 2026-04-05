import { useEffect, useRef } from "react";
import { useSettings } from "@/hooks/useSettings";

interface Particle {
  x: number; y: number; vx: number; vy: number; size: number; opacity: number;
}

const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { settings } = useSettings();

  useEffect(() => {
    if (settings.backgroundStyle === "none") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const particles: Particle[] = [];
    const color = settings.particleColor;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const count = settings.backgroundStyle === "stars" ? 120 : 60;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * (settings.backgroundStyle === "matrix" ? 0.2 : 0.5),
        vy: settings.backgroundStyle === "matrix" ? Math.random() * 2 + 0.5 : (Math.random() - 0.5) * 0.5,
        size: settings.backgroundStyle === "stars" ? Math.random() * 2 + 0.3 : Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy;
        if (settings.backgroundStyle === "matrix") {
          if (p.y > canvas.height) { p.y = 0; p.x = Math.random() * canvas.width; }
        } else {
          if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
          if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, ${p.opacity})`;
        ctx.fill();

        if (settings.backgroundStyle === "particles") {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = p.x - particles[j].x;
            const dy = p.y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = `rgba(${color}, ${0.08 * (1 - dist / 150)})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }

        if (settings.backgroundStyle === "stars") {
          const twinkle = Math.sin(Date.now() * 0.003 + i) * 0.3 + 0.5;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${color}, ${twinkle * 0.1})`;
          ctx.fill();
        }
      });

      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, [settings.backgroundStyle, settings.particleColor]);

  if (settings.backgroundStyle === "none") return null;

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }} />;
};

export default ParticleBackground;
