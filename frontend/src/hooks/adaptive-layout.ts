// Layout categories describe available space, never a device or folding state.
export const EXPANDED_WIDTH = 768;
export const COMPACT_HEIGHT = 480;
const SIDEBAR_MIN_WIDTH = 1100;

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
  return layout.availableWidth >= SIDEBAR_MIN_WIDTH && layout.availableHeight >= Math.max(COMPACT_HEIGHT, 50 + 4 * (sidebarRow + 10) + 16)
    ? 'left' as const : 'bottom' as const;
}

export function sidebarTabItemHeight(fontScale: number) {
  return Math.max(56, Math.ceil(14 * fontScale) + 24);
}

export function bottomTabMetrics(layout: ReturnType<typeof adaptiveLayout>, fontScale: number) {
  const besideIcon = layout.orientation === 'landscape'
    && layout.availableWidth >= 480 * Math.max(1, fontScale);
  const compact = layout.hasCompactHeight || besideIcon;
  const iconSize = compact ? 22 : 26;
  const labelSize = compact ? 12 : 11;
  const labelHeight = Math.ceil(labelSize * fontScale * 1.25);
  const rowHeight = Math.max(44, (besideIcon
    ? Math.max(iconSize, labelHeight)
    : iconSize + labelHeight + 2) + 10);
  const paddingTop = compact ? 0 : 4;
  const paddingBottom = Math.max(compact ? 0 : 8, layout.insets.bottom);
  return {
    iconSize,
    labelSize,
    rowHeight,
    labelPosition: besideIcon ? 'beside-icon' as const : 'below-icon' as const,
    style: {
      height: rowHeight + paddingTop + paddingBottom + 1,
      paddingTop,
      paddingBottom,
      paddingHorizontal: 0,
      paddingLeft: layout.insets.left + 4,
      paddingRight: layout.insets.right + 4,
    },
  };
}

// Screen-local measurements already exclude navigator and safe-area padding.
export function dashboardUsesColumns(width: number, height: number, fontScale: number) {
  return width >= 520 && width > height && height >= 220 && fontScale <= 1.3;
}

// A spread is a wide-window layout, not a physical hinge-state detector.
export function usesBookSpread(width: number, height: number, fontScale: number) {
  return width >= 740 && height >= 460 && width > height && fontScale <= 1.3;
}
