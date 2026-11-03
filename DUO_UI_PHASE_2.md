# Duo UI phase 2 — recommendations only

The adaptive-foundation branch enables runtime layout measurements and supported
orientations. It does not rearrange Deduckly's screens. Review the items below in
the next design phase, with the current production interface as the reference.

## Use available space, not a device identity

- `useAdaptiveLayout()` provides live window dimensions, scale, font scale,
  safe-area insets, safe available dimensions, an expanded-width hint (768pt),
  and a compact-height hint (480pt). Its orientation describes the shape of that
  available space; it does not report a physical folding pose.
- Keep `useIsTablet()` only as the existing screens' legacy width hint. Its name
  does not mean a physical tablet has been detected.
- Measure each screen's content area with `onLayout` when choosing columns. A
  navigator may already have removed sidebar/tab-bar space. Do not subtract that
  space, or safe-area padding, twice.
- Keep navigator, screen, provider, and tracking-consumer identities stable. Never
  key these components by width, orientation, or an inferred folding state.

## Review before rearranging screens

1. **Navigation:** keep the existing bottom/left navigation behavior for now.
   Wide, short windows retain bottom tabs so all destinations fit. Navigation
   remains visible when the keyboard is open. Reassess whether an intentionally
   designed sidebar should be used in more expanded configurations; do not infer
   that a wide phone must be an iPad.
2. **Dashboard:** retain its existing measured viewport/grid and accessibility
   overflow fallback. Review both active consumers together and compact-height
   landscape before choosing a new two-column arrangement. Avoid creating a
   second tracking/status component with independent state.
3. **Activity and Settings:** review large gaps and long full-width rows on the
   inner display. Activity already has a maximum content width; Settings has its
   own width-dependent presentation. Audit fixed top padding against changing,
   asymmetric safe areas before changing spacing.
4. **Forms and detail screens:** audit the existing tablet breakpoint, maximum
   content widths, modal height, long Spanish labels, long addresses, keyboard
   overlap, and scroll fallback in compact landscape. Keep data entry state when
   switching to columns. Prefer one stable component tree with responsive styles.
5. **Reserved areas:** React Native window dimensions and safe-area insets are
   the foundation used here. They do not describe an internal hinge/camera region
   or identify a physical pose. If phase 2 intentionally places interactive
   content near an internal reserved region, first verify the installed public
   SDK and Expo/RN support. Add a minimal native bridge only if supported
   cross-platform APIs cannot express the necessary layout.
6. **Accessibility:** test large Dynamic Type, VoiceOver traversal, 44pt minimum
   targets, Reduce Motion, and both themes. Keep essential controls reachable
   through safe scrolling when the available height cannot contain the form.

## Validation for phase 2

- Test standard phones and iPads, plus the official Xcode Duo simulator in Closed,
  Partially Open, and Open poses, rotating in each direction.
- Preserve a selected tab, Activity filter, partially entered form, and scroll
  position through transitions. Include keyboard open/closed and app resume.
- Use synthetic/offline tracking tests first; then explicitly test manual Trip,
  Shift, and both consumers together in a non-production test account. Verify
  the same IDs/timers survive, with no new start/stop commands or duplicate saves.
- Representative dimensions supplement simulator testing; they are not proof of
  a physical device, pose, hinge position, or on-device GPS reliability.
- No screen redesign or promise of full Duo optimization is included in this
  foundation. Physical-device validation remains a release requirement.

## Official references

- [Apple: prepare for iPhone Duo](https://developer.apple.com/iphone-duo/prepare/)
- [Apple HIG: Layout](https://developer.apple.com/design/human-interface-guidelines/layout)
- [React Native: useWindowDimensions](https://reactnative.dev/docs/usewindowdimensions)
- [React Navigation: bottom tabs](https://reactnavigation.org/docs/bottom-tab-navigator/)
