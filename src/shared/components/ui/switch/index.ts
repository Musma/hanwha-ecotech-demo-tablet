import { cva } from 'class-variance-authority'

import type { VariantProps } from 'class-variance-authority'

export { default as Switch } from './Switch.vue'

/**
 * Pill-shaped switch track. Sizes follow the Figma node 5338-13520:
 * L = 48x28, M = 40x24, S = 34x18 (px). The track is a horizontal flex row
 * that vertically centres the thumb; the thumb slides left -> right via a
 * `translate-x` on `data-[state=checked]`.
 *
 * Colours (Figma -> hw-* tokens):
 * - off track:      #d0d5dd -> snapped to `hw-gray-lighter` (nearest, Δ13.9)
 * - checked track:  #f37321 -> `hw-orange-main` (EXACT)
 * - disabled track: #f4f6f9 -> `hw-white-lighter` (EXACT)
 *
 * disabled is orthogonal to checked/unchecked: when disabled the track snaps
 * to `hw-white-lighter` regardless of checked state, matching the Figma
 * "Disable" sample (a single muted track, not a separate on/off colour).
 *
 * Note: `cursor-not-allowed` must stay visible on disabled, so we do NOT add
 * `disabled:pointer-events-none` here — the native `disabled` attribute on
 * SwitchRoot already blocks toggling while keeping the not-allowed cursor.
 */
export const switchVariants = cva(
  [
    'group relative inline-flex shrink-0 items-center rounded-full outline-none transition-colors',
    'cursor-pointer focus-visible:ring-3 focus-visible:ring-hw-orange-main/50',
    'disabled:cursor-not-allowed',
    // off / checked track colour
    'bg-hw-gray-lighter data-[state=checked]:bg-hw-orange-main',
    // disabled (orthogonal): muted track regardless of checked state
    'disabled:bg-hw-white-lighter data-[state=checked]:disabled:bg-hw-white-lighter',
  ],
  {
    variants: {
      size: {
        l: 'h-7 w-12 px-0.5',
        m: 'h-6 w-10 px-0.5',
        s: 'h-[18px] w-[34px] px-0.5',
      },
    },
    defaultVariants: {
      size: 'l',
    },
  },
)

/**
 * Circular thumb. White in every enabled state; snaps to `hw-gray-lighter`
 * when disabled (matches the Figma disabled thumb #d0d5dd). Rests on the left
 * and translates to the right when checked. Translate distance mirrors the
 * Figma offsets: L = 19px, M = 16px, S = 16px.
 */
export const switchThumbVariants = cva(
  [
    'pointer-events-none block rounded-full shadow-sm transition-transform',
    'bg-hw-white-main group-disabled:bg-hw-gray-lighter',
  ],
  {
    variants: {
      size: {
        l: 'size-6 data-[state=checked]:translate-x-[19px]',
        m: 'size-5 data-[state=checked]:translate-x-4',
        s: 'size-3.5 data-[state=checked]:translate-x-4',
      },
    },
    defaultVariants: {
      size: 'l',
    },
  },
)

export type SwitchVariants = VariantProps<typeof switchVariants>
