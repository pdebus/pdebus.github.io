import { useEffect, useRef } from 'react';

/**
 * Quiet background animation for the profile header: a small graph of agents and tools.
 * Signals travel along the edges; now and then one node turns amber and its links are cut,
 * like an agent being quarantined. Colours come from the --graph / --graph-alert tokens.
 */
export default function AgentGraph() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const root = document.documentElement;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    type Node = { x: number; y: number; bx: number; by: number; ph: number };
    const N = 18;
    let nodes: Node[] = [];
    let edges: [number, number][] = [];
    let pulses: { e: [number, number]; p: number }[] = [];
    let W = 0, H = 0, alert: number | null = null, alertT = 0, raf = 0;

    let seed = 11;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    const token = (n: string) => getComputedStyle(root).getPropertyValue(n).trim();

    const layout = () => {
      const r = cv.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed = 11;
      // Keep nodes to the right third on wide screens so the text stays clean.
      nodes = Array.from({ length: N }, () => {
        const x = (W < 800 ? 0.05 + rnd() * 0.9 : 0.66 + rnd() * 0.33) * W;
        const y = (0.06 + rnd() * 0.88) * H;
        return { x, y, bx: x, by: y, ph: rnd() * 6.28 };
      });
      edges = [];
      nodes.forEach((a, i) => {
        nodes
          .map((b, j) => ({ j, d: Math.hypot(a.bx - b.bx, a.by - b.by) }))
          .filter((o) => o.j !== i)
          .sort((p, q) => p.d - q.d)
          .slice(0, 2)
          .forEach((o) => { if (!edges.some((e) => e[0] === o.j && e[1] === i)) edges.push([i, o.j]); });
      });
    };

    const draw = (t: number) => {
      const g = token('--graph'), ga = token('--graph-alert');
      const base = W < 800 ? 0.08 : 0.16;
      ctx.clearRect(0, 0, W, H);
      if (!reduce) nodes.forEach((n) => { n.x = n.bx + Math.sin(t / 4500 + n.ph) * 8; n.y = n.by + Math.cos(t / 5200 + n.ph) * 6; });
      edges.forEach(([i, j]) => {
        const a = nodes[i], b = nodes[j], cut = i === alert || j === alert;
        ctx.strokeStyle = cut ? `rgba(${ga},.45)` : `rgba(${g},${base})`;
        ctx.setLineDash(cut ? [3, 5] : []);
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      });
      ctx.setLineDash([]);
      pulses = pulses.filter((p) => {
        p.p += 0.01;
        if (p.p >= 1) return false;
        const a = nodes[p.e[0]], b = nodes[p.e[1]];
        ctx.fillStyle = `rgba(${g},${base * 3.5})`;
        ctx.beginPath(); ctx.arc(a.x + (b.x - a.x) * p.p, a.y + (b.y - a.y) * p.p, 1.8, 0, 6.28); ctx.fill();
        return true;
      });
      nodes.forEach((n, i) => {
        ctx.fillStyle = i === alert ? `rgba(${ga},.9)` : `rgba(${g},${base * 2.2})`;
        ctx.beginPath(); ctx.arc(n.x, n.y, i === alert ? 4 : 2.8, 0, 6.28); ctx.fill();
      });
    };

    const tick = (t: number) => {
      if (Math.random() < 0.035) {
        const e = edges[Math.floor(Math.random() * edges.length)];
        if (e && e[0] !== alert && e[1] !== alert) pulses.push({ e, p: 0 });
      }
      if (alert === null && t - alertT > 7000) { alert = Math.floor(Math.random() * N); alertT = t; }
      else if (alert !== null && t - alertT > 2400) { alert = null; alertT = t; }
      draw(t);
      raf = requestAnimationFrame(tick);
    };

    layout();
    const onResize = () => { layout(); if (reduce) draw(0); };
    window.addEventListener('resize', onResize);
    let observer: MutationObserver | undefined;
    if (reduce) {
      draw(0);
      observer = new MutationObserver(() => draw(0));
      observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    } else {
      raf = requestAnimationFrame(tick);
    }
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); observer?.disconnect(); };
  }, []);

  return <canvas ref={ref} aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />;
}
