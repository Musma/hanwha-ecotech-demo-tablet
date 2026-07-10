import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/**
 * tailwind-merge 는 커스텀 시맨틱 타이포 토큰(text-h1~c2)을 기본 설정으로는
 * 인식하지 못해, color 토큰(text-hw-*)과 같은 `text-*` 그룹으로 오인하고
 * 색 클래스를 떨어뜨린다(예: `text-hw-white-main text-b3` → `text-b3`).
 * 커스텀 토큰을 font-size 그룹으로 등록해 색과 분리한다.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [
            'h1',
            'h2',
            'h3',
            'h4',
            'h5',
            'h6',
            's1',
            's2',
            's3',
            'b1',
            'b2',
            'b3',
            'c1',
            'c2',
          ],
        },
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
