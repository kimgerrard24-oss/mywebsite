// frontend/src/components/chat/ChatImagePreviewModal.tsx
import { useEffect, useRef, useState } from "react";
import {
  TransformWrapper,
  TransformComponent,
  ReactZoomPanPinchRef,
} from "react-zoom-pan-pinch";

type Props = {
  /**
   * Public image URL (CDN / signed URL)
   */
  src: string;

  /**
   * Close handler (single source of truth)
   */
  onClose: () => void;
};

export default function ChatImagePreviewModal({
  src,
  onClose,
}: Props) {
  /**
   * ==============================
   * Refs / State
   * ==============================
   */
  const transformRef = useRef<ReactZoomPanPinchRef | null>(
    null,
  );

  const startYRef = useRef<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);

  /**
   * ==============================
   * UX / Accessibility Guards
   * ==============================
   */

  // 🔒 Disable background scroll while modal open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // ⌨️ Close on ESC
  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeydown);
    return () => {
      window.removeEventListener(
        "keydown",
        handleKeydown,
      );
    };
  }, [onClose]);

  /**
   * ==============================
   * Swipe Down to Close (IG-like)
   * ==============================
   */
  function handleTouchStart(
    e: React.TouchEvent<HTMLDivElement>,
  ) {
    if (e.touches.length !== 1) return;
    startYRef.current = e.touches[0].clientY;
  }

  function handleTouchMove(
    e: React.TouchEvent<HTMLDivElement>,
  ) {
    if (startYRef.current == null) return;

    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startYRef.current;

    const scale =
      transformRef.current?.state.scale ?? 1;

    // ❗ Allow swipe-down only when NOT zoomed
    if (scale > 1) return;

    if (deltaY > 0) {
      setDragOffset(deltaY);
    }
  }

  function handleTouchEnd() {
    const threshold = 120;

    if (dragOffset > threshold) {
      onClose();
    }

    // reset
    setDragOffset(0);
    startYRef.current = null;
  }

  /**
   * ==============================
   * Render
   * ==============================
   */
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="
        fixed inset-0 z-[1000]
        flex items-center justify-center
        bg-black/90
        backdrop-blur-sm
        overscroll-contain
        transition-opacity
      "
      style={{
        opacity:
          dragOffset > 0
            ? Math.max(
                0.6,
                1 - dragOffset / 400,
              )
            : 1,
      }}
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <TransformWrapper
        ref={transformRef}
        initialScale={1}
        minScale={1}
        maxScale={4}
        centerOnInit
        doubleClick={{
          mode: "toggle", // 🔑 double-tap zoom in ↔ reset
        }}
        pinch={{
          disabled: false,
        }}
        panning={{
          velocityDisabled: true,
        }}
      >
        <TransformComponent
          wrapperStyle={{
            maxWidth: "100vw",
            maxHeight: "100vh",
            transform: `translateY(${dragOffset}px)`,
            transition:
              dragOffset === 0
                ? "transform 0.25s ease"
                : undefined,
          }}
          contentStyle={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={src}
            alt="Image preview"
            loading="eager"
            decoding="async"
            referrerPolicy="no-referrer"
            draggable={false}
            className="
              max-h-[90vh]
              max-w-[90vw]
              object-contain
              select-none
              touch-none
            "
            onClick={(e) => e.stopPropagation()}
          />
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}
