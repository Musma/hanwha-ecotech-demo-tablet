import type { ComputedRef, InjectionKey } from 'vue'

import { cva } from 'class-variance-authority'
import { inject, provide } from 'vue'

import type { VariantProps } from 'class-variance-authority'

export { default as TextInput } from './TextInput.vue'
export { default as HelperText } from './HelperText.vue'
export { default as FormField } from './FormField.vue'
export { default as FieldLabel } from './FieldLabel.vue'

/**
 * 조립형 필드의 상태 값. FormField 컨텍스트와 각 조각이 공유한다.
 */
export type FieldStatus = 'default' | 'error' | 'success'

/**
 * 필드 사이즈. Figma 노드 5338-13543 기준:
 * - L: 필드 44px, 라벨 S2(14), 입력 B3(14), padding 12px
 * - M: 필드 32px, 라벨 S2(14), 입력 B3(14), padding 8px
 * - S: 필드 24px, 라벨 S3(12), 입력 C1(12), padding 8px
 */
export type FieldSize = 'l' | 'm' | 's'

/**
 * FormField 컨텍스트. 래퍼가 id/status/disabled 를 한 번만 받아 자식
 * (FieldLabel·TextInput·HelperText)에 내려주고, label↔input↔helper 의
 * a11y 연결(for / aria-describedby / aria-invalid)을 자동화한다.
 */
export interface FormFieldContext {
  inputId: string
  helperId: string
  status: ComputedRef<FieldStatus>
  size: ComputedRef<FieldSize>
  disabled: ComputedRef<boolean>
}

const FORM_FIELD_KEY: InjectionKey<FormFieldContext> = Symbol('hw-form-field')

export function provideFormField(ctx: FormFieldContext) {
  provide(FORM_FIELD_KEY, ctx)
}

/** FormField 안에 있으면 컨텍스트를, 단독 사용이면 null 을 돌려준다. */
export function useFormField() {
  return inject(FORM_FIELD_KEY, null)
}

/**
 * Composable text input field. The `text-input` set is intentionally NOT a
 * monolith: consumers stack `Label` (reused from `ui/label`) + `TextInput` +
 * `HelperText` to build a full field. This mirrors the Figma node 5328-2958
 * states (Default / Active / Error / Success), each of which is just a
 * combination of these pieces.
 *
 * Field metrics (Figma 5328-2958, size L):
 * - height 44px (`h-11`), radius 4px (`rounded-[4px]`, off-scale -> arbitrary)
 * - horizontal padding 12px (`px-3`)
 * - input text B3.Body 14/250 -> `text-b3`, colour `text-hw-gray-dark`
 * - placeholder `text-hw-gray-light`, surface `bg-hw-white-main`
 *
 * Border colours (Figma -> hw-* tokens):
 * - default / normal: #cccccc -> `border-hw-gray-light` (EXACT)
 * - focus (= Active):  #f37321 -> `border-hw-orange-main` (EXACT), driven by
 *   `:focus`, NOT a prop — focus is a runtime state, not a design variant.
 * - error:   spec #ca3c3d -> snapped to `hw-red-main` #f22922 (Δ51.87; ties
 *   with hw-red-light Δ51.17, and matches the Figma node variable
 *   `hanwha/Red/main`, so red-main is chosen for consistency).
 * - success: spec #107c41 -> snapped to `hw-green-dark` #008233 (Δ22.09,
 *   nearest green token by a wide margin).
 *
 * Width: never hard-coded. The field is `w-full`; the parent controls width
 * via padding / grid.
 */
export const textInputVariants = cva(
  [
    'w-full rounded-[4px] border border-solid bg-hw-white-main',
    'text-hw-gray-dark outline-none transition-colors',
    'placeholder:text-hw-gray-light',
    'focus:border-hw-orange-main',
    'disabled:cursor-not-allowed disabled:bg-hw-white-lighter disabled:text-hw-gray-main',
  ],
  {
    variants: {
      status: {
        default: 'border-hw-gray-light',
        error: 'border-hw-red-main',
        success: 'border-hw-green-dark',
      },
      // 사이즈마다 높이·padding·입력 폰트가 함께 바뀐다(Figma 5338-13543).
      size: {
        l: 'h-11 px-3 text-b3',
        m: 'h-8 px-2 text-b3',
        s: 'h-6 px-2 text-c1',
      },
    },
    defaultVariants: {
      status: 'default',
      size: 'l',
    },
  },
)

/**
 * FieldLabel 스타일. 사이즈에 따라 라벨 폰트가 S2(L/M) ↔ S3(S)로 바뀐다.
 */
export const fieldLabelVariants = cva('text-hw-gray-dark', {
  variants: {
    size: {
      l: 'text-s2',
      m: 'text-s2',
      s: 'text-s3',
    },
  },
  defaultVariants: {
    size: 'l',
  },
})

/**
 * Helper / assistive text shown below the field (Figma C2.Caption 10px).
 * Colour follows status:
 * - default: `text-hw-gray-dark`
 * - error:   `text-hw-red-main`   (snapped from #ca3c3d)
 * - success: `text-hw-green-dark` (snapped from #107c41)
 *
 * A leading status icon (lucide) is rendered for error / success; consumers
 * may also override via the default slot's leading content using the `icon`
 * slot.
 */
export const helperTextVariants = cva(
  'inline-flex items-center gap-1 text-c2 [&_svg]:size-3.5 [&_svg]:shrink-0',
  {
    variants: {
      status: {
        default: 'text-hw-gray-dark',
        error: 'text-hw-red-main',
        success: 'text-hw-green-dark',
      },
    },
    defaultVariants: {
      status: 'default',
    },
  },
)

export type TextInputVariants = VariantProps<typeof textInputVariants>
export type HelperTextVariants = VariantProps<typeof helperTextVariants>
