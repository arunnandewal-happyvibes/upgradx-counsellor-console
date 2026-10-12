"use client";

import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";

const RESUME_AFTER_MS = 6000;
const DRAG_THRESHOLD_PX = 5;

/**
 * A continuously drifting row of cards that the user can take over: hover to stop it, drag or
 * swipe to move it by hand, or use the arrow buttons. Auto-drift resumes a few seconds after the
 * last manual action. The list is repeated so it loops endlessly in both directions.
 *
 * Each child must render exactly one DOM element (a card).
 */
export function Marquee({
  children,
  speed = 45,
  reverse = false,
  className = "",
}: {
  children: ReactNode;
  /** Auto-drift speed in px/second. */
  speed?: number;
  reverse?: boolean;
  className?: string;
}) {
  const itemCount = Children.count(children);
  const scroller = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const period = useRef(0); // width of one full copy of the list, incl. trailing gap
  const pos = useRef(0);
  const lastWritten = useRef(0);
  const hovered = useRef(false);
  const dragging = useRef(false);
  const pausedUntil = useRef(0);
  const reducedMotion = useRef(false);
  const [copies, setCopies] = useState(3);

  const pauseForAWhile = useCallback(() => {
    pausedUntil.current = performance.now() + RESUME_AFTER_MS;
  }, []);

  // Keep the scroll position inside the middle copy so there is always content on both sides.
  const normalize = useCallback(() => {
    const el = scroller.current;
    const p = period.current;
    if (!el || !p || copies < 2) return;
    let sl = el.scrollLeft;
    if (sl >= 2 * p) sl -= p;
    else if (sl < p) sl += p;
    else return;
    el.scrollLeft = sl;
    pos.current = sl;
    lastWritten.current = el.scrollLeft;
  }, [copies]);

  const measure = useCallback(() => {
    const el = scroller.current;
    const t = track.current;
    if (!el || !t || itemCount === 0) return;
    const first = t.children[0] as HTMLElement | undefined;
    const second = t.children[itemCount] as HTMLElement | undefined;
    if (!first || !second) return;
    const p = second.offsetLeft - first.offsetLeft;
    const vw = el.clientWidth;
    const gap = p - (t.children[itemCount - 1] as HTMLElement).offsetLeft - (t.children[itemCount - 1] as HTMLElement).offsetWidth + first.offsetLeft;
    if (p <= vw + Math.max(gap, 0)) {
      // Not enough cards to loop — show a single static row.
      period.current = 0;
      setCopies(1);
      return;
    }
    period.current = p;
    // Enough copies that a full-width arrow jump from the middle copy never runs off the end.
    const needed = 3 + Math.ceil(Math.max(0, 1.9 * vw - p + Math.max(gap, 0)) / p);
    setCopies((c) => (c === needed ? c : needed));
    if (el.scrollLeft < p) {
      el.scrollLeft = p;
      pos.current = p;
      lastWritten.current = el.scrollLeft;
    }
  }, [itemCount]);

  useEffect(() => {
    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    measure();
    const ro = new ResizeObserver(measure);
    if (scroller.current) ro.observe(scroller.current);
    return () => ro.disconnect();
  }, [measure, copies, itemCount]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const el = scroller.current;
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      if (el && period.current) {
        // If something else moved the scroller (drag, wheel, swipe, arrows), follow it.
        if (Math.abs(el.scrollLeft - lastWritten.current) > 1.5) pos.current = el.scrollLeft;
        const idle =
          !hovered.current &&
          !dragging.current &&
          !reducedMotion.current &&
          now >= pausedUntil.current &&
          !document.hidden;
        if (idle) {
          pos.current += (reverse ? -1 : 1) * speed * dt;
          el.scrollLeft = pos.current;
          lastWritten.current = el.scrollLeft;
        }
        normalize();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reverse, speed, normalize]);

  const jump = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    pauseForAWhile();
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  // Mouse drag-to-scroll (touch already scrolls natively).
  const drag = useRef({ startX: 0, startScroll: 0, active: false, moved: false });
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    drag.current = { startX: e.clientX, startScroll: scroller.current?.scrollLeft ?? 0, active: true, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    const el = scroller.current;
    if (!d.active || !el) return;
    const dx = e.clientX - d.startX;
    if (!d.moved && Math.abs(dx) < DRAG_THRESHOLD_PX) return;
    if (!d.moved) {
      d.moved = true;
      dragging.current = true;
      el.setPointerCapture(e.pointerId);
    }
    el.scrollLeft = d.startScroll - dx;
    pauseForAWhile();
  };
  const endDrag = () => {
    drag.current.active = false;
    if (dragging.current) {
      dragging.current = false;
      pauseForAWhile();
    }
  };
  // A drag that ends over a link/card shouldn't also count as a click on it.
  const onClickCapture = (e: React.MouseEvent) => {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = false;
    }
  };

  const arrow =
    "absolute top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-outline-variant bg-white text-primary shadow-md transition-colors hover:bg-primary hover:text-on-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary";

  return (
    <div
      className="relative"
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") hovered.current = true;
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") hovered.current = false;
      }}
    >
      {copies > 1 && (
        <>
          <button type="button" aria-label="Scroll left" onClick={() => jump(-1)} className={`${arrow} left-1`}>
            <Icon name="chevron_left" size={26} />
          </button>
          <button type="button" aria-label="Scroll right" onClick={() => jump(1)} className={`${arrow} right-1`}>
            <Icon name="chevron_right" size={26} />
          </button>
        </>
      )}
      <div
        ref={scroller}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
        onWheel={pauseForAWhile}
        onTouchStart={pauseForAWhile}
        onTouchMove={pauseForAWhile}
        className={`w-full overflow-x-auto overflow-y-hidden ${copies > 1 ? "cursor-grab active:cursor-grabbing" : ""} select-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
        style={{ maskImage: "linear-gradient(90deg, transparent, black 4%, black 96%, transparent)" }}
      >
        <div ref={track} className={`flex w-max ${className}`}>
          {Array.from({ length: copies }, (_, i) => (
            <Copy key={i}>{children}</Copy>
          ))}
        </div>
      </div>
    </div>
  );
}

// Renders the cards as direct flex children (no wrapper) so spacing/gap stay uniform across copies.
function Copy({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
