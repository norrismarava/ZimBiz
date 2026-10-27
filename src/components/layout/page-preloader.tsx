"use client";

import { useEffect, useRef, useState } from "react";

const MIN_SHOW = 600;
const MAX_WAIT = 6000;
const LINK_DIST = 160;

type Dot = { x: number; y: number; vx: number; vy: number; r: number };

export function PagePreloader() {
  const [done, setDone] = useState(false);
  const [hidden, setHidden] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const startedAt = useRef(Date.now());

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    let raf = 0;
    let dead = false;
    let dots: Dot[] = [];
    let w = 0;
    let h = 0;

    function size() {
      if (!canvas || !ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.max(14, Math.min(70, Math.round((w * h) / 22000)));
      dots = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.2 + 0.8,
      }));
    }

    function draw() {
      if (dead || !ctx) return;
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < dots.length; i++) {
        const a = dots[i];
        if (!reduce) {
          a.x += a.vx;
          a.y += a.vy;
          if (a.x < 0 || a.x > w) a.vx *= -1;
          if (a.y < 0 || a.y > h) a.vy *= -1;
        }
        for (let j = i + 1; j < dots.length; j++) {
          const b = dots[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK_DIST) {
            ctx.strokeStyle = `rgba(255,255,255,${(0.16 * (1 - d / LINK_DIST)).toFixed(3)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        ctx.fillStyle = "rgba(255,255,255,0.35)";
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, 6.2832);
        ctx.fill();
      }
      if (!reduce) raf = requestAnimationFrame(draw);
    }

    size();
    draw();
    window.addEventListener("resize", size);

    document.documentElement.classList.add("is-loading");
    let fired = false;
    const finish = () => {
      if (fired) return;
      fired = true;
      const wait = Math.max(0, MIN_SHOW - (Date.now() - startedAt.current));
      window.setTimeout(() => {
        setDone(true);
        document.documentElement.classList.remove("is-loading");
      }, wait);
    };
    if (document.readyState === "complete") finish();
    else window.addEventListener("load", finish);
    const safety = window.setTimeout(finish, MAX_WAIT);

    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", size);
      window.removeEventListener("load", finish);
      window.clearTimeout(safety);
      document.documentElement.classList.remove("is-loading");
    };
  }, []);

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      setProgress((p) => {
        const target = done ? 100 : 90;
        const next = p + (target - p) * 0.06;
        return done ? Math.min(100, next + 1.5) : next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [done]);

  if (hidden) return null;

  return (
    <div
      id="page-preloader"
      className={done ? "is-done" : ""}
      aria-hidden="true"
      onTransitionEnd={() => setHidden(true)}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.svg"
          alt=""
          className="zb-reveal h-20 w-20 rounded-2xl shadow-2xl sm:h-24 sm:w-24"
        />
        <div className="zb-reveal zb-delay-1 text-center">
          <p className="text-3xl font-black italic tracking-tight text-white sm:text-4xl">
            Zim<span className="text-[#34D399]">Biz</span>
          </p>
          <p className="mt-1 text-[11px] font-bold tracking-[0.3em] text-[#D4A017] sm:text-xs">
            DISCOVER · VERIFY · CONNECT
          </p>
        </div>
        <div className="zb-reveal zb-delay-2 w-48 sm:w-56">
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-[#D4A017] transition-[width] duration-150 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-center text-[10px] font-medium tracking-widest text-white/50">
            {Math.round(progress)}%
          </p>
        </div>
      </div>
    </div>
  );
}
