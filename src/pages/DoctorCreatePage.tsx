import { useEffect, useMemo, useState } from 'react'
import { HandoutPreview } from '../components/HandoutPreview'
import { useContentPack } from '../content/useContentPack'
import { buildHandoutDocument } from '../lib/handout'
import { parseQueryPrefill, PREFILL_MESSAGE_TYPE, readPrefillMessage } from '../lib/prefill'
import type { PrefillPayload, VisitContext } from '../types/content'

interface PrefillState {
  via: 'query' | 'postMessage'
  sourceSystem?: string
}

const blankVisitContext: VisitContext = {
  careStage: '',
  followUpPlan: '',
  emphasis: '',
}

export function DoctorCreatePage() {
  const { contentPack } = useContentPack()
  const queryPrefill = useMemo(() => parseQueryPrefill(window.location.search, contentPack), [contentPack])
  const [selectedDiagnosisId, setSelectedDiagnosisId] = useState(queryPrefill?.diagnosisIds?.[0] ?? '')
  const [selectedMedicationIds, setSelectedMedicationIds] = useState<string[]>(queryPrefill?.medicationIds ?? [])
  const [selectedModuleIds, setSelectedModuleIds] = useState<string[]>(queryPrefill?.selectedModuleIds ?? [])
  const [visitContext, setVisitContext] = useState<VisitContext>({
    careStage: queryPrefill?.visitContext?.careStage ?? '',
    followUpPlan: queryPrefill?.visitContext?.followUpPlan ?? '',
    emphasis: queryPrefill?.visitContext?.emphasis ?? '',
  })
  const [note, setNote] = useState('')
  const [prefillState, setPrefillState] = useState<PrefillState | null>(
    queryPrefill
      ? {
          via: 'query',
          sourceSystem: queryPrefill.sourceSystem,
        }
      : null,
  )

  const selectedDiagnosis = useMemo(
    () => contentPack.diagnoses.find((diagnosis) => diagnosis.id === selectedDiagnosisId),
    [contentPack.diagnoses, selectedDiagnosisId],
  )

  const applyPrefill = (payload: PrefillPayload, via: PrefillState['via']) => {
    if (payload.diagnosisIds?.[0]) {
      setSelectedDiagnosisId(payload.diagnosisIds[0])
    }

    if (payload.medicationIds) {
      setSelectedMedicationIds(payload.medicationIds)
    }

    if (payload.selectedModuleIds) {
      setSelectedModuleIds(payload.selectedModuleIds)
    }

    if (payload.visitContext) {
      setVisitContext({
        careStage: payload.visitContext.careStage ?? '',
        followUpPlan: payload.visitContext.followUpPlan ?? '',
        emphasis: payload.visitContext.emphasis ?? '',
      })
    }

    setPrefillState({
      via,
      sourceSystem: payload.sourceSystem,
    })
  }

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const payload = readPrefillMessage(event.data, contentPack)

      if (payload) {
        applyPrefill(payload, 'postMessage')
      }
    }

    window.addEventListener('message', handleMessage)

    return () => window.removeEventListener('message', handleMessage)
  }, [contentPack])

  const document = useMemo(
    () =>
      buildHandoutDocument(contentPack, {
        diagnosisIds: selectedDiagnosisId ? [selectedDiagnosisId] : [],
        medicationIds: selectedMedicationIds,
        selectedModuleIds,
        note,
        visitContext,
        sourceSystem: prefillState?.sourceSystem,
      }),
    [contentPack, note, prefillState?.sourceSystem, selectedDiagnosisId, selectedMedicationIds, selectedModuleIds, visitContext],
  )

  const recommendedMedicationIds = selectedDiagnosis?.relatedMedicationIds ?? []
  const recommendedModuleIds = selectedDiagnosis?.relatedModuleIds ?? []

  const toggleSelection = (current: string[], id: string, setter: (ids: string[]) => void) => {
    setter(current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  }

  const resetComposer = () => {
    setSelectedDiagnosisId('')
    setSelectedMedicationIds([])
    setSelectedModuleIds([])
    setVisitContext(blankVisitContext)
    setNote('')
    setPrefillState(null)
    window.history.replaceState({}, '', window.location.pathname)
  }

  return (
    <div className="page">
      <section className="page-hero">
        <div>
          <p className="eyebrow">Doctor Composer</p>
          <h1>精神科個人化衛教單</h1>
          <p className="hero-copy">
            用單頁流程快速組出門診後衛教單。診斷、藥物副作用、心理與生活建議都會即時整合成 A4 列印版。
          </p>
        </div>
        <div className="hero-card">
          <span className="pill">不保存病人個資</span>
          <span className="pill accent">可接 HIS 預填</span>
          <span className="pill subtle">Edge 宿主頁可用 postMessage</span>
        </div>
      </section>

      {prefillState ? (
        <section className="inline-banner">
          <div>
            <strong>已套用預填資料</strong>
            <p>
              來源方式：{prefillState.via === 'query' ? 'query string' : PREFILL_MESSAGE_TYPE}
              {prefillState.sourceSystem ? ` | 來源系統：${prefillState.sourceSystem}` : ''}
            </p>
          </div>
          <button type="button" className="ghost-button" onClick={resetComposer}>
            清除並重新開始
          </button>
        </section>
      ) : null}

      <div className="doctor-layout">
        <section className="composer-stack">
          <section className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">1. 診斷選擇</p>
                <h2>先決定主軸診斷</h2>
              </div>
              <span className="panel-meta">首發 6 個常見主題</span>
            </div>
            <div className="selection-grid diagnosis-grid">
              {contentPack.diagnoses.map((diagnosis) => {
                const isActive = diagnosis.id === selectedDiagnosisId

                return (
                  <button
                    key={diagnosis.id}
                    type="button"
                    className={`selection-card diagnosis-card ${isActive ? 'active' : ''}`}
                    onClick={() => setSelectedDiagnosisId(diagnosis.id)}
                  >
                    <div className="selection-header">
                      <strong>{diagnosis.name}</strong>
                      <span className="pill subtle">{diagnosis.accent}</span>
                    </div>
                    <p>{diagnosis.coreSummary}</p>
                    <div className="chip-row">
                      {diagnosis.commonSymptoms.slice(0, 3).map((symptom) => (
                        <span key={symptom} className="chip">
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </button>
                )
              })}
            </div>
          </section>

          <section className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">2. 藥物與副作用</p>
                <h2>選擇要放進衛教單的藥物類別</h2>
              </div>
              <span className="panel-meta">療程與副作用最優先</span>
            </div>
            <div className="selection-grid medication-grid-panel">
              {contentPack.medications.map((medication) => {
                const isActive = selectedMedicationIds.includes(medication.id)
                const isRecommended = recommendedMedicationIds.includes(medication.id)

                return (
                  <button
                    key={medication.id}
                    type="button"
                    className={`selection-card ${isActive ? 'active' : ''}`}
                    onClick={() => toggleSelection(selectedMedicationIds, medication.id, setSelectedMedicationIds)}
                  >
                    <div className="selection-header">
                      <strong>{medication.name}</strong>
                      {isRecommended ? <span className="pill accent">建議</span> : null}
                    </div>
                    <p>{medication.patientIntro}</p>
                    <p className="selection-footnote">起效時間：{medication.onset}</p>
                    <div className="chip-row">
                      {medication.commonSideEffects.slice(0, 3).map((effect) => (
                        <span key={effect} className="chip warn">
                          {effect}
                        </span>
                      ))}
                    </div>
                  </button>
                )
              })}
            </div>
          </section>

          <section className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">3. 心理與生活模組</p>
                <h2>勾選需要補充的衛教段落</h2>
              </div>
              <span className="panel-meta">建議 1 到 3 項</span>
            </div>

            {(['counseling', 'lifestyle'] as const).map((kind) => (
              <div key={kind} className="module-group">
                <div className="module-group-title">{kind === 'counseling' ? '心理與追蹤' : '生活與功能'}</div>
                <div className="selection-grid">
                  {contentPack.modules
                    .filter((module) => module.kind === kind)
                    .map((module) => {
                      const isActive = selectedModuleIds.includes(module.id)
                      const isRecommended = recommendedModuleIds.includes(module.id)

                      return (
                        <button
                          key={module.id}
                          type="button"
                          className={`selection-card module-card-panel ${isActive ? 'active' : ''}`}
                          onClick={() => toggleSelection(selectedModuleIds, module.id, setSelectedModuleIds)}
                        >
                          <div className="selection-header">
                            <strong>{module.title}</strong>
                            {isRecommended ? <span className="pill accent">建議</span> : null}
                          </div>
                          <p>{module.summary}</p>
                          <div className="chip-row">
                            {module.tags.map((tag) => (
                              <span key={tag} className="chip">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </button>
                      )
                    })}
                </div>
              </div>
            ))}
          </section>

          <section className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">4. 列印前微調</p>
                <h2>加入本次門診重點</h2>
              </div>
              <span className="panel-meta">短句即可</span>
            </div>

            <div className="field-grid">
              <label className="field">
                <span>照護階段</span>
                <input
                  value={visitContext.careStage ?? ''}
                  onChange={(event) =>
                    setVisitContext((current) => ({ ...current, careStage: event.target.value.slice(0, 24) }))
                  }
                  placeholder="例如：初診 / 穩定追蹤"
                />
              </label>
              <label className="field">
                <span>追蹤安排</span>
                <input
                  value={visitContext.followUpPlan ?? ''}
                  onChange={(event) =>
                    setVisitContext((current) => ({ ...current, followUpPlan: event.target.value.slice(0, 36) }))
                  }
                  placeholder="例如：2 週後回診"
                />
              </label>
            </div>

            <label className="field">
              <span>本次請特別注意</span>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value.slice(0, contentPack.template.noteLimit))}
                placeholder="例如：先觀察白天嗜睡，若嚴重請提早回診。"
                rows={3}
              />
            </label>

            <label className="field">
              <span>醫師強調重點</span>
              <input
                value={visitContext.emphasis ?? ''}
                onChange={(event) =>
                  setVisitContext((current) => ({ ...current, emphasis: event.target.value.slice(0, 36) }))
                }
                placeholder="例如：規律服藥，不要自行停藥"
              />
            </label>

            <div className="action-row">
              <button type="button" className="primary-button" onClick={() => window.print()} disabled={!document}>
                列印 / 輸出 PDF
              </button>
              <button type="button" className="ghost-button" onClick={resetComposer}>
                清空全部
              </button>
            </div>
          </section>
        </section>

        <aside className="preview-column">
          <HandoutPreview document={document} />
        </aside>
      </div>
    </div>
  )
}
