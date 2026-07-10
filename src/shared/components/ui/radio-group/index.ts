import { cva } from 'class-variance-authority'

import type { VariantProps } from 'class-variance-authority'

export { default as RadioGroup } from './RadioGroup.vue'
export { default as RadioGroupItem } from './RadioGroupItem.vue'

/**
 * Outer hit area of a radio item. Sizes follow the Figma node 5328-2658:
 * L = 24px, M = 16px, S = 14px. The visual ring is rendered by an inset
 * inner element (`radioRingVariants`). The shape stays circular in every
 * state (default / checked / disabled).
 *
 * Note: `cursor-not-allowed` must stay visible on disabled, so we do NOT
 * add `disabled:pointer-events-none` here — the native `disabled` attribute
 * already blocks selection while keeping the not-allowed cursor.
 */
export const radioItemVariants = cva(
  'group relative inline-flex shrink-0 cursor-pointer rounded-full outline-none transition-colors focus-visible:ring-3 focus-visible:ring-hw-orange-main/50 disabled:cursor-not-allowed',
  {
    variants: {
      size: {
        l: 'size-6',
        m: 'size-4',
        s: 'size-3.5',
      },
    },
    defaultVariants: {
      size: 'l',
    },
  },
)

/**
 * Inset inner ring that paints the radio circle. Always circular.
 * - default: gray ring (`hw-gray-light`) over white fill
 * - checked: orange ring (`hw-orange-dark`) — the filled dot is drawn by
 *   `radioDotVariants` inside the indicator
 * - disabled (orthogonal): collapses every colour to `hw-gray-light`,
 *   regardless of checked state.
 *
 * Inset values mirror the Figma ellipse offsets:
 * L = 1.5px inset (21px ring inside 24px), M / S = 1px inset.
 */
export const radioRingVariants = cva(
  [
    'absolute box-border rounded-full border border-solid',
    'border-hw-gray-light bg-hw-white-main',
    // checked: orange ring (dot is drawn separately)
    'group-data-[state=checked]:border-hw-orange-dark',
    // disabled (orthogonal): 링만 옅은 회색(gray-lighter)으로 구분, 채움은
    // non-disabled 와 동일하게 흰색 유지. 선택 dot 색은 radioDotVariants 가 담당.
    'group-disabled:border-hw-gray-lighter group-disabled:bg-hw-white-main',
    'group-data-[state=checked]:group-disabled:border-hw-gray-lighter',
  ],
  {
    variants: {
      size: {
        l: 'inset-[1.5px]',
        m: 'inset-px',
        s: 'inset-px',
      },
    },
    defaultVariants: {
      size: 'l',
    },
  },
)

/**
 * Indicator wrapper, centered over the ring. Only mounted when checked.
 */
export const radioIndicatorVariants = cva(
  'absolute inset-0 flex items-center justify-center',
)

/**
 * Filled centre dot shown only when checked. Roughly half the ring size.
 * - checked: orange dot (`hw-orange-dark`)
 * - disabled+checked (orthogonal): dot snaps to gray.
 */
export const radioDotVariants = cva(
  'block rounded-full bg-hw-orange-dark group-disabled:bg-hw-gray-light',
  {
    variants: {
      size: {
        l: 'size-2.5',
        m: 'size-1.5',
        s: 'size-1.5',
      },
    },
    defaultVariants: {
      size: 'l',
    },
  },
)

export type RadioItemVariants = VariantProps<typeof radioItemVariants>
