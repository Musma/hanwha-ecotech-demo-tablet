export type WorkListTab = 'all' | 'pending' | 'complete'

export type WorkStatus = Exclude<WorkListTab, 'all'>

export interface WorkItem {
  id: number
  status: WorkStatus
  category: string
  objectCode: string
  objectName: string
  departureCode: string
  departureName: string
}

export interface WorkTabItem {
  key: WorkListTab
  label: string
  count: number
}
