import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { cloneContentPack, defaultContentPack } from './contentPack'
import { ContentPackContext, type ContentPackContextValue } from './ContentPackContext'
import { getContentVersion } from './contentVersion'
import type { CareModule, ContentPack, DiagnosisTopic, MedicationFaq, MedicationTopic } from '../types/content'

const STORAGE_KEY = 'psyedu.content-pack.v2'
const getServerContentUrl = () => new URL('content/content-pack.json', window.location.origin + import.meta.env.BASE_URL).toString()

interface StoredDraft {
  baseHash: string
  contentPack: ContentPack
}

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
    groupId: asString(record.groupId, fallback.groupId),
    groupLabel: asString(record.groupLabel, fallback.groupLabel),
    groupDescription: asString(record.groupDescription, fallback.groupDescription),
    classLabel: asString(record.classLabel, fallback.classLabel),
    shortSummary: asString(record.shortSummary, asString(record.patientIntro, fallback.shortSummary)),
    patientIntro: asString(record.patientIntro, fallback.patientIntro),
    indications: asStringArray(record.indications, fallback.indications),
    onset: asString(record.onset, fallback.onset),
    commonSideEffects: asStringArray(record.commonSideEffects, fallback.commonSideEffects),
    seriousSideEffects: asStringArray(record.seriousSideEffects, fallback.seriousSideEffects),
    practicalTips: asStringArray(record.practicalTips, fallback.practicalTips),
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
  const slug = asString(record.slug, id).trim()
  const title = asString(record.title, '').trim()

  if (!id || !slug || !title) {
    return null
  }

  return {
    id,
    slug,
    kind: record.kind === 'counseling' || record.kind === 'lifestyle' ? record.kind : fallback.kind,
    title,
    summary: asString(record.summary, fallback.summary),
    bullets: asStringArray(record.bullets, fallback.bullets),
    patientSummary: asString(record.patientSummary, asString(record.summary, fallback.patientSummary)),
    practicalSteps: asStringArray(record.practicalSteps, fallback.practicalSteps),
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

function validateImportedContentPack(contentPack: ContentPack) {
  if (contentPack.diagnoses.length === 0) {
    throw new Error('匯入內容至少需要 1 個疾病主題。')
  }

  if (contentPack.medications.length === 0) {
    throw new Error('匯入內容至少需要 1 個藥物主題。')
  }

  if (contentPack.modules.length === 0) {
    throw new Error('匯入內容至少需要 1 個衛教模組。')
  }

  return contentPack
}

function hashContentPack(contentPack: ContentPack) {
  return JSON.stringify(contentPack)
}

function loadStoredDraft(): StoredDraft | null {
  if (typeof window === 'undefined') {
    return null
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)

  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StoredDraft>

    if (!parsed || typeof parsed !== 'object' || typeof parsed.baseHash !== 'string') {
      return null
    }

    return {
      baseHash: parsed.baseHash,
      contentPack: sanitizeContentPack(parsed.contentPack),
    }
  } catch {
    return null
  }
}

export function ContentPackProvider({ children }: { children: ReactNode }) {
  const [serverContentPack, setServerContentPack] = useState<ContentPack>(() => cloneContentPack(defaultContentPack))
  const [contentPack, setContentPack] = useState<ContentPack>(() => cloneContentPack(defaultContentPack))
  const [hasHydrated, setHasHydrated] = useState(false)

  useEffect(() => {
    let cancelled = false

    const hydrate = async () => {
      let nextServerPack = cloneContentPack(defaultContentPack)

      try {
        const response = await fetch(getServerContentUrl(), { cache: 'no-store' })

        if (response.ok) {
          nextServerPack = sanitizeContentPack(await response.json())
        }
      } catch {
        nextServerPack = cloneContentPack(defaultContentPack)
      }

      if (cancelled) {
        return
      }

      const storedDraft = loadStoredDraft()
      const serverHash = hashContentPack(nextServerPack)
      const nextContentPack =
        storedDraft && storedDraft.baseHash === serverHash ? storedDraft.contentPack : cloneContentPack(nextServerPack)

      setServerContentPack(nextServerPack)
      setContentPack(nextContentPack)
      setHasHydrated(true)
    }

    void hydrate()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!hasHydrated) {
      return
    }

    const serverHash = hashContentPack(serverContentPack)
    const currentHash = hashContentPack(contentPack)

    if (serverHash === currentHash) {
      window.localStorage.removeItem(STORAGE_KEY)
      return
    }

    const payload: StoredDraft = {
      baseHash: serverHash,
      contentPack,
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  }, [contentPack, hasHydrated, serverContentPack])

  const value = useMemo<ContentPackContextValue>(
    () => ({
      contentPack,
      contentVersion: getContentVersion(contentPack),
      updateContentPack: (updater) => setContentPack((current) => updater(current)),
      importContentPack: (nextContentPack) => setContentPack(validateImportedContentPack(sanitizeContentPack(nextContentPack))),
      restoreDefaults: () => setContentPack(cloneContentPack(serverContentPack)),
      exportContentPack: () => JSON.stringify(contentPack, null, 2),
      hasLocalChanges: hashContentPack(contentPack) !== hashContentPack(serverContentPack),
    }),
    [contentPack, serverContentPack],
  )

  return <ContentPackContext.Provider value={value}>{children}</ContentPackContext.Provider>
}
