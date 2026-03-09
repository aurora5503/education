import { Link, useLocation, useParams } from 'react-router-dom'
import { getRelatedMedications, getTopicBySlug } from '../content/contentPack'
import { useContentPack } from '../content/useContentPack'

export function PatientTopicPage() {
  const { contentPack, contentVersion } = useContentPack()
  const { slug = '' } = useParams()
  const location = useLocation()
  const requestedVersion = new URLSearchParams(location.search).get('v')
  const isOutdatedContentVersion = Boolean(requestedVersion && requestedVersion !== contentVersion)
  const result = getTopicBySlug(contentPack, slug)
  const relatedMedications =
    result?.kind === 'diagnosis' ? getRelatedMedications(contentPack, result.topic.relatedMedicationIds) : []
  const relatedDiagnoses =
    result?.kind === 'medication'
      ? contentPack.diagnoses.filter((diagnosis) => result.topic.relatedDiagnosisIds.includes(diagnosis.id))
      : []

  if (!result) {
    return (
      <div className="page patient-page">
        <section className="page-hero patient-hero">
          <div>
            <p className="eyebrow">病人閱讀</p>
            <h1>找不到這份衛教內容</h1>
            <p className="hero-copy">這個 QR code 可能已更新，請回到門診衛教單重新掃描，或在下次回診時請醫師重新提供。</p>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="page patient-page">
      <section className="page-hero patient-hero">
        <div>
          <p className="eyebrow">病人閱讀</p>
          <h1>{result.topic.name}</h1>
          <p className="hero-copy">
            這一頁只保留回家複習需要的衛教重點，不包含個別病人資料，也不能取代你的回診與醫囑。
          </p>
        </div>
      </section>

      {isOutdatedContentVersion ? (
        <section className="inline-banner">
          <div>
            <strong>這份衛教內容已更新</strong>
            <p>目前顯示的是最新版內容；若你手上的紙本較早列印，細節可能和當時版本略有不同。</p>
          </div>
        </section>
      ) : null}

      {result.kind === 'diagnosis' ? (
        <>
          <section className="patient-summary-strip" aria-label="回家重點">
            <article className="patient-summary-card">
              <span className="patient-summary-label">回家先記得</span>
              <ul className="patient-summary-list">
                {result.topic.selfCareTips.slice(0, 3).map((item, index) => (
                  <li key={`${result.topic.id}-self-care-${index}`}>{item}</li>
                ))}
              </ul>
            </article>
            <article className="patient-summary-card patient-summary-card-urgent">
              <span className="patient-summary-label">這些情況請提早回診</span>
              <ul className="patient-summary-list">
                {result.topic.redFlags.slice(0, 3).map((item, index) => (
                  <li key={`${result.topic.id}-red-flag-${index}`}>{item}</li>
                ))}
              </ul>
            </article>
          </section>

          <div className="topic-layout">
            <section className="topic-main">
              <article className="topic-card">
                <h2>這是什麼</h2>
                <p>{result.topic.coreSummary}</p>
              </article>
              <article className="topic-card">
                <h2>常見表現</h2>
                <div className="topic-chip-grid">
                  {result.topic.commonSymptoms.map((item, index) => (
                    <span key={`${result.topic.id}-symptom-${index}`} className="chip">
                      {item}
                    </span>
                  ))}
                </div>
              </article>
              <article className="topic-card">
                <h2>治療通常怎麼進行</h2>
                <p>{result.topic.courseExpectation}</p>
                <ul className="topic-list">
                  {result.topic.treatmentFocus.map((item, index) => (
                    <li key={`${result.topic.id}-treatment-${index}`}>{item}</li>
                  ))}
                </ul>
              </article>
            </section>

            <aside className="topic-side">
              <article className="topic-card">
                <h2>常見迷思</h2>
                <ul className="topic-list">
                  {result.topic.myths.map((item, index) => (
                    <li key={`${result.topic.id}-myth-${index}`}>{item}</li>
                  ))}
                </ul>
              </article>
              <article className="topic-card">
                <h2>相關藥物主題</h2>
                <div className="link-stack">
                  {relatedMedications.length > 0 ? (
                    relatedMedications.map((medication) => (
                      <Link key={medication.id} to={`/patient/topic/${medication.slug}`} className="inline-link-card">
                        <strong>{medication.name}</strong>
                        <span>{medication.classLabel}</span>
                      </Link>
                    ))
                  ) : (
                    <p>目前沒有延伸藥物主題。</p>
                  )}
                </div>
              </article>
            </aside>
          </div>
        </>
      ) : (
        <>
          <section className="patient-summary-strip" aria-label="服藥重點">
            <article className="patient-summary-card">
              <span className="patient-summary-label">服藥先記得</span>
              <ul className="patient-summary-list">
                <li>{result.topic.missedDoseAdvice}</li>
                <li>{result.topic.discontinuationAdvice}</li>
              </ul>
            </article>
            <article className="patient-summary-card patient-summary-card-urgent">
              <span className="patient-summary-label">這些情況請回診確認</span>
              <ul className="patient-summary-list">
                {result.topic.whenToCall.slice(0, 3).map((item, index) => (
                  <li key={`${result.topic.id}-when-to-call-${index}`}>{item}</li>
                ))}
              </ul>
            </article>
          </section>

          <div className="topic-layout">
            <section className="topic-main">
              <article className="topic-card">
                <h2>這類藥物通常在做什麼</h2>
                <p>{result.topic.patientIntro}</p>
              </article>
              <article className="topic-card">
                <h2>常見用途</h2>
                <div className="topic-chip-grid">
                  {result.topic.indications.map((item, index) => (
                    <span key={`${result.topic.id}-indication-${index}`} className="chip">
                      {item}
                    </span>
                  ))}
                </div>
              </article>
              <article className="topic-card">
                <h2>療程與副作用</h2>
                <p>{result.topic.onset}</p>
                <div className="topic-columns">
                  <div>
                    <h3>常見副作用</h3>
                    <ul className="topic-list">
                      {result.topic.commonSideEffects.map((item, index) => (
                        <li key={`${result.topic.id}-common-side-effect-${index}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3>重要副作用</h3>
                    <ul className="topic-list">
                      {result.topic.seriousSideEffects.map((item, index) => (
                        <li key={`${result.topic.id}-serious-side-effect-${index}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            </section>

            <aside className="topic-side">
              <article className="topic-card">
                <h2>病人常問</h2>
                <div className="faq-stack">
                  {result.topic.faq.map((item, index) => (
                    <div key={`${result.topic.id}-faq-${index}`} className="faq-item">
                      <strong>{item.question}</strong>
                      <p>{item.answer}</p>
                    </div>
                  ))}
                </div>
              </article>
              <article className="topic-card">
                <h2>回到主題入口</h2>
                <div className="link-stack">
                  {relatedDiagnoses.length > 0 ? (
                    relatedDiagnoses.map((diagnosis) => (
                      <Link key={diagnosis.id} to={`/patient/topic/${diagnosis.slug}`} className="inline-link-card">
                        <strong>{diagnosis.name}</strong>
                        <span>{diagnosis.coreSummary}</span>
                      </Link>
                    ))
                  ) : (
                    <p>目前沒有其他主題可返回。</p>
                  )}
                </div>
              </article>
            </aside>
          </div>
        </>
      )}
    </div>
  )
}
