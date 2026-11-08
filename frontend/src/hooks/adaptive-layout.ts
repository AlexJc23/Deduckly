// Layout categories describe available space, never a device or folding state.
export const EXPANDED_WIDTH = 768;
export const COMPACT_HEIGHT = 480;

export type LayoutInsets = { top: number; right: number; bottom: number; left: number };
const noInsets: LayoutInsets = { top: 0, right: 0, bottom: 0, left: 0 };

export function adaptiveLayout(width: number, height: number, insets: LayoutInsets = noInsets) {
  const availableWidth = Math.max(0, width - insets.left - insets.right);
  const availableHeight = Math.max(0, height - insets.top - insets.bottom);
  return {
    width, height, insets, availableWidth, availableHeight,
    isExpanded: availableWidth >= EXPANDED_WIDTH,
    hasCompactHeight: availableHeight < COMPACT_HEIGHT,
    orientation: availableWidth > availableHeight ? 'landscape' as const : 'portrait' as const,
  };
}

// Four existing sidebar rows (56pt + 10pt margins), header and footer clearance.
// A short, wide window uses bottom tabs so all four destinations stay reachable.
export function tabBarPosition(layout: ReturnType<typeof adaptiveLayout>, fontScale = 1) {
  const sidebarRow = sidebarTabItemHeight(fontScale);
  return layout.isExpanded && layout.availableHeight >= Math.max(COMPACT_HEIGHT, 50 + 4 * (sidebarRow + 10) + 16)
    ? 'left' as const : 'bottom' as const;
}

export function sidebarTabItemHeight(fontScale: number) {
  return Math.max(56, Math.ceil(14 * fontScale) + 24);
}

export function bottomTabMetrics(bottomInset: number, fontScale: number) {
  const paddingTop = 8;
  const paddingBottom = Math.max(10, bottomInset);
  const minimumRowHeight = Math.max(44, 28 + Math.ceil(14 * fontScale));
  return { height: Math.max(84, paddingTop + minimumRowHeight + paddingBottom), paddingTop, paddingBottom };
}

// Screen-local measurements already exclude navigator and safe-area padding.
export function dashboardUsesColumns(width: number, height: number, fontScale: number) {
  return width >= 620 && height >= 280 && fontScale <= 1.3;
}

export function contentNeedsScrolling(contentHeight: number, viewportHeight: number) {
  return contentHeight > viewportHeight + 1;
}
