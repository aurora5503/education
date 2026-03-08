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
  classLabel: string
  patientIntro: string
  indications: string[]
  onset: string
  commonSideEffects: string[]
  seriousSideEffects: string[]
  missedDoseAdvice: string
  discontinuationAdvice: string
  whenToCall: string[]
  faq: MedicationFaq[]
  relatedDiagnosisIds: string[]
}

export interface CareModule {
  id: string
  kind: 'counseling' | 'lifestyle'
  title: string
  summary: string
  bullets: string[]
  tags: string[]
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
  careStage?: string
  followUpPlan?: string
  emphasis?: string
}

export interface PrefillPayload {
  diagnosisIds?: string[]
  medicationIds?: string[]
  selectedModuleIds?: string[]
  visitContext?: VisitContext
  sourceSystem?: string
}

export interface HandoutRequest {
  diagnosisIds: string[]
  medicationIds: string[]
  selectedModuleIds: string[]
  note?: string
  visitContext?: VisitContext
  sourceSystem?: string
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
  note?: string
  visitContextLine?: string
  sourceSystem?: string
  generatedAt: string
}
