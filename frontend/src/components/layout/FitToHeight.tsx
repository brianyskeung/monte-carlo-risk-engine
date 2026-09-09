import { useLayoutEffect, useRef, type ReactNode } from "react";

interface FitToHeightProps {
  children: ReactNode;
}

export default function FitToHeight({ children }: FitToHeightProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const recompute = () => {
      inner.style.zoom = "1";
      const naturalHeight = inner.scrollHeight;
      const availableHeight = outer.clientHeight;
      const scale =
        naturalHeight > availableHeight && naturalHeight > 0
          ? availableHeight / naturalHeight
          : 1;
      inner.style.zoom = String(scale);
    };

    recompute();

    const resizeObserver = new ResizeObserver(recompute);
    resizeObserver.observe(outer);

    const mutationObserver = new MutationObserver(recompute);
    mutationObserver.observe(inner, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    window.addEventListener("resize", recompute);

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("resize", recompute);
    };
  }, []);

  return (
    <div ref={outerRef} className="h-full w-full overflow-hidden">
      <div ref={innerRef}>{children}</div>
    </div>
  );
}
