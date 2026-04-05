import { useEffect, useRef } from "react";

const CursorTrail = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const trail: { x: number; y: number; age: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMouseMove = (e: MouseEvent) => {
      trail.push({ x: e.clientX, y: e.clientY, age: 0 });
      if (trail.length > 30) trail.shift();
    };
    window.addEventListener("mousemove", onMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = trail.length - 1; i >= 0; i--) {
        trail[i].age++;
        if (trail[i].age > 30) {
          trail.splice(i, 1);
          continue;
        }
        const alpha = 1 - trail[i].age / 30;
        const size = (1 - trail[i].age / 30) * 6;
        ctx.beginPath();
        ctx.arc(trail[i].x, trail[i].y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 136, ${alpha * 0.6})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(trail[i].x, trail[i].y, size * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 136, ${alpha * 0.1})`;
        ctx.fill();
      }

      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9999 }}
    />
  );
};

export default CursorTrail;
