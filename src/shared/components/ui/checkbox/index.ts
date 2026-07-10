import { cva } from 'class-variance-authority'

import type { VariantProps } from 'class-variance-authority'

export { default as Checkbox } from './Checkbox.vue'

/**
 * Outer frame of the checkbox. Sizes follow the Figma node 5328-2618:
 * L = 24px, M = 16px, S = 14px. The visual box is rendered by an inset
 * inner element (`checkboxBoxVariants`). The shape stays circular in every
 * state (unchecked / checked / disabled).
 */
export const checkboxVariants = cva(
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
 * Inset inner box that paints the actual colour. Always circular.
 * - unchecked: circular border (`rounded-full`)
 * - checked: filled circle (`hw-orange-dark`)
 * - disabled (orthogonal): collapses every colour to `hw-gray-light`,
 *   regardless of checked state.
 */
export const checkboxBoxVariants = cva(
  [
    'absolute inset-px box-border border border-solid',
    // circular outline in all states
    'rounded-full border-hw-gray-light bg-hw-white-main',
    // checked: orange fill (stays circular)
    'group-data-[state=checked]:border-transparent group-data-[state=checked]:bg-hw-orange-dark',
    // disabled is orthogonal to checked/unchecked -> everything snaps to gray
    'group-disabled:border-hw-gray-light group-disabled:bg-hw-white-main',
    'group-data-[state=checked]:group-disabled:border-transparent group-data-[state=checked]:group-disabled:bg-hw-gray-light',
  ],
  {
    variants: {
      size: {
        l: 'inset-[1.5px]',
        m: '',
        s: '',
      },
    },
    defaultVariants: {
      size: 'l',
    },
  },
)

/**
 * White check glyph shown only when checked. When disabled+checked the
 * glyph stays white over the gray fill, matching the Figma disable styling.
 */
export const checkboxIndicatorVariants = cva(
  'absolute inset-0 flex items-center justify-center text-hw-white-main',
  {
    variants: {
      size: {
        l: '[&_svg]:size-[18px]',
        m: '[&_svg]:size-3',
        s: '[&_svg]:size-2.5',
      },
    },
    defaultVariants: {
      size: 'l',
    },
  },
)

export type CheckboxVariants = VariantProps<typeof checkboxVariants>
