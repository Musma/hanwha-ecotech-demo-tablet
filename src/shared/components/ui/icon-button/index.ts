import { cva } from 'class-variance-authority'

import type { VariantProps } from 'class-variance-authority'

export { default as IconButton } from './IconButton.vue'

export const iconButtonVariants = cva(
  'focus-visible:ring-hw-orange-main/50 inline-flex shrink-0 cursor-pointer items-center justify-center rounded-[4px] transition-all outline-none select-none focus-visible:ring-3 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        fill: 'bg-hw-orange-dark text-hw-white-main hover:opacity-90 active:bg-hw-orange-darker active:shadow-[inset_-1px_2px_2px_0px_rgba(0,0,0,0.25)] disabled:bg-hw-white-lighter disabled:text-hw-gray-lighter disabled:opacity-100 disabled:shadow-none',
        outline:
          'border border-hw-orange-dark bg-hw-white-main text-hw-orange-dark hover:bg-hw-orange-lighter/40 active:bg-hw-white-main active:shadow-[inset_-1px_2px_2px_0px_rgba(0,0,0,0.25)] disabled:border-transparent disabled:bg-hw-white-lighter disabled:text-hw-gray-lighter disabled:shadow-none',
      },
      size: {
        l: 'size-8 p-2 [&_svg:not([class*=size-])]:size-4',
        m: 'size-7 p-1.5 [&_svg:not([class*=size-])]:size-4',
        s: 'size-6 p-[5px] [&_svg:not([class*=size-])]:size-3.5',
      },
    },
    defaultVariants: {
      variant: 'fill',
      size: 'l',
    },
  },
)

export type IconButtonVariants = VariantProps<typeof iconButtonVariants>
