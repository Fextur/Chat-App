import { Message } from "@/types";

interface EstimateSizeOptions {
  messages: Message[];
  currentUserEmail: string;
  imageDimensionsRef: React.RefObject<
    Map<string, { width: number; height: number }>
  >;
  parentRef: React.RefObject<HTMLDivElement | null>;
  shouldShowDateHeader: (index: number) => boolean;
}

export const createSizeEstimator = ({
  messages,
  currentUserEmail,
  imageDimensionsRef,
  parentRef,
  shouldShowDateHeader,
}: EstimateSizeOptions) => {
  return (index: number): number => {
    const message = messages[index];
    if (!message) return 100;

    const isCurrentUser = message.user.email === currentUserEmail;
    let estimatedHeight = 0;

    if (shouldShowDateHeader(index)) {
      estimatedHeight += 58;
    }

    estimatedHeight += 82;

    if (isCurrentUser) {
      estimatedHeight -= 20;
    }

    if (message.media) {
      const dimensions = imageDimensionsRef.current.get(message.media);
      if (dimensions) {
        const containerWidth = parentRef.current?.clientWidth || 500;
        const isMobile = containerWidth < 600;
        const maxWidth = containerWidth * (isMobile ? 0.85 : 0.7);
        const maxHeight = 300;

        const aspectRatio = dimensions.width / dimensions.height;

        let renderedWidth = dimensions.width;
        let renderedHeight = dimensions.height;

        if (renderedWidth > maxWidth) {
          renderedWidth = maxWidth;
          renderedHeight = maxWidth / aspectRatio;
        }

        if (renderedHeight > maxHeight) {
          renderedHeight = maxHeight;
          renderedWidth = maxHeight * aspectRatio;
        }

        estimatedHeight += renderedHeight;
      } else {
        estimatedHeight += 150;
      }
    }

    if (message.content) {
      const containerWidth = parentRef.current?.clientWidth || 500;
      const isMobile = containerWidth < 600;
      const maxBubbleWidth = containerWidth * (isMobile ? 0.85 : 0.7);
      const horizontalPadding = isMobile ? 12 + 14 : 16 + 14;
      const maxTextWidth = maxBubbleWidth - horizontalPadding * 2;
      const avgCharWidth = 9;
      const charsPerLine = Math.max(1, Math.floor(maxTextWidth / avgCharWidth));

      const contentLines = message.content.split("\n");
      let totalLines = 0;

      contentLines.forEach((lineSegment) => {
        if (lineSegment.length > 0) {
          const wrappedLines = Math.ceil(lineSegment.length / charsPerLine);
          totalLines += wrappedLines;
        } else {
          totalLines += 1;
        }
      });

      totalLines = Math.max(1, totalLines);
      const lineHeight = 23;
      estimatedHeight += totalLines * lineHeight;

      if (message.media) {
        estimatedHeight += 10;
      }
    }

    return estimatedHeight;
  };
};
