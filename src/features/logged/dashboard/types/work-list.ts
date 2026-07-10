export type WorkListTab = 'all' | 'pending' | 'complete'

export type WorkStatus = Exclude<WorkListTab, 'all'>

export interface WorkDetail {
  completedAt: string
  description: string
  dimensions: string
  startedAt: string
  weightTons: number
}

export interface WorkItem {
  id: number
  status: WorkStatus
  category: string
  objectCode: string
  objectName: string
  departureCode: string
  departureName: string
  detail?: WorkDetail
}

export interface WorkTabItem {
  key: WorkListTab
  label: string
  count: number
}
