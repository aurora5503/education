import { useMemo, useState } from 'react'
import { HandoutPreview } from '../components/HandoutPreview'
import { useContentPack } from '../content/useContentPack'
import { buildHandoutDocument } from '../lib/handout'
import type { MedicationTopic, VisitContext } from '../types/content'

const blankVisitContext: VisitContext = {
  careStage: '',
  followUpPlan: '',
  emphasis: '',
}

const unique = <T,>(items: T[]) => [...new Set(items)]

interface MedicationGroup {
  id: string
  label: string
  description: string
  items: MedicationTopic[]
}

export function DoctorCreatePage() {
  const { contentPack, contentVersion } = useContentPack()
  const [selectedDiagnosisId, setSelectedDiagnosisId] = useState('')
  const [selectedMedicationGroupId, setSelectedMedicationGroupId] = useState('')
  const [selectedMedicationIds, setSelectedMedicationIds] = useState<string[]>([])
  const [selectedModuleIds, setSelectedModuleIds] = useState<string[]>([])
  const [visitContext, setVisitContext] = useState<VisitContext>(blankVisitContext)
  const [note, setNote] = useState('')

  const selectedDiagnosis = useMemo(
    () => contentPack.diagnoses.find((diagnosis) => diagnosis.id === selectedDiagnosisId),
    [contentPack.diagnoses, selectedDiagnosisId],
  )

  const medicationGroups = useMemo<MedicationGroup[]>(
    () =>
      unique(contentPack.medications.map((medication) => medication.groupId)).map((groupId) => {
        const items = contentPack.medications.filter((medication) => medication.groupId === groupId)
        const firstItem = items[0]

        return {
          id: groupId,
          label: firstItem?.groupLabel ?? groupId,
          description: firstItem?.groupDescription ?? '',
          items,
        }
      }),
    [contentPack.medications],
  )

  const recommendedMedicationIds = selectedDiagnosis?.relatedMedicationIds ?? []
  const recommendedModuleIds = selectedDiagnosis?.relatedModuleIds ?? []
  const recommendedMedicationGroupIds = useMemo(
    () =>
      unique(
        contentPack.medications
          .filter((medication) => recommendedMedicationIds.includes(medication.id))
          .map((medication) => medication.groupId),
      ),
    [contentPack.medications, recommendedMedicationIds],
  )

  const activeMedicationGroupId = medicationGroups.some((group) => group.id === selectedMedicationGroupId)
    ? selectedMedicationGroupId
    : recommendedMedicationGroupIds[0] ?? medicationGroups[0]?.id ?? ''

  const activeMedicationGroup = medicationGroups.find((group) => group.id === activeMedicationGroupId) ?? null

  const document = useMemo(
    () =>
      buildHandoutDocument(contentPack, {
        diagnosisIds: selectedDiagnosisId ? [selectedDiagnosisId] : [],
        medicationIds: selectedMedicationIds,
        selectedModuleIds,
        note,
        visitContext,
        contentVersion,
      }),
    [contentPack, contentVersion, note, selectedDiagnosisId, selectedMedicationIds, selectedModuleIds, visitContext],
  )

  const toggleSelection = (
    current: string[],
    id: string,
    setter: (ids: string[]) => void,
    limit: number,
  ) => {
    if (current.includes(id)) {
      setter(current.filter((item) => item !== id))
      return
    }

    if (current.length >= limit) {
      return
    }

    setter([...current, id])
  }

  const resetComposer = () => {
    setSelectedDiagnosisId('')
    setSelectedMedicationGroupId('')
    setSelectedMedicationIds([])
    setSelectedModuleIds([])
    setVisitContext(blankVisitContext)
    setNote('')
  }

  return (
    <div className="page">
      <section className="page-hero">
        <div>
          <p className="eyebrow">衛教建立</p>
          <h1>精神科個人化衛教單</h1>
          <p className="hero-copy">
            先用單頁思路組出最核心的診斷、藥物與心理生活重點，再把藥物細項與完整衛教留給列印版和病人端主題頁。
          </p>
        </div>
      </section>

      <div className="doctor-layout">
        <section className="composer-stack">
          <section className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">1. 診斷選擇</p>
                <h2>先決定主軸診斷</h2>
              </div>
            </div>
            <div className="selection-grid diagnosis-grid" role="radiogroup" aria-label="主軸診斷">
              {contentPack.diagnoses.map((diagnosis) => {
                const isActive = diagnosis.id === selectedDiagnosisId

                return (
                  <button
                    key={diagnosis.id}
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    className={`selection-card diagnosis-card compact-selection-card ${isActive ? 'active' : ''}`}
                    onClick={() => setSelectedDiagnosisId(diagnosis.id)}
                  >
                    <div className="selection-header">
                      <strong>{diagnosis.name}</strong>
                      {isActive ? (
                        <div className="selection-badges">
                          <span className="pill accent">已選取</span>
                        </div>
                      ) : null}
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
                <h2>先選藥物大類，再選細項</h2>
              </div>
              <span className="panel-meta">紙本最多顯示 2 個細項</span>
            </div>

            <div className="selection-grid medication-group-grid" role="radiogroup" aria-label="藥物大類">
              {medicationGroups.map((group) => {
                const isActive = group.id === activeMedicationGroupId
                const isRecommended = recommendedMedicationGroupIds.includes(group.id)

                return (
                  <button
                    key={group.id}
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    className={`selection-card medication-group-card compact-selection-card ${isActive ? 'active' : ''}`}
                    onClick={() => setSelectedMedicationGroupId(group.id)}
                  >
                    <div className="selection-header">
                      <strong>{group.label}</strong>
                      <div className="selection-badges">
                        {isRecommended ? <span className="pill accent">建議</span> : null}
                        {isActive ? <span className="pill subtle">目前展開</span> : null}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            {activeMedicationGroup ? (
              <div className="nested-selection-panel">
                <div className="nested-selection-heading">
                  <div>
                    <p className="eyebrow">藥物細項</p>
                    <h3>{activeMedicationGroup.label}</h3>
                  </div>
                  {selectedMedicationIds.length >= 2 ? (
                    <span className="panel-limit-note">已達上限，請先取消一個細項再加入新的。</span>
                  ) : null}
                </div>
                <div className="selection-grid medication-detail-grid" role="group" aria-label="藥物細項">
                  {activeMedicationGroup.items.map((medication) => {
                    const isActive = selectedMedicationIds.includes(medication.id)
                    const isRecommended = recommendedMedicationIds.includes(medication.id)

                    return (
                      <button
                        key={medication.id}
                        type="button"
                        aria-pressed={isActive}
                        disabled={!isActive && selectedMedicationIds.length >= 2}
                        className={`selection-card medication-detail-card compact-selection-card ${isActive ? 'active' : ''}`}
                        onClick={() => toggleSelection(selectedMedicationIds, medication.id, setSelectedMedicationIds, 2)}
                      >
                        <div className="selection-header">
                          <strong>{medication.name}</strong>
                          <div className="selection-badges">
                            {isRecommended ? <span className="pill accent">建議</span> : null}
                            {isActive ? <span className="pill subtle">已選取</span> : null}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : null}
          </section>

          <section className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">3. 心理與生活模組</p>
                <h2>醫師端先勾簡版，列印與病人端顯示完整版</h2>
              </div>
              <span className="panel-meta">建議 1 到 2 項</span>
            </div>

            {selectedModuleIds.length >= 2 ? (
              <p className="panel-limit-note">已達上限，紙本最多顯示 2 個模組，請保留最需要病人帶回家的內容。</p>
            ) : null}

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
                          aria-pressed={isActive}
                          disabled={!isActive && selectedModuleIds.length >= 2}
                          className={`selection-card module-card-panel ${isActive ? 'active' : ''}`}
                          onClick={() => toggleSelection(selectedModuleIds, module.id, setSelectedModuleIds, 2)}
                        >
                          <div className="selection-header">
                            <strong>{module.title}</strong>
                            <div className="selection-badges">
                              {isRecommended ? <span className="pill accent">建議</span> : null}
                              {isActive ? <span className="pill subtle">已選取</span> : null}
                            </div>
                          </div>
                          <p>{module.summary}</p>
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

            <div className="action-row panel-action-row">
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
