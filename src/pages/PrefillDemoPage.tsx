import { useMemo, useRef, useState } from 'react'
import { PREFILL_MESSAGE_TYPE, serializePrefillToQuery } from '../lib/prefill'
import { useContentPack } from '../content/useContentPack'
import type { PrefillPayload } from '../types/content'

const presets: Record<string, PrefillPayload> = {
  depressionFollowUp: {
    diagnosisIds: ['depression'],
    medicationIds: ['antidepressants'],
    selectedModuleIds: ['sleep-rhythm', 'family-communication'],
    visitContext: {
      careStage: '穩定追蹤',
      followUpPlan: '2 週後回診',
      emphasis: '規律服藥，若噁心加劇請提早聯絡',
    },
    sourceSystem: 'EDGE-HIS-DEMO',
  },
  insomniaAcute: {
    diagnosisIds: ['insomnia'],
    medicationIds: ['anxiolytics'],
    selectedModuleIds: ['sleep-rhythm', 'substance-reduction'],
    visitContext: {
      careStage: '初診',
      followUpPlan: '1 週後回診',
      emphasis: '白天避免補眠，晚上不要配酒服藥',
    },
    sourceSystem: 'EDGE-HIS-DEMO',
  },
  bipolarSupport: {
    diagnosisIds: ['bipolar'],
    medicationIds: ['mood-stabilizers', 'antipsychotics'],
    selectedModuleIds: ['family-communication', 'return-to-work'],
    visitContext: {
      careStage: '症狀調整期',
      followUpPlan: '1 到 2 週內追蹤抽血',
      emphasis: '若睡眠快速下降或情緒高漲，請提早就醫',
    },
    sourceSystem: 'EDGE-HIS-DEMO',
  },
}

export function PrefillDemoPage() {
  const { contentPack } = useContentPack()
  const [presetKey, setPresetKey] = useState<keyof typeof presets>('depressionFollowUp')
  const [messageStatus, setMessageStatus] = useState('尚未發送')
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const payload = presets[presetKey]
  const query = useMemo(() => serializePrefillToQuery(payload), [payload])
  const launchUrl = `/doctor/create?${query}`

  const sendMessage = () => {
    iframeRef.current?.contentWindow?.postMessage(
      {
        type: PREFILL_MESSAGE_TYPE,
        payload,
      },
      window.location.origin,
    )

    setMessageStatus(`已送出 ${PREFILL_MESSAGE_TYPE}`)
  }

  return (
    <div className="page">
      <section className="page-hero">
        <div>
          <p className="eyebrow">Integration Sandbox</p>
          <h1>HIS 預填模擬器</h1>
          <p className="hero-copy">
            用同一份 payload 同時測試 query-string fallback 與 postMessage。這頁可當 Edge 宿主頁串接前的驗證沙盒。
          </p>
        </div>
        <div className="hero-card">
          <span className="pill accent">同源 iframe 測試</span>
          <span className="pill subtle">無個資、只測介面契約</span>
        </div>
      </section>

      <div className="demo-layout">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Preset Payload</p>
              <h2>切換情境</h2>
            </div>
            <span className="panel-meta">{Object.keys(presets).length} 組示範資料</span>
          </div>

          <div className="chip-row">
            {Object.keys(presets).map((key) => (
              <button
                key={key}
                type="button"
                className={`pill-button ${presetKey === key ? 'active' : ''}`}
                onClick={() => setPresetKey(key as keyof typeof presets)}
              >
                {key}
              </button>
            ))}
          </div>

          <div className="field">
            <span>目前 payload</span>
            <pre className="code-block">{JSON.stringify(payload, null, 2)}</pre>
          </div>

          <div className="field">
            <span>query-string fallback</span>
            <code className="inline-code">{query}</code>
          </div>

          <div className="action-row">
            <button type="button" className="primary-button" onClick={sendMessage}>
              發送 postMessage 到右側 composer
            </button>
            <a href={launchUrl} target="_blank" rel="noreferrer" className="ghost-link-button">
              用 query string 開新視窗
            </a>
          </div>

          <div className="inline-banner compact">
            <div>
              <strong>目前狀態</strong>
              <p>{messageStatus}</p>
            </div>
          </div>

          <div className="contract-list">
            <h3>PrefillPayload</h3>
            <ul className="topic-list">
              <li><code>diagnosisIds[]</code>：主診斷 ids，MVP 取第一個為主軸。</li>
              <li><code>medicationIds[]</code>：要顯示在個人化藥物區塊的藥物類別。</li>
              <li><code>selectedModuleIds[]</code>：心理或生活模組 ids。</li>
              <li><code>visitContext</code>：照護階段、追蹤安排、強調重點。</li>
              <li><code>sourceSystem</code>：來源系統標記，用於頁面提示，不做持久化。</li>
            </ul>
          </div>

          <div className="contract-list">
            <h3>Edge 宿主頁範例</h3>
            <pre className="code-block">{`window.frames[0].postMessage({\n  type: '${PREFILL_MESSAGE_TYPE}',\n  payload\n}, window.location.origin)`}</pre>
          </div>
        </section>

        <section className="panel iframe-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Live Target</p>
              <h2>內嵌醫師端 composer</h2>
            </div>
            <span className="panel-meta">/doctor/create</span>
          </div>
          <iframe ref={iframeRef} title="Doctor composer demo" src="/doctor/create" className="demo-iframe" />
        </section>
      </div>

      <section className="panel patient-topic-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Public Patient Topics</p>
            <h2>病人端公開主題頁入口</h2>
          </div>
          <span className="panel-meta">供 QR code 延伸閱讀使用</span>
        </div>
        <div className="selection-grid diagnosis-grid">
          {contentPack.diagnoses.map((diagnosis) => (
            <a key={diagnosis.id} href={`/patient/topic/${diagnosis.slug}`} className="selection-card">
              <div className="selection-header">
                <strong>{diagnosis.name}</strong>
                <span className="pill subtle">公開頁</span>
              </div>
              <p>{diagnosis.coreSummary}</p>
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}
