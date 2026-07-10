export type IndoorCode = 'I' | 'O' | 'E'
export type UseCode = 'W' | 'S' | 'T' | 'M' | 'E'
export type PaveCode = 'N' | 'A' | 'C' | 'S' | 'P' | 'H' | 'E'
export type StageCode = 'S' | 'G' | 'L' | 'P' | 'A' | 'T'
export type ClassCode = 'S' | 'W' | 'P'
export type JibunLevel = 0 | 1 | 2 | 3 | 4

export interface Jibun {
  id: number
  parent: number | null
  abbr: string
  sabbr: string
  name: string
  level: JibunLevel
  sphy: [number, number]
  gap: [number, number]
  indoor: IndoorCode | string | null
  use: UseCode | string | null
  pave: PaveCode | string | null
  maxL: number | null
  maxW: number | null
  maxH: number | null
  maxT: number | null
  area: number | null
  org: string | null
  cost: number | null
  pcg: string | null
  pcls: ClassCode | string | null
  pstage: StageCode | string | null
  stackType: string | null
  mgr: string | null
  poly: string | null
}

export interface OperationStrategy {
  jcode: string
  id: number
  org: string
  from: string
  to: string
  use: UseCode | string
  pcg: string
  cls: ClassCode | string
  stage: StageCode | string
  stack: string
  mgr: string
}

export type OpStatus = 'ongoing' | 'planned' | 'ended'

export interface GpsCell {
  yard: string
  yardN: number
  x: number
  y: number
  code: string
  gps: number[][]
  jibunId: number
}

export interface FocusRequest {
  requestedAt: number
}

export interface MapFocusRequest extends FocusRequest {
  id: number
}

export interface BlockFocusRequest extends FocusRequest {
  no: string
  name: string
  phys: number[]
  tone: string
  popup: unknown
}

export interface RouteFocusRequest extends FocusRequest {
  req: string
  from: { label: string; phys: number[] }
  to: { label: string; phys: number[] }
  popup: unknown
}
