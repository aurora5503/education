import { createContentMaps } from '../content/contentPack'
import type { ContentPack, HandoutDocument, HandoutRequest } from '../types/content'

const unique = <T,>(items: T[]) => [...new Set(items)]

export function buildHandoutDocument(contentPack: ContentPack, request: HandoutRequest): HandoutDocument | null {
  const { diagnosisMap, medicationMap, moduleMap } = createContentMaps(contentPack)
  const diagnosisId = request.diagnosisIds.find((id) => diagnosisMap.has(id))

  if (!diagnosisId) {
    return null
  }

  const diagnosis = diagnosisMap.get(diagnosisId)

  if (!diagnosis) {
    return null
  }

  const medications = unique(request.medicationIds)
    .map((id) => medicationMap.get(id))
    .filter((medication): medication is NonNullable<typeof medication> => Boolean(medication))

  const modules = unique(request.selectedModuleIds)
    .map((id) => moduleMap.get(id))
    .filter((module): module is NonNullable<typeof module> => Boolean(module))

  const displayedMedications = medications.slice(0, 3)
  const displayedModules = modules.slice(0, 3)

  const treatmentSummary = unique([
    ...diagnosis.treatmentFocus,
    request.visitContext?.emphasis ? `醫師強調重點：${request.visitContext.emphasis}` : '',
  ])
    .filter(Boolean)
    .slice(0, 4)

  const urgentFlags = unique([
    ...diagnosis.redFlags,
    ...displayedMedications.flatMap((medication) => medication.whenToCall),
  ]).slice(0, 4)

  return {
    title: `${diagnosis.name} 個人化衛教摘要`,
    diagnosis,
    medications: displayedMedications,
    modules: displayedModules,
    extraMedicationCount: Math.max(0, medications.length - displayedMedications.length),
    extraModuleCount: Math.max(0, modules.length - displayedModules.length),
    treatmentSummary,
    urgentFlags,
    qrSlug: diagnosis.slug,
    qrPath: request.contentVersion
      ? `/patient/topic/${diagnosis.slug}?v=${encodeURIComponent(request.contentVersion)}`
      : `/patient/topic/${diagnosis.slug}`,
    contentVersion: request.contentVersion,
    generatedAt: new Intl.DateTimeFormat('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date()),
    sectionOrder: contentPack.template.sectionOrder,
  }
}
