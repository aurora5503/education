import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { cloneContentPack, defaultContentPack } from './contentPack'
import { ContentPackContext, type ContentPackContextValue } from './ContentPackContext'
import type { CareModule, ContentPack, DiagnosisTopic, MedicationFaq, MedicationTopic } from '../types/content'

const STORAGE_KEY = 'psyedu.content-pack.v1'

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null

const asString = (value: unknown, fallback: string) => (typeof value === 'string' ? value : fallback)

const asStringArray = (value: unknown, fallback: string[]) =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : fallback

const defaultDiagnosis: DiagnosisTopic = cloneContentPack(defaultContentPack).diagnoses[0]
const defaultMedication: MedicationTopic = cloneContentPack(defaultContentPack).medications[0]
const defaultModule: CareModule = cloneContentPack(defaultContentPack).modules[0]

const sanitizeFaq = (value: unknown, fallback: MedicationFaq[]) => {
  if (!Array.isArray(value)) {
    return fallback
  }

  return value
    .map((item, index) => {
      const record = asRecord(item)
      const base = fallback[index] ?? fallback[fallback.length - 1]

      if (!record || !base) {
        return null
      }

      return {
        question: asString(record.question, base.question),
        answer: asString(record.answer, base.answer),
      }
    })
    .filter((item): item is MedicationFaq => Boolean(item))
}

const sanitizeDiagnosis = (value: unknown, fallback: DiagnosisTopic): DiagnosisTopic | null => {
  const record = asRecord(value)

  if (!record) {
    return null
  }

  const id = asString(record.id, '').trim()
  const slug = asString(record.slug, '').trim()
  const name = asString(record.name, '').trim()

  if (!id || !slug || !name) {
    return null
  }

  return {
    id,
    slug,
    name,
    accent: asString(record.accent, fallback.accent),
    coreSummary: asString(record.coreSummary, fallback.coreSummary),
    commonSymptoms: asStringArray(record.commonSymptoms, fallback.commonSymptoms),
    courseExpectation: asString(record.courseExpectation, fallback.courseExpectation),
    redFlags: asStringArray(record.redFlags, fallback.redFlags),
    myths: asStringArray(record.myths, fallback.myths),
    treatmentFocus: asStringArray(record.treatmentFocus, fallback.treatmentFocus),
    selfCareTips: asStringArray(record.selfCareTips, fallback.selfCareTips),
    relatedMedicationIds: asStringArray(record.relatedMedicationIds, fallback.relatedMedicationIds),
    relatedModuleIds: asStringArray(record.relatedModuleIds, fallback.relatedModuleIds),
  }
}

const sanitizeMedication = (value: unknown, fallback: MedicationTopic): MedicationTopic | null => {
  const record = asRecord(value)

  if (!record) {
    return null
  }

  const id = asString(record.id, '').trim()
  const slug = asString(record.slug, '').trim()
  const name = asString(record.name, '').trim()

  if (!id || !slug || !name) {
    return null
  }

  return {
    id,
    slug,
    name,
    classLabel: asString(record.classLabel, fallback.classLabel),
    patientIntro: asString(record.patientIntro, fallback.patientIntro),
    indications: asStringArray(record.indications, fallback.indications),
    onset: asString(record.onset, fallback.onset),
    commonSideEffects: asStringArray(record.commonSideEffects, fallback.commonSideEffects),
    seriousSideEffects: asStringArray(record.seriousSideEffects, fallback.seriousSideEffects),
    missedDoseAdvice: asString(record.missedDoseAdvice, fallback.missedDoseAdvice),
    discontinuationAdvice: asString(record.discontinuationAdvice, fallback.discontinuationAdvice),
    whenToCall: asStringArray(record.whenToCall, fallback.whenToCall),
    faq: sanitizeFaq(record.faq, fallback.faq),
    relatedDiagnosisIds: asStringArray(record.relatedDiagnosisIds, fallback.relatedDiagnosisIds),
  }
}

const sanitizeModule = (value: unknown, fallback: CareModule): CareModule | null => {
  const record = asRecord(value)

  if (!record) {
    return null
  }

  const id = asString(record.id, '').trim()
  const title = asString(record.title, '').trim()

  if (!id || !title) {
    return null
  }

  return {
    id,
    kind: record.kind === 'counseling' || record.kind === 'lifestyle' ? record.kind : fallback.kind,
    title,
    summary: asString(record.summary, fallback.summary),
    bullets: asStringArray(record.bullets, fallback.bullets),
    tags: asStringArray(record.tags, fallback.tags),
  }
}

function sanitizeContentPack(candidate: unknown): ContentPack {
  const root = asRecord(candidate)

  if (!root) {
    return cloneContentPack(defaultContentPack)
  }

  const diagnosisSource = Array.isArray(root.diagnoses) ? root.diagnoses : []
  const medicationSource = Array.isArray(root.medications) ? root.medications : []
  const moduleSource = Array.isArray(root.modules) ? root.modules : []
  const templateSource = asRecord(root.template)
  const diagnoses =
    diagnosisSource
      .map((item) => sanitizeDiagnosis(item, defaultDiagnosis))
      .filter((item): item is DiagnosisTopic => Boolean(item)) || []
  const medications =
    medicationSource
      .map((item) => sanitizeMedication(item, defaultMedication))
      .filter((item): item is MedicationTopic => Boolean(item)) || []
  const modules =
    moduleSource.map((item) => sanitizeModule(item, defaultModule)).filter((item): item is CareModule => Boolean(item)) ||
    []

  return {
    diagnoses: Array.isArray(root.diagnoses) ? diagnoses : cloneContentPack(defaultContentPack).diagnoses,
    medications: Array.isArray(root.medications) ? medications : cloneContentPack(defaultContentPack).medications,
    modules: Array.isArray(root.modules) ? modules : cloneContentPack(defaultContentPack).modules,
    template: {
      ...defaultContentPack.template,
      name: asString(templateSource?.name, defaultContentPack.template.name),
      noteLimit:
        typeof templateSource?.noteLimit === 'number'
          ? templateSource.noteLimit
          : defaultContentPack.template.noteLimit,
    },
  }
}

function loadContentPack(): ContentPack {
  if (typeof window === 'undefined') {
    return cloneContentPack(defaultContentPack)
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)

  if (!raw) {
    return cloneContentPack(defaultContentPack)
  }

  try {
    return sanitizeContentPack(JSON.parse(raw))
  } catch {
    return cloneContentPack(defaultContentPack)
  }
}

export function ContentPackProvider({ children }: { children: ReactNode }) {
  const [contentPack, setContentPack] = useState<ContentPack>(() => loadContentPack())

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(contentPack))
  }, [contentPack])

  const value = useMemo<ContentPackContextValue>(
    () => ({
      contentPack,
      updateContentPack: (updater) => setContentPack((current) => updater(current)),
      restoreDefaults: () => setContentPack(cloneContentPack(defaultContentPack)),
      exportContentPack: () => JSON.stringify(contentPack, null, 2),
      hasLocalChanges: JSON.stringify(contentPack) !== JSON.stringify(defaultContentPack),
    }),
    [contentPack],
  )

  return <ContentPackContext.Provider value={value}>{children}</ContentPackContext.Provider>
}
