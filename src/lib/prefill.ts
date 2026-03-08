import { createContentMaps } from '../content/contentPack'
import type { ContentPack, PrefillPayload } from '../types/content'

export const PREFILL_MESSAGE_TYPE = 'psyedu.prefill'

const coerceStringArray = (value: unknown) => {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
}

const sanitizePayload = (payload: PrefillPayload, contentPack: ContentPack): PrefillPayload => {
  const { diagnosisMap, medicationMap, moduleMap } = createContentMaps(contentPack)

  return {
    diagnosisIds: coerceStringArray(payload.diagnosisIds).filter((id) => diagnosisMap.has(id)),
    medicationIds: coerceStringArray(payload.medicationIds).filter((id) => medicationMap.has(id)),
    selectedModuleIds: coerceStringArray(payload.selectedModuleIds).filter((id) => moduleMap.has(id)),
  visitContext: payload.visitContext
    ? {
        careStage: payload.visitContext.careStage?.trim(),
        followUpPlan: payload.visitContext.followUpPlan?.trim(),
        emphasis: payload.visitContext.emphasis?.trim(),
      }
    : undefined,
  sourceSystem: payload.sourceSystem?.trim(),
  }
}

const parseCsv = (value: string | null) =>
  value
    ?.split(',')
    .map((item) => item.trim())
    .filter(Boolean) ?? []

export function parseQueryPrefill(search: string, contentPack: ContentPack): PrefillPayload | null {
  const params = new URLSearchParams(search)
  const payload = sanitizePayload({
    diagnosisIds: parseCsv(params.get('diagnosisIds')),
    medicationIds: parseCsv(params.get('medicationIds')),
    selectedModuleIds: parseCsv(params.get('selectedModuleIds')),
    sourceSystem: params.get('sourceSystem') ?? undefined,
    visitContext: {
      careStage: params.get('careStage') ?? undefined,
      followUpPlan: params.get('followUpPlan') ?? undefined,
      emphasis: params.get('emphasis') ?? undefined,
    },
  }, contentPack)

  const hasMeaningfulData =
    (payload.diagnosisIds?.length ?? 0) > 0 ||
    (payload.medicationIds?.length ?? 0) > 0 ||
    (payload.selectedModuleIds?.length ?? 0) > 0 ||
    Boolean(payload.sourceSystem) ||
    Boolean(payload.visitContext?.careStage || payload.visitContext?.followUpPlan || payload.visitContext?.emphasis)

  return hasMeaningfulData ? payload : null
}

export function serializePrefillToQuery(payload: PrefillPayload) {
  const params = new URLSearchParams()

  if (payload.diagnosisIds?.length) {
    params.set('diagnosisIds', payload.diagnosisIds.join(','))
  }

  if (payload.medicationIds?.length) {
    params.set('medicationIds', payload.medicationIds.join(','))
  }

  if (payload.selectedModuleIds?.length) {
    params.set('selectedModuleIds', payload.selectedModuleIds.join(','))
  }

  if (payload.visitContext?.careStage) {
    params.set('careStage', payload.visitContext.careStage)
  }

  if (payload.visitContext?.followUpPlan) {
    params.set('followUpPlan', payload.visitContext.followUpPlan)
  }

  if (payload.visitContext?.emphasis) {
    params.set('emphasis', payload.visitContext.emphasis)
  }

  if (payload.sourceSystem) {
    params.set('sourceSystem', payload.sourceSystem)
  }

  return params.toString()
}

export function readPrefillMessage(data: unknown, contentPack: ContentPack): PrefillPayload | null {
  let candidate = data

  if (typeof data === 'string') {
    try {
      candidate = JSON.parse(data)
    } catch {
      return null
    }
  }

  if (!candidate || typeof candidate !== 'object') {
    return null
  }

  const envelope = candidate as { type?: string; payload?: PrefillPayload }

  if (envelope.type === PREFILL_MESSAGE_TYPE && envelope.payload) {
    return sanitizePayload(envelope.payload, contentPack)
  }

  if ('diagnosisIds' in envelope || 'medicationIds' in envelope || 'selectedModuleIds' in envelope) {
    return sanitizePayload(envelope as PrefillPayload, contentPack)
  }

  return null
}
