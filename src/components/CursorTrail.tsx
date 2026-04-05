import { useEffect, useRef } from "react";
import { useSettings } from "@/hooks/useSettings";

const CursorTrail = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { settings } = useSettings();

  useEffect(() => {
    if (settings.trailStyle === "none") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const trail: { x: number; y: number; age: number }[] = [];
    const maxLength = 30;
    const color = settings.trailColor;
    const width = settings.trailWidth;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const onMouseMove = (e: MouseEvent) => {
      trail.push({ x: e.clientX, y: e.clientY, age: 0 });
      if (trail.length > maxLength) trail.shift();
    };
    window.addEventListener("mousemove", onMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = trail.length - 1; i >= 0; i--) {
        trail[i].age++;
        if (trail[i].age > maxLength) { trail.splice(i, 1); continue; }
        const alpha = 1 - trail[i].age / maxLength;
        const size = alpha * width;

        if (settings.trailStyle === "dots") {
          ctx.beginPath();
          ctx.arc(trail[i].x, trail[i].y, size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${color}, ${alpha * 0.6})`;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(trail[i].x, trail[i].y, size * 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${color}, ${alpha * 0.1})`;
          ctx.fill();
        } else if (settings.trailStyle === "line" && i > 0 && i < trail.length - 1) {
          const next = trail[i + 1] || trail[i];
          ctx.beginPath();
          ctx.moveTo(trail[i].x, trail[i].y);
          ctx.lineTo(next.x, next.y);
          ctx.strokeStyle = `rgba(${color}, ${alpha * 0.7})`;
          ctx.lineWidth = size * 0.8;
          ctx.lineCap = "round";
          ctx.stroke();
        } else if (settings.trailStyle === "glow") {
          ctx.beginPath();
          ctx.arc(trail[i].x, trail[i].y, size * 1.5, 0, Math.PI * 2);
          const grad = ctx.createRadialGradient(trail[i].x, trail[i].y, 0, trail[i].x, trail[i].y, size * 3);
          grad.addColorStop(0, `rgba(${color}, ${alpha * 0.5})`);
          grad.addColorStop(1, `rgba(${color}, 0)`);
          ctx.fillStyle = grad;
          ctx.fill();
        }
      }

      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [settings.trailStyle, settings.trailColor, settings.trailWidth]);

  if (settings.trailStyle === "none") return null;

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 9999 }} />;
};

export default CursorTrail;
