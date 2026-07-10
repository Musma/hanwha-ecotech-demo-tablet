import type { Ref } from 'vue'

import { MEASURE_MODES, type MeasureMode } from '@/shared/constants/map-common'
import type { LatLng } from '@/shared/helpers/map/grid-utils'
import type { SelectedShape } from '@/shared/helpers/map/measurement-utils'

interface UseMapDrawingControlsOptions {
  measureMode: Ref<MeasureMode>
  drawActiveKind: Ref<string | null>
  drawPointsCount: Ref<number>
  draftBlockColor: Ref<string>
  defaultBlockImageSrc: Ref<string>
  selectedShape: Ref<SelectedShape | null>
  activateMeasureMode: (mode: MeasureMode) => void
  cancelDraw: () => void
  resetDraw: () => void
  handleFocusOverlay: (shape: {
    type: SelectedShape['type']
    id: string
  }) => void
  handleSelectOverlay: (shape: {
    type: SelectedShape['type']
    id: string
    focusFromList?: boolean
  }) => void
  startPolygonDraw: (options?: {
    kind?: string | null
    constraintBoundary?: LatLng[] | null
  }) => void
  deleteOverlay: (type: SelectedShape['type'], id: string) => void
  updateBlockColor: (
    type: SelectedShape['type'],
    id: string,
    color: string,
  ) => void
  updateBlockImage: (id: string, src: string) => void
  updateCircleDiameter: (id: string, value: number) => void
  updateDefaultBlockImage: (src: string) => void
  updateOverlayName: (
    type: SelectedShape['type'],
    id: string,
    name: string,
  ) => void
  updateRectangleDimension: (
    id: string,
    axis: 'width' | 'height',
    value: number,
  ) => void
}

export interface MapDrawingControls {
  measureMode: Ref<MeasureMode>
  drawActiveKind: Ref<string | null>
  drawPointsCount: Ref<number>
  draftBlockColor: Ref<string>
  defaultBlockImageSrc: Ref<string>
  selectedShape: Ref<SelectedShape | null>
  cancelDraw: () => void
  deleteOverlay: (type: SelectedShape['type'], id: string) => void
  resetDraw: () => void
  focusOverlay: (shape: { type: SelectedShape['type']; id: string }) => void
  selectDraftBlockColor: (color: string) => void
  selectOverlay: (shape: {
    type: SelectedShape['type']
    id: string
    focusFromList?: boolean
  }) => void
  startCircleDraw: () => void
  startImageBlockDraw: (imageSrc?: string) => void
  startImageBlockDrawFromFile: (file: File) => Promise<void>
  startPolygonDraw: (options?: {
    kind?: string | null
    constraintBoundary?: LatLng[] | null
  }) => void
  startRectangleDraw: () => void
  updateBlockColor: (
    type: SelectedShape['type'],
    id: string,
    color: string,
  ) => void
  updateBlockImage: (id: string, src: string) => void
  updateBlockImageFromFile: (id: string, file: File) => Promise<void>
  updateCircleDiameter: (id: string, value: number) => void
  updateDefaultBlockImage: (src: string) => void
  updateOverlayName: (
    type: SelectedShape['type'],
    id: string,
    name: string,
  ) => void
  updateRectangleDimension: (
    id: string,
    axis: 'width' | 'height',
    value: number,
  ) => void
}

export function readMapImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result)
      else reject(new Error('이미지 파일을 읽을 수 없습니다.'))
    }
    reader.onerror = () => reject(reader.error ?? new Error('파일 읽기 실패'))
    reader.readAsDataURL(file)
  })
}

export function useMapDrawingControls({
  measureMode,
  drawActiveKind,
  drawPointsCount,
  draftBlockColor,
  defaultBlockImageSrc,
  selectedShape,
  activateMeasureMode,
  cancelDraw,
  deleteOverlay,
  resetDraw,
  handleFocusOverlay,
  handleSelectOverlay,
  startPolygonDraw,
  updateBlockColor,
  updateBlockImage,
  updateCircleDiameter,
  updateDefaultBlockImage,
  updateOverlayName,
  updateRectangleDimension,
}: UseMapDrawingControlsOptions): MapDrawingControls {
  function selectDraftBlockColor(color: string) {
    draftBlockColor.value = color
  }

  function startCircleDraw() {
    activateMeasureMode(MEASURE_MODES.circle)
  }

  function startRectangleDraw() {
    activateMeasureMode(MEASURE_MODES.rectangle)
  }

  function startImageBlockDraw(imageSrc?: string) {
    if (imageSrc) updateDefaultBlockImage(imageSrc)
    activateMeasureMode(MEASURE_MODES.imageBlock)
  }

  async function startImageBlockDrawFromFile(file: File) {
    const imageSrc = await readMapImageFile(file)
    startImageBlockDraw(imageSrc)
  }

  async function updateBlockImageFromFile(id: string, file: File) {
    const imageSrc = await readMapImageFile(file)
    updateBlockImage(id, imageSrc)
  }

  return {
    measureMode,
    drawActiveKind,
    drawPointsCount,
    draftBlockColor,
    defaultBlockImageSrc,
    selectedShape,
    cancelDraw,
    deleteOverlay,
    focusOverlay: handleFocusOverlay,
    resetDraw,
    selectDraftBlockColor,
    selectOverlay: handleSelectOverlay,
    startCircleDraw,
    startImageBlockDraw,
    startImageBlockDrawFromFile,
    startPolygonDraw,
    startRectangleDraw,
    updateBlockColor,
    updateBlockImage,
    updateBlockImageFromFile,
    updateCircleDiameter,
    updateDefaultBlockImage,
    updateOverlayName,
    updateRectangleDimension,
  }
}
