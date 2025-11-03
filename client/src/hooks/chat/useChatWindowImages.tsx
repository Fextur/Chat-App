import { useRef, useEffect } from "react";
import { Virtualizer } from "@tanstack/react-virtual";
import { Message } from "@/types";

interface UseChatWindowImagesOptions {
  messages: Message[];
  virtualizer: Virtualizer<HTMLDivElement, Element>;
  itemRefs: React.RefObject<Map<number, HTMLDivElement>>;
  parentRef: React.RefObject<HTMLDivElement | null>;
  imageDimensionsRef: React.RefObject<
    Map<string, { width: number; height: number }>
  >;
}

export const useChatWindowImages = ({
  messages,
  virtualizer,
  itemRefs,
  parentRef,
  imageDimensionsRef,
}: UseChatWindowImagesOptions) => {
  const handledImagesRef = useRef<WeakSet<HTMLImageElement>>(new WeakSet());

  useEffect(() => {
    messages.forEach((message) => {
      if (message.media && !imageDimensionsRef.current.has(message.media)) {
        const img = new Image();
        img.onload = () => {
          imageDimensionsRef.current.set(message.media!, {
            width: img.naturalWidth,
            height: img.naturalHeight,
          });
          virtualizer.measure();
        };
        img.onerror = () => {
          imageDimensionsRef.current.set(message.media!, {
            width: 800,
            height: 600,
          });
          virtualizer.measure();
        };
        img.src = message.media;
      }
    });
  }, [messages, virtualizer]);

  useEffect(() => {
    const handleImageLoad = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          virtualizer.getVirtualItems().forEach((virtualItem) => {
            const element = itemRefs.current.get(virtualItem.index);
            if (element) {
              virtualizer.measureElement(element);
            }
          });
          virtualizer.measure();
        });
      });
    };

    const handleCustomImageLoad = (e: Event) => {
      const target = e.target as HTMLElement;
      const index = target.getAttribute("data-index");
      if (index !== null) {
        const element = itemRefs.current.get(parseInt(index, 10));
        if (element) {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              virtualizer.measureElement(element);
              virtualizer.measure();
            });
          });
        }
      }
    };

    const setupImageListeners = () => {
      const images = parentRef.current?.querySelectorAll("img");
      images?.forEach((img) => {
        if (handledImagesRef.current.has(img)) {
          return;
        }
        handledImagesRef.current.add(img);

        if (img.complete && img.naturalHeight !== 0) {
          setTimeout(handleImageLoad, 0);
        } else {
          img.addEventListener("load", handleImageLoad, { once: true });
          img.addEventListener("error", handleImageLoad, { once: true });
        }
      });
    };

    if (parentRef.current) {
      parentRef.current.addEventListener("imageLoaded", handleCustomImageLoad);
    }

    setupImageListeners();

    let timeoutId: NodeJS.Timeout | null = null;
    const observer = new MutationObserver(() => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(setupImageListeners, 50);
    });

    if (parentRef.current) {
      observer.observe(parentRef.current, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      observer.disconnect();
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (parentRef.current) {
        parentRef.current.removeEventListener(
          "imageLoaded",
          handleCustomImageLoad
        );
      }
    };
  }, [virtualizer, messages, parentRef, itemRefs]);
};
