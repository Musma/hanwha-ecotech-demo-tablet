import { cva } from 'class-variance-authority'

import type { VariantProps } from 'class-variance-authority'

export { default as PrimaryButton } from './PrimaryButton.vue'

export const primaryButtonVariants = cva(
  'focus-visible:ring-hw-orange-main/50 inline-flex w-full shrink-0 cursor-pointer items-center justify-center rounded-sm whitespace-nowrap transition-all outline-none select-none focus-visible:ring-3 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        fill: 'bg-hw-orange-main text-hw-white-main hover:opacity-90 active:bg-hw-orange-darker active:shadow-[inset_-1px_2px_2px_0px_rgba(0,0,0,0.25)] disabled:bg-hw-white-lighter disabled:text-hw-gray-lighter disabled:opacity-100 disabled:shadow-none',
        outline:
          'border border-hw-orange-main bg-hw-white-main text-hw-orange-main hover:bg-hw-orange-lighter/40 active:bg-hw-white-main active:shadow-[inset_-1px_2px_2px_0px_rgba(0,0,0,0.25)] disabled:border-transparent disabled:bg-hw-white-lighter disabled:text-hw-gray-lighter disabled:shadow-none',
        warning:
          'bg-hw-blue-main text-hw-white-main hover:opacity-90 active:bg-hw-blue-dark active:shadow-[inset_-1px_2px_2px_0px_rgba(0,0,0,0.25)] disabled:bg-hw-white-lighter disabled:text-hw-gray-lighter disabled:opacity-100 disabled:shadow-none',
      },
      size: {
        xl: 'h-11 gap-0.5 px-6 text-h6 [&_svg:not([class*=size-])]:size-4',
        l: 'h-8 gap-0.5 px-4 text-b3 [&_svg:not([class*=size-])]:size-3.5',
        m: 'h-7 gap-0.5 px-4 text-c1 [&_svg:not([class*=size-])]:size-3',
        s: 'h-[26px] gap-0.5 px-4 text-c1 [&_svg:not([class*=size-])]:size-3',
        xs: 'h-6 gap-0.5 px-2 text-c1 [&_svg:not([class*=size-])]:size-3',
      },
    },
    defaultVariants: {
      variant: 'fill',
      size: 'l',
    },
  },
)

export type PrimaryButtonVariants = VariantProps<typeof primaryButtonVariants>
