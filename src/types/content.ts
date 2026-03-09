export type TopicSlug = string

export interface DiagnosisTopic {
  id: string
  slug: TopicSlug
  name: string
  coreSummary: string
  commonSymptoms: string[]
  courseExpectation: string
  redFlags: string[]
  myths: string[]
  treatmentFocus: string[]
  selfCareTips: string[]
  relatedMedicationIds: string[]
  relatedModuleIds: string[]
}

export interface MedicationFaq {
  question: string
  answer: string
}

export interface MedicationTopic {
  id: string
  slug: TopicSlug
  name: string
  groupId: string
  groupLabel: string
  groupDescription: string
  classLabel: string
  shortSummary: string
  patientIntro: string
  indications: string[]
  onset: string
  commonSideEffects: string[]
  seriousSideEffects: string[]
  practicalTips: string[]
  missedDoseAdvice: string
  discontinuationAdvice: string
  whenToCall: string[]
  faq: MedicationFaq[]
  relatedDiagnosisIds: string[]
}

export interface CareModule {
  id: string
  slug: TopicSlug
  kind: 'counseling' | 'lifestyle'
  title: string
  summary: string
  patientSummary: string
  bullets: string[]
  practicalSteps: string[]
}

export interface HandoutTemplate {
  id: string
  name: string
  sectionOrder: Array<'diagnosis' | 'treatment' | 'medication' | 'modules' | 'urgent' | 'qr'>
  noteLimit: number
}

export interface ContentPack {
  diagnoses: DiagnosisTopic[]
  medications: MedicationTopic[]
  modules: CareModule[]
  template: HandoutTemplate
}

export interface VisitContext {
  emphasis?: string
}

export interface HandoutRequest {
  diagnosisIds: string[]
  medicationIds: string[]
  selectedModuleIds: string[]
  visitContext?: VisitContext
  contentVersion?: string
}

export interface HandoutDocument {
  title: string
  diagnosis: DiagnosisTopic
  medications: MedicationTopic[]
  modules: CareModule[]
  extraMedicationCount: number
  extraModuleCount: number
  treatmentSummary: string[]
  urgentFlags: string[]
  qrSlug: TopicSlug
  qrPath: string
  contentVersion?: string
  generatedAt: string
  sectionOrder: Array<'diagnosis' | 'treatment' | 'medication' | 'modules' | 'urgent' | 'qr'>
}
