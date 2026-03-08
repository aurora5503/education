import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useContentPack } from '../content/useContentPack'
import type { ContentPack } from '../types/content'
import type { CareModule, DiagnosisTopic, MedicationTopic } from '../types/content'

type EditorSection = 'diagnoses' | 'medications' | 'modules'

const sectionLabels: Record<EditorSection, string> = {
  diagnoses: '症況主題',
  medications: '藥物主題',
  modules: '衛教模組',
}

const listToText = (items: string[]) => items.join('\n')

const textToList = (value: string) =>
  value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')

const createId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`

const createUniqueSlug = (existingSlugs: string[], baseValue: string) => {
  const baseSlug = slugify(baseValue) || 'item'

  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug
  }

  let counter = 2
  let nextSlug = `${baseSlug}-${counter}`

  while (existingSlugs.includes(nextSlug)) {
    counter += 1
    nextSlug = `${baseSlug}-${counter}`
  }

  return nextSlug
}

const toggleRelatedId = (current: string[], id: string) =>
  current.includes(id) ? current.filter((item) => item !== id) : [...current, id]

export function ContentEditorPage() {
  const { contentPack, updateContentPack, importContentPack, restoreDefaults, exportContentPack, hasLocalChanges } =
    useContentPack()
  const [section, setSection] = useState<EditorSection>('diagnoses')
  const [selectedDiagnosisId, setSelectedDiagnosisId] = useState(contentPack.diagnoses[0]?.id ?? '')
  const [selectedMedicationId, setSelectedMedicationId] = useState(contentPack.medications[0]?.id ?? '')
  const [selectedModuleId, setSelectedModuleId] = useState(contentPack.modules[0]?.id ?? '')
  const [copyStatus, setCopyStatus] = useState('尚未匯出')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const activeDiagnosisId = contentPack.diagnoses.some((item) => item.id === selectedDiagnosisId)
    ? selectedDiagnosisId
    : contentPack.diagnoses[0]?.id ?? ''

  const activeMedicationId = contentPack.medications.some((item) => item.id === selectedMedicationId)
    ? selectedMedicationId
    : contentPack.medications[0]?.id ?? ''

  const activeModuleId = contentPack.modules.some((item) => item.id === selectedModuleId)
    ? selectedModuleId
    : contentPack.modules[0]?.id ?? ''

  const currentDiagnosis = useMemo(
    () => contentPack.diagnoses.find((item) => item.id === activeDiagnosisId) ?? contentPack.diagnoses[0],
    [activeDiagnosisId, contentPack.diagnoses],
  )

  const currentMedication = useMemo(
    () => contentPack.medications.find((item) => item.id === activeMedicationId) ?? contentPack.medications[0],
    [activeMedicationId, contentPack.medications],
  )

  const currentModule = useMemo(
    () => contentPack.modules.find((item) => item.id === activeModuleId) ?? contentPack.modules[0],
    [activeModuleId, contentPack.modules],
  )

  const updateDiagnosis = (id: string, updater: (item: DiagnosisTopic) => DiagnosisTopic) => {
    updateContentPack((current) => ({
      ...current,
      diagnoses: current.diagnoses.map((item) => (item.id === id ? updater(item) : item)),
    }))
  }

  const updateMedication = (id: string, updater: (item: MedicationTopic) => MedicationTopic) => {
    updateContentPack((current) => ({
      ...current,
      medications: current.medications.map((item) => (item.id === id ? updater(item) : item)),
    }))
  }

  const updateModule = (id: string, updater: (item: CareModule) => CareModule) => {
    updateContentPack((current) => ({
      ...current,
      modules: current.modules.map((item) => (item.id === id ? updater(item) : item)),
    }))
  }

  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(exportContentPack())
      setCopyStatus('JSON 已複製到剪貼簿')
    } catch {
      setCopyStatus('瀏覽器不允許剪貼簿，請改用開發者工具複製')
    }
  }

  const downloadJson = () => {
    const blob = new Blob([exportContentPack()], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const stamp = new Date().toISOString().slice(0, 10)

    link.href = url
    link.download = `psyedu-content-${stamp}.json`
    link.click()
    URL.revokeObjectURL(url)
    setCopyStatus('JSON 檔已下載')
  }

  const openImportPicker = () => {
    fileInputRef.current?.click()
  }

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const confirmed = window.confirm('匯入 JSON 會覆蓋目前這台電腦上的自訂內容，是否繼續？')

    if (!confirmed) {
      event.target.value = ''
      return
    }

    try {
      const raw = await file.text()
      const parsed = JSON.parse(raw) as ContentPack
      importContentPack(parsed)
      setCopyStatus(`已匯入 ${file.name}`)
    } catch {
      setCopyStatus('匯入失敗，請確認檔案是正確的 JSON')
    } finally {
      event.target.value = ''
    }
  }

  const addDiagnosis = () => {
    const id = createId('diagnosis')
    const slug = createUniqueSlug(
      contentPack.diagnoses.map((item) => item.slug),
      `new-diagnosis-${contentPack.diagnoses.length + 1}`,
    )
    const nextItem: DiagnosisTopic = {
      id,
      slug,
      name: `新疾病主題 ${contentPack.diagnoses.length + 1}`,
      coreSummary: '請填入這個疾病主題的核心說明。',
      commonSymptoms: ['請填入常見症狀'],
      courseExpectation: '請填入病程與治療期待。',
      redFlags: ['請填入需要提早回診或求助的情況'],
      myths: ['請填入常見迷思'],
      treatmentFocus: ['請填入治療重點'],
      selfCareTips: ['請填入病人可先做到的事'],
      relatedMedicationIds: [],
      relatedModuleIds: [],
    }

    updateContentPack((current) => ({
      ...current,
      diagnoses: [...current.diagnoses, nextItem],
    }))
    setSelectedDiagnosisId(id)
    setSection('diagnoses')
  }

  const addMedication = () => {
    const id = createId('medication')
    const slug = createUniqueSlug(
      contentPack.medications.map((item) => item.slug),
      `medication-${contentPack.medications.length + 1}`,
    )
    const nextItem: MedicationTopic = {
      id,
      slug,
      name: `新藥物主題 ${contentPack.medications.length + 1}`,
      classLabel: '請填入藥物分類',
      patientIntro: '請填入病人版簡介。',
      indications: ['請填入常見用途'],
      onset: '請填入起效時間與療程說明。',
      commonSideEffects: ['請填入常見副作用'],
      seriousSideEffects: ['請填入重要副作用'],
      missedDoseAdvice: '請填入漏藥提醒。',
      discontinuationAdvice: '請填入停藥提醒。',
      whenToCall: ['請填入需要聯絡醫療團隊的情況'],
      faq: [{ question: '常見問題', answer: '請填入回答。' }],
      relatedDiagnosisIds: [],
    }

    updateContentPack((current) => ({
      ...current,
      medications: [...current.medications, nextItem],
    }))
    setSelectedMedicationId(id)
    setSection('medications')
  }

  const addModule = () => {
    const id = createId('module')
    const nextItem: CareModule = {
      id,
      kind: 'lifestyle',
      title: `新衛教模組 ${contentPack.modules.length + 1}`,
      summary: '請填入這個模組想傳達的摘要。',
      bullets: ['請填入一個重點'],
      tags: ['自訂模組'],
    }

    updateContentPack((current) => ({
      ...current,
      modules: [...current.modules, nextItem],
    }))
    setSelectedModuleId(id)
    setSection('modules')
  }

  const removeDiagnosis = (id: string) => {
    const target = contentPack.diagnoses.find((item) => item.id === id)
    if (!target) {
      return
    }

    const confirmed = window.confirm(`要刪除「${target.name}」嗎？這會一起影響醫師端與病人端顯示。`)
    if (!confirmed) {
      return
    }

    updateContentPack((current) => ({
      ...current,
      diagnoses: current.diagnoses.filter((item) => item.id !== id),
      medications: current.medications.map((item) => ({
        ...item,
        relatedDiagnosisIds: item.relatedDiagnosisIds.filter((diagnosisId) => diagnosisId !== id),
      })),
    }))
  }

  const removeMedication = (id: string) => {
    const target = contentPack.medications.find((item) => item.id === id)
    if (!target) {
      return
    }

    const confirmed = window.confirm(`要刪除「${target.name}」嗎？相關疾病不會再推薦這個藥物主題。`)
    if (!confirmed) {
      return
    }

    updateContentPack((current) => ({
      ...current,
      medications: current.medications.filter((item) => item.id !== id),
      diagnoses: current.diagnoses.map((item) => ({
        ...item,
        relatedMedicationIds: item.relatedMedicationIds.filter((medicationId) => medicationId !== id),
      })),
    }))
  }

  const removeModule = (id: string) => {
    const target = contentPack.modules.find((item) => item.id === id)
    if (!target) {
      return
    }

    const confirmed = window.confirm(`要刪除「${target.title}」嗎？相關疾病不會再推薦這個衛教模組。`)
    if (!confirmed) {
      return
    }

    updateContentPack((current) => ({
      ...current,
      modules: current.modules.filter((item) => item.id !== id),
      diagnoses: current.diagnoses.map((item) => ({
        ...item,
        relatedModuleIds: item.relatedModuleIds.filter((moduleId) => moduleId !== id),
      })),
    }))
  }

  return (
    <div className="page">
      <section className="page-hero editor-hero">
        <div>
          <p className="eyebrow">內容管理</p>
          <h1>把現成衛教內容改成你自己的版本</h1>
          <p className="hero-copy">
            這頁會先讀伺服器上的 JSON 當全站基準內容，再把你這台電腦的修改當成本機暫存。要正式部署時，只要更新伺服器 JSON。
          </p>
        </div>
        <div className="hero-card editor-status-card">
          <span className={`pill ${hasLocalChanges ? 'accent' : 'subtle'}`}>
            {hasLocalChanges ? '目前有本機暫存版本' : '目前與伺服器版本一致'}
          </span>
          <span className="pill subtle">單一使用者</span>
          <span className="pill subtle">伺服器 JSON 優先</span>
        </div>
      </section>

      <section className="editor-summary-grid">
        <article className="topic-card">
          <p className="eyebrow">目前資料</p>
          <h2>{contentPack.diagnoses.length} 個症況主題</h2>
          <p>會同步影響醫師端建立頁、列印預覽與病人端主題頁。</p>
        </article>
        <article className="topic-card">
          <p className="eyebrow">快速操作</p>
          <div className="action-row">
            <button type="button" className="primary-button" onClick={downloadJson}>
              下載 JSON
            </button>
            <button type="button" className="ghost-button" onClick={openImportPicker}>
              匯入 JSON
            </button>
            <button type="button" className="ghost-button" onClick={copyJson}>
              複製 JSON
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="sr-only"
              onChange={handleImportFile}
            />
            <button type="button" className="ghost-button" onClick={restoreDefaults}>
              還原預設內容
            </button>
          </div>
          <p className="editor-status-note">{copyStatus}</p>
        </article>
        <article className="topic-card">
          <p className="eyebrow">切換查看</p>
          <div className="action-row">
            <Link to="/doctor/create" className="ghost-link-button">
              看醫師端預覽
            </Link>
            {currentDiagnosis ? (
              <Link to={`/patient/topic/${currentDiagnosis.slug}`} className="ghost-link-button">
                看病人端頁面
              </Link>
            ) : null}
          </div>
        </article>
      </section>

      <div className="editor-layout">
        <section className="panel editor-sidebar">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">編輯區域</p>
              <h2>選一個編輯區</h2>
            </div>
          </div>

          <div className="editor-section-tabs">
            {(Object.keys(sectionLabels) as EditorSection[]).map((key) => (
              <button
                key={key}
                type="button"
                className={`pill-button ${section === key ? 'active' : ''}`}
                onClick={() => setSection(key)}
              >
                {sectionLabels[key]}
              </button>
            ))}
          </div>

          <div className="action-row">
            {section === 'diagnoses' ? (
              <button type="button" className="primary-button" onClick={addDiagnosis}>
                新增疾病主題
              </button>
            ) : null}
            {section === 'medications' ? (
              <button type="button" className="primary-button" onClick={addMedication}>
                新增藥物主題
              </button>
            ) : null}
            {section === 'modules' ? (
              <button type="button" className="primary-button" onClick={addModule}>
                新增衛教模組
              </button>
            ) : null}
          </div>

          {section === 'diagnoses' ? (
            <div className="editor-item-list">
              {contentPack.diagnoses.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`editor-item-button ${item.id === activeDiagnosisId ? 'active' : ''}`}
                  onClick={() => setSelectedDiagnosisId(item.id)}
                >
                  <strong>{item.name}</strong>
                  <span>{item.slug}</span>
                </button>
              ))}
            </div>
          ) : null}

          {section === 'medications' ? (
            <div className="editor-item-list">
              {contentPack.medications.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`editor-item-button ${item.id === activeMedicationId ? 'active' : ''}`}
                  onClick={() => setSelectedMedicationId(item.id)}
                >
                  <strong>{item.name}</strong>
                  <span>{item.classLabel}</span>
                </button>
              ))}
            </div>
          ) : null}

          {section === 'modules' ? (
            <div className="editor-item-list">
              {contentPack.modules.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`editor-item-button ${item.id === activeModuleId ? 'active' : ''}`}
                  onClick={() => setSelectedModuleId(item.id)}
                >
                  <strong>{item.title}</strong>
                  <span>{item.kind === 'counseling' ? '心理與追蹤' : '生活與功能'}</span>
                </button>
              ))}
            </div>
          ) : null}
        </section>

        <section className="panel editor-form-panel">
          {section === 'diagnoses' && currentDiagnosis ? (
            <div className="editor-form-stack">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">疾病主題</p>
                  <h2>{currentDiagnosis.name}</h2>
                </div>
                <div className="editor-heading-actions">
                  <span className="panel-meta">{currentDiagnosis.slug}</span>
                  <button type="button" className="ghost-button" onClick={() => removeDiagnosis(currentDiagnosis.id)}>
                    刪除疾病
                  </button>
                </div>
              </div>

              <div className="field-grid">
                <label className="field">
                  <span>顯示名稱</span>
                  <input
                    value={currentDiagnosis.name}
                    onChange={(event) =>
                      updateDiagnosis(currentDiagnosis.id, (item) => ({ ...item, name: event.target.value }))
                    }
                  />
                </label>
                <label className="field">
                  <span>病人端 slug</span>
                  <input
                    value={currentDiagnosis.slug}
                    onChange={(event) =>
                      updateDiagnosis(currentDiagnosis.id, (item) => ({
                        ...item,
                        slug: createUniqueSlug(
                          contentPack.diagnoses
                            .filter((entry) => entry.id !== item.id)
                            .map((entry) => entry.slug),
                          event.target.value,
                        ),
                      }))
                    }
                  />
                </label>
              </div>

              <label className="field">
                <span>核心摘要</span>
                <textarea
                  rows={4}
                  value={currentDiagnosis.coreSummary}
                  onChange={(event) =>
                    updateDiagnosis(currentDiagnosis.id, (item) => ({ ...item, coreSummary: event.target.value }))
                  }
                />
              </label>

              <label className="field">
                <span>病程期待</span>
                <textarea
                  rows={4}
                  value={currentDiagnosis.courseExpectation}
                  onChange={(event) =>
                    updateDiagnosis(currentDiagnosis.id, (item) => ({
                      ...item,
                      courseExpectation: event.target.value,
                    }))
                  }
                />
              </label>

              <div className="editor-long-grid">
                <label className="field">
                  <span>常見症狀</span>
                  <textarea
                    rows={6}
                    value={listToText(currentDiagnosis.commonSymptoms)}
                    onChange={(event) =>
                      updateDiagnosis(currentDiagnosis.id, (item) => ({
                        ...item,
                        commonSymptoms: textToList(event.target.value),
                      }))
                    }
                  />
                </label>
                <label className="field">
                  <span>需要提早聯絡醫療團隊</span>
                  <textarea
                    rows={6}
                    value={listToText(currentDiagnosis.redFlags)}
                    onChange={(event) =>
                      updateDiagnosis(currentDiagnosis.id, (item) => ({
                        ...item,
                        redFlags: textToList(event.target.value),
                      }))
                    }
                  />
                </label>
                <label className="field">
                  <span>常見迷思</span>
                  <textarea
                    rows={6}
                    value={listToText(currentDiagnosis.myths)}
                    onChange={(event) =>
                      updateDiagnosis(currentDiagnosis.id, (item) => ({ ...item, myths: textToList(event.target.value) }))
                    }
                  />
                </label>
                <label className="field">
                  <span>治療重點</span>
                  <textarea
                    rows={6}
                    value={listToText(currentDiagnosis.treatmentFocus)}
                    onChange={(event) =>
                      updateDiagnosis(currentDiagnosis.id, (item) => ({
                        ...item,
                        treatmentFocus: textToList(event.target.value),
                      }))
                    }
                  />
                </label>
                <label className="field">
                  <span>病人可先做到的事</span>
                  <textarea
                    rows={6}
                    value={listToText(currentDiagnosis.selfCareTips)}
                    onChange={(event) =>
                      updateDiagnosis(currentDiagnosis.id, (item) => ({
                        ...item,
                        selfCareTips: textToList(event.target.value),
                      }))
                    }
                  />
                </label>
              </div>

              <div className="editor-recommendation-grid">
                <article className="editor-recommendation-card">
                  <div className="editor-inline-heading">
                    <h3>建議藥物主題</h3>
                    <span className="panel-meta">醫師端選這個疾病時會標示「建議」</span>
                  </div>
                  <div className="editor-checklist">
                    {contentPack.medications.map((medication) => {
                      const checked = currentDiagnosis.relatedMedicationIds.includes(medication.id)

                      return (
                        <label key={medication.id} className={`editor-check-item ${checked ? 'active' : ''}`}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              updateDiagnosis(currentDiagnosis.id, (item) => ({
                                ...item,
                                relatedMedicationIds: toggleRelatedId(item.relatedMedicationIds, medication.id),
                              }))
                            }
                          />
                          <div>
                            <strong>{medication.name}</strong>
                            <span>{medication.classLabel}</span>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                </article>

                <article className="editor-recommendation-card">
                  <div className="editor-inline-heading">
                    <h3>建議衛教模組</h3>
                    <span className="panel-meta">會在醫師端模組區塊標示「建議」</span>
                  </div>
                  <div className="editor-checklist">
                    {contentPack.modules.map((module) => {
                      const checked = currentDiagnosis.relatedModuleIds.includes(module.id)

                      return (
                        <label key={module.id} className={`editor-check-item ${checked ? 'active' : ''}`}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              updateDiagnosis(currentDiagnosis.id, (item) => ({
                                ...item,
                                relatedModuleIds: toggleRelatedId(item.relatedModuleIds, module.id),
                              }))
                            }
                          />
                          <div>
                            <strong>{module.title}</strong>
                            <span>{module.kind === 'counseling' ? '心理與追蹤' : '生活與功能'}</span>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                </article>
              </div>
            </div>
          ) : null}

          {section === 'medications' && currentMedication ? (
            <div className="editor-form-stack">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">藥物主題</p>
                  <h2>{currentMedication.name}</h2>
                </div>
                <div className="editor-heading-actions">
                  <span className="panel-meta">{currentMedication.slug}</span>
                  <button type="button" className="ghost-button" onClick={() => removeMedication(currentMedication.id)}>
                    刪除藥物
                  </button>
                </div>
              </div>

              <div className="field-grid">
                <label className="field">
                  <span>顯示名稱</span>
                  <input
                    value={currentMedication.name}
                    onChange={(event) =>
                      updateMedication(currentMedication.id, (item) => ({ ...item, name: event.target.value }))
                    }
                  />
                </label>
                <label className="field">
                  <span>分類標籤</span>
                  <input
                    value={currentMedication.classLabel}
                    onChange={(event) =>
                      updateMedication(currentMedication.id, (item) => ({ ...item, classLabel: event.target.value }))
                    }
                  />
                </label>
                <label className="field">
                  <span>病人端 slug</span>
                  <input
                    value={currentMedication.slug}
                    onChange={(event) =>
                      updateMedication(currentMedication.id, (item) => ({
                        ...item,
                        slug: createUniqueSlug(
                          contentPack.medications
                            .filter((entry) => entry.id !== item.id)
                            .map((entry) => entry.slug),
                          event.target.value,
                        ),
                      }))
                    }
                  />
                </label>
              </div>

              <label className="field">
                <span>病人版簡介</span>
                <textarea
                  rows={4}
                  value={currentMedication.patientIntro}
                  onChange={(event) =>
                    updateMedication(currentMedication.id, (item) => ({
                      ...item,
                      patientIntro: event.target.value,
                    }))
                  }
                />
              </label>

              <label className="field">
                <span>起效與療程描述</span>
                <textarea
                  rows={3}
                  value={currentMedication.onset}
                  onChange={(event) =>
                    updateMedication(currentMedication.id, (item) => ({ ...item, onset: event.target.value }))
                  }
                />
              </label>

              <div className="editor-long-grid">
                <label className="field">
                  <span>常見用途</span>
                  <textarea
                    rows={5}
                    value={listToText(currentMedication.indications)}
                    onChange={(event) =>
                      updateMedication(currentMedication.id, (item) => ({
                        ...item,
                        indications: textToList(event.target.value),
                      }))
                    }
                  />
                </label>
                <label className="field">
                  <span>常見副作用</span>
                  <textarea
                    rows={5}
                    value={listToText(currentMedication.commonSideEffects)}
                    onChange={(event) =>
                      updateMedication(currentMedication.id, (item) => ({
                        ...item,
                        commonSideEffects: textToList(event.target.value),
                      }))
                    }
                  />
                </label>
                <label className="field">
                  <span>重要副作用</span>
                  <textarea
                    rows={5}
                    value={listToText(currentMedication.seriousSideEffects)}
                    onChange={(event) =>
                      updateMedication(currentMedication.id, (item) => ({
                        ...item,
                        seriousSideEffects: textToList(event.target.value),
                      }))
                    }
                  />
                </label>
                <label className="field">
                  <span>什麼時候要回診確認</span>
                  <textarea
                    rows={5}
                    value={listToText(currentMedication.whenToCall)}
                    onChange={(event) =>
                      updateMedication(currentMedication.id, (item) => ({
                        ...item,
                        whenToCall: textToList(event.target.value),
                      }))
                    }
                  />
                </label>
              </div>

              <div className="field-grid">
                <label className="field">
                  <span>漏藥提醒</span>
                  <textarea
                    rows={4}
                    value={currentMedication.missedDoseAdvice}
                    onChange={(event) =>
                      updateMedication(currentMedication.id, (item) => ({
                        ...item,
                        missedDoseAdvice: event.target.value,
                      }))
                    }
                  />
                </label>
                <label className="field">
                  <span>停藥提醒</span>
                  <textarea
                    rows={4}
                    value={currentMedication.discontinuationAdvice}
                    onChange={(event) =>
                      updateMedication(currentMedication.id, (item) => ({
                        ...item,
                        discontinuationAdvice: event.target.value,
                      }))
                    }
                  />
                </label>
              </div>

              <div className="editor-faq-stack">
                <div className="editor-inline-heading">
                  <h3>病人常問</h3>
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() =>
                      updateMedication(currentMedication.id, (item) => ({
                        ...item,
                        faq: [...item.faq, { question: '新的常見問題', answer: '請填入回答。' }],
                      }))
                    }
                  >
                    新增 FAQ
                  </button>
                </div>

                {currentMedication.faq.map((faqItem, index) => (
                  <div key={`${currentMedication.id}-${index}`} className="editor-faq-card">
                    <label className="field">
                      <span>問題</span>
                      <input
                        value={faqItem.question}
                        onChange={(event) =>
                          updateMedication(currentMedication.id, (item) => ({
                            ...item,
                            faq: item.faq.map((entry, faqIndex) =>
                              faqIndex === index ? { ...entry, question: event.target.value } : entry,
                            ),
                          }))
                        }
                      />
                    </label>
                    <label className="field">
                      <span>回答</span>
                      <textarea
                        rows={3}
                        value={faqItem.answer}
                        onChange={(event) =>
                          updateMedication(currentMedication.id, (item) => ({
                            ...item,
                            faq: item.faq.map((entry, faqIndex) =>
                              faqIndex === index ? { ...entry, answer: event.target.value } : entry,
                            ),
                          }))
                        }
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {section === 'modules' && currentModule ? (
            <div className="editor-form-stack">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">衛教模組</p>
                  <h2>{currentModule.title}</h2>
                </div>
                <div className="editor-heading-actions">
                  <span className="panel-meta">{currentModule.kind === 'counseling' ? '心理與追蹤' : '生活與功能'}</span>
                  <button type="button" className="ghost-button" onClick={() => removeModule(currentModule.id)}>
                    刪除模組
                  </button>
                </div>
              </div>

              <div className="field-grid">
                <label className="field">
                  <span>標題</span>
                  <input
                    value={currentModule.title}
                    onChange={(event) =>
                      updateModule(currentModule.id, (item) => ({ ...item, title: event.target.value }))
                    }
                  />
                </label>
                <label className="field">
                  <span>模組分類</span>
                  <select
                    value={currentModule.kind}
                    onChange={(event) =>
                      updateModule(currentModule.id, (item) => ({
                        ...item,
                        kind: event.target.value as CareModule['kind'],
                      }))
                    }
                  >
                    <option value="counseling">心理與追蹤</option>
                    <option value="lifestyle">生活與功能</option>
                  </select>
                </label>
              </div>

              <label className="field">
                <span>摘要</span>
                <textarea
                  rows={4}
                  value={currentModule.summary}
                  onChange={(event) =>
                    updateModule(currentModule.id, (item) => ({ ...item, summary: event.target.value }))
                  }
                />
              </label>

              <div className="field-grid">
                <label className="field">
                  <span>重點條列</span>
                  <textarea
                    rows={7}
                    value={listToText(currentModule.bullets)}
                    onChange={(event) =>
                      updateModule(currentModule.id, (item) => ({ ...item, bullets: textToList(event.target.value) }))
                    }
                  />
                </label>
                <label className="field">
                  <span>標籤</span>
                  <textarea
                    rows={7}
                    value={listToText(currentModule.tags)}
                    onChange={(event) =>
                      updateModule(currentModule.id, (item) => ({ ...item, tags: textToList(event.target.value) }))
                    }
                  />
                </label>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  )
}
