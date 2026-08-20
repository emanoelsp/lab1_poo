"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface Props {
  definition: string;
  height?: number;
}

export function MermaidDiagram({ definition, height = 520 }: Props) {
  const [svgContent, setSvgContent] = useState("");
  const [loading, setLoading] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const scaleRef = useRef(0.75);
  const posRef = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    let cancelled = false;
    async function render() {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "default",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        });
        const id = `mermaid-${Date.now()}`;
        const { svg } = await mermaid.render(id, definition);
        if (!cancelled) {
          setSvgContent(svg);
          setLoading(false);
        }
      } catch (e) {
        console.error("[MermaidDiagram] render error:", e);
        if (!cancelled) setLoading(false);
      }
    }
    render();
    return () => {
      cancelled = true;
    };
  }, [definition]);

  // Apply transform directly to DOM — avoids React re-render on every mouse move
  const applyTransform = useCallback(() => {
    if (!innerRef.current) return;
    innerRef.current.style.transform = `translate(calc(-50% + ${posRef.current.x}px), calc(-50% + ${posRef.current.y}px)) scale(${scaleRef.current})`;
  }, []);

  // Set initial transform after SVG is injected
  useEffect(() => {
    if (svgContent) applyTransform();
  }, [svgContent, applyTransform]);

  // Wheel zoom — must be non-passive to allow preventDefault
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    function onWheel(e: WheelEvent) {
      e.preventDefault();
      scaleRef.current = Math.max(0.2, Math.min(5, scaleRef.current - e.deltaY * 0.0012));
      applyTransform();
    }
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [applyTransform]);

  function onMouseDown(e: React.MouseEvent) {
    isDragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!isDragging.current) return;
    posRef.current.x += e.clientX - lastPos.current.x;
    posRef.current.y += e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    applyTransform();
  }

  function stopDrag() {
    isDragging.current = false;
  }

  function zoomIn() {
    scaleRef.current = Math.min(5, scaleRef.current + 0.2);
    applyTransform();
  }

  function zoomOut() {
    scaleRef.current = Math.max(0.2, scaleRef.current - 0.2);
    applyTransform();
  }

  function reset() {
    scaleRef.current = 0.75;
    posRef.current = { x: 0, y: 0 };
    applyTransform();
  }

  return (
    <div
      className="relative bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden"
      style={{ height }}
    >
      {/* Controls */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
        <button
          onClick={zoomIn}
          className="w-9 h-9 bg-white border border-gray-300 rounded-lg text-gray-700 font-bold hover:bg-gray-50 shadow-sm flex items-center justify-center text-lg"
          title="Zoom in"
        >
          +
        </button>
        <button
          onClick={zoomOut}
          className="w-9 h-9 bg-white border border-gray-300 rounded-lg text-gray-700 font-bold hover:bg-gray-50 shadow-sm flex items-center justify-center text-lg"
          title="Zoom out"
        >
          −
        </button>
        <button
          onClick={reset}
          className="px-3 h-9 bg-white border border-gray-300 rounded-lg text-xs text-gray-600 hover:bg-gray-50 shadow-sm"
        >
          Reset
        </button>
      </div>

      <p className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 text-xs text-gray-400 pointer-events-none select-none whitespace-nowrap">
        Scroll para zoom · Arraste para navegar
      </p>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing select-none"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
      >
        <div
          ref={innerRef}
          className="absolute top-1/2 left-1/2"
          style={{ transformOrigin: "center center" }}
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      </div>
    </div>
  );
}
