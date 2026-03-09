import { QRCodeSVG } from 'qrcode.react'
import type { HandoutDocument } from '../types/content'

interface HandoutPreviewProps {
  document: HandoutDocument | null
}

export function HandoutPreview({ document }: HandoutPreviewProps) {
  if (!document) {
    return (
      <section className="preview-shell preview-empty" aria-live="polite">
        <p className="eyebrow">A4 預覽</p>
        <h2>選擇一個診斷後，這裡會即時生成門診衛教單。</h2>
        <p>
          預覽會依據診斷、藥物與勾選模組自動更新，列印時只保留右側紙張內容。
        </p>
      </section>
    )
  }

  let qrValue = document.qrPath
  try {
    const publicAppUrl = import.meta.env.VITE_PUBLIC_APP_URL?.trim()
    const publicOrigin = publicAppUrl ? new URL(publicAppUrl).toString() : window.location.origin
    const appBaseUrl = new URL(import.meta.env.BASE_URL, publicOrigin)
    qrValue = new URL(document.qrPath.replace(/^\//, ''), appBaseUrl).toString()
  } catch {
    // fallback to relative path
  }

  const sections: Record<string, React.ReactNode> = {
    diagnosis: (
      <section key="diagnosis" className="paper-section">
        <div className="paper-section-title">診斷摘要</div>
        <div className="paper-diagnosis-card">
          <div className="paper-callout">
            <strong>{document.diagnosis.name}</strong>
            <p>{document.diagnosis.coreSummary}</p>
          </div>
          <div className="paper-symptom-grid" aria-label="常見表現">
            {document.diagnosis.commonSymptoms.slice(0, 4).map((item) => (
              <span key={item} className="paper-chip">
                {item}
              </span>
            ))}
          </div>
          <p className="paper-support-note">{document.diagnosis.courseExpectation}</p>
        </div>
      </section>
    ),
    treatment: (
      <section key="treatment" className="paper-section">
        <div className="paper-section-title">目前治療方向</div>
        {document.emphasisNote ? (
          <div className="paper-emphasis-card">
            <span className="paper-emphasis-label">醫師強調重點</span>
            <p>{document.emphasisNote}</p>
          </div>
        ) : null}
        <div className="paper-info-card">
          <ul className="paper-list">
            {document.treatmentSummary.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>
    ),
    medication: (
      <section key="medication" className="paper-section">
        <div className="paper-section-title">藥物重點</div>
        {document.medications.length === 0 ? (
          <div className="paper-info-card">
            <p className="paper-note">本次未勾選藥物類別，可先用 QR code 讓病人回看完整主題頁。</p>
          </div>
        ) : (
          <div className="medication-grid">
            {document.medications.map((medication) => (
              <article key={medication.id} className="medication-card">
                <header>
                  <strong>{medication.name}</strong>
                  <span>{medication.classLabel}</span>
                </header>
                <p>{medication.shortSummary}</p>
                <div className="chip-row">
                  {medication.commonSideEffects.slice(0, 3).map((effect) => (
                    <span key={effect} className="chip warn">
                      {effect}
                    </span>
                  ))}
                </div>
                <ul className="paper-list compact-paper-list">
                  {medication.practicalTips.slice(0, 2).map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
                <p className="medication-alert">停藥提醒：{medication.discontinuationAdvice}</p>
              </article>
            ))}
          </div>
        )}
        {document.extraMedicationCount > 0 ? (
          <p className="paper-note">另有 {document.extraMedicationCount} 個藥物主題已收斂為 QR 延伸閱讀。</p>
        ) : null}
      </section>
    ),
    modules: (
      <section key="modules" className="paper-section">
        <div className="paper-section-title">心理與生活建議</div>
        {document.modules.length === 0 ? (
          <div className="paper-info-card">
            <p className="paper-note">本次未加入額外模組，可依病人需求補充睡眠、壓力或復學復工提醒。</p>
          </div>
        ) : (
          <div className="module-list">
            {document.modules.map((module) => (
              <article key={module.id} className="module-card">
                <strong>{module.title}</strong>
                <p>{module.patientSummary}</p>
                <ul className="paper-list compact-paper-list">
                  {module.practicalSteps.slice(0, 2).map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        )}
        {document.extraModuleCount > 0 ? (
          <p className="paper-note">另有 {document.extraModuleCount} 個模組已收斂為現場口頭補充與 QR 延伸閱讀。</p>
        ) : null}
      </section>
    ),
    urgent: (
      <section key="urgent" className="paper-section urgent-section">
        <div className="paper-section-title">何時盡快回診</div>
        <div className="paper-info-card">
          <ul className="paper-list">
            {document.urgentFlags.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>
    ),
    qr: (
      <section key="qr" className="paper-section qr-section">
        <div>
          <div className="paper-section-title">延伸閱讀</div>
          <p className="paper-note">
            掃描 QR code 可查看主題頁，回家後仍可複習診斷、藥物細項與心理生活模組。
          </p>
        </div>
        <div className="qr-card">
          <QRCodeSVG value={qrValue} size={96} level="M" includeMargin />
          <span>{document.diagnosis.name} 主題頁</span>
        </div>
      </section>
    ),
  }

  return (
    <section className="preview-shell">
      <div className="preview-toolbar">
        <div>
          <p className="eyebrow">A4 預覽</p>
          <h2>{document.title}</h2>
        </div>
        <span className="pill subtle">紙本一頁優先</span>
      </div>

      <article className="preview-paper" aria-label="個人化衛教單列印預覽">
        <header className="paper-header">
          <div>
            <h1>{document.title}</h1>
          </div>
          <div className="paper-meta">
            <span>{document.generatedAt}</span>
          </div>
        </header>

        {document.sectionOrder.map((key) => sections[key] ?? null)}
      </article>
    </section>
  )
}
