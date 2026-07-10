import { cva } from 'class-variance-authority'

import type { VariantProps } from 'class-variance-authority'

export { default as Button } from './Button.vue'

export const buttonVariants = cva(
  'focus-visible:border-hw-gray-main focus-visible:ring-hw-gray-main/50 aria-invalid:ring-hw-red-dark/20 dark:aria-invalid:ring-hw-red-dark/40 aria-invalid:border-hw-red-dark dark:aria-invalid:border-hw-red-dark/50 rounded-md border border-transparent bg-clip-padding text-sm font-medium focus-visible:ring-3 aria-invalid:ring-3 active:not-aria-[haspopup]:translate-y-px [&_svg:not([class*=size-])]:size-4 group/button inline-flex shrink-0 items-center justify-center whitespace-nowrap transition-all outline-none select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-hw-gray-darker text-hw-white-light hover:bg-hw-gray-darker/80',
        outline:
          'border-hw-white-darker bg-hw-white-main hover:bg-hw-white-light hover:text-hw-gray-darker dark:bg-hw-white-darker/30 dark:border-hw-white-darker dark:hover:bg-hw-white-darker/50 aria-expanded:bg-hw-white-light aria-expanded:text-hw-gray-darker shadow-xs',
        secondary:
          'bg-hw-white-light text-hw-gray-darker hover:bg-hw-white-light/80 aria-expanded:bg-hw-white-light aria-expanded:text-hw-gray-darker',
        ghost:
          'hover:bg-hw-white-light hover:text-hw-gray-darker dark:hover:bg-hw-white-light/50 aria-expanded:bg-hw-white-light aria-expanded:text-hw-gray-darker',
        destructive:
          'bg-hw-red-dark/10 hover:bg-hw-red-dark/20 focus-visible:ring-hw-red-dark/20 dark:focus-visible:ring-hw-red-dark/40 dark:bg-hw-red-dark/20 text-hw-red-dark focus-visible:border-hw-red-dark/40 dark:hover:bg-hw-red-dark/30',
        link: 'text-hw-gray-darker underline-offset-4 hover:underline',
        // hw 브랜드 변형: 기존 SCSS 톤을 그대로 유지한다.
        brand:
          'border-hw-orange-main bg-hw-orange-main text-white duration-[160ms] ease-smooth hover:border-hw-orange-dark hover:bg-hw-orange-dark',
        'brand-outline':
          'border-hw-gray-lighter bg-white text-hw-gray-darker duration-[160ms] ease-smooth hover:border-hw-orange-main hover:text-hw-orange-main',
        'brand-danger':
          'border-hw-red-lighter bg-white text-hw-red-main duration-[160ms] ease-smooth hover:bg-hw-red-main hover:text-white',
        'brand-ghost':
          'border-0 bg-transparent text-hw-gray-dark duration-[160ms] hover:bg-hw-white-light hover:text-hw-orange-main',
      },
      size: {
        default:
          'h-9 gap-1.5 px-2.5 in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
        xs: 'h-6 gap-1 rounded-[min(var(--radius-md),8px)] px-2 text-xs in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*=size-])]:size-3',
        sm: 'h-8 gap-1 rounded-[min(var(--radius-md),10px)] px-2.5 in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5',
        lg: 'h-10 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
        icon: 'size-9',
        'icon-xs':
          'size-6 rounded-[min(var(--radius-md),8px)] in-data-[slot=button-group]:rounded-md [&_svg:not([class*=size-])]:size-3',
        'icon-sm':
          'size-8 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-md',
        'icon-lg': 'size-10',
        // hw 브랜드 사이즈: 기존 버튼의 padding/typography를 그대로 옮긴다.
        brand:
          'h-auto gap-1.5 rounded-[4px] px-3.5 py-2 text-[13px] leading-none tracking-[-0.2px]',
        'brand-sm':
          'h-auto gap-1.5 rounded-[4px] px-2.5 py-[5px] text-xs leading-none tracking-[-0.2px]',
        'brand-icon': 'size-8 rounded-sm text-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)
export type ButtonVariants = VariantProps<typeof buttonVariants>
