export type WorkListTab = 'all' | 'pending' | 'complete'

export type WorkStatus = Exclude<WorkListTab, 'all'>

export type WorkExecutionPhase = 'waiting' | 'inProgress' | 'completed'

export interface WorkDetail {
  completedAt: string
  description: string
  startedAt: string
}

export interface WorkItem {
  id: number
  status: WorkStatus
  /** 실행계획 Activity 코드 */
  activityCode: string
  /** 작업 단계(소조립·중조립·전장·PE도장 등) */
  stage: string
  /** 호선 번호 */
  hullNo: string
  /** 블록 번호 */
  blockNo: string
  /** PCG 코드 */
  pcg: string
  /** 출발지 지번 약어 */
  departureCode: string
  /** 출발지 대지번명 */
  departureName: string
  /** 도착지 지번 약어 */
  arrivalCode: string
  /** 도착지 대지번명 */
  arrivalName: string
  detail?: WorkDetail
}

export interface WorkTabItem {
  key: WorkListTab
  label: string
  count: number
}
