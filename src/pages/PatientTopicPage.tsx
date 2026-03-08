import { Link, useParams } from 'react-router-dom'
import { getRelatedMedications, getTopicBySlug } from '../content/contentPack'
import { useContentPack } from '../content/useContentPack'

export function PatientTopicPage() {
  const { contentPack } = useContentPack()
  const { slug = '' } = useParams()
  const result = getTopicBySlug(contentPack, slug)

  if (!result) {
    return (
      <div className="page">
        <section className="page-hero">
          <div>
            <p className="eyebrow">Patient Topic</p>
            <h1>找不到對應主題</h1>
            <p className="hero-copy">這個 QR code 可能已更新，請回到門診衛教單重新掃描，或直接回診確認。</p>
          </div>
          <Link to="/doctor/create" className="primary-link">
            返回醫師端首頁
          </Link>
        </section>
      </div>
    )
  }

  return (
    <div className="page">
      <section className="page-hero patient-hero">
        <div>
          <p className="eyebrow">Patient Reading</p>
          <h1>{result.topic.name}</h1>
          <p className="hero-copy">
            這是提供病人與家屬回家複習的一般衛教內容，不包含個別病人資料，也不能取代你的回診與醫囑。
          </p>
        </div>
        <div className="hero-card">
          <span className="pill subtle">公開簡版頁面</span>
          <span className="pill">不顯示個資</span>
        </div>
      </section>

      {result.kind === 'diagnosis' ? (
        <div className="topic-layout">
          <section className="topic-main">
            <article className="topic-card">
              <h2>這是什麼</h2>
              <p>{result.topic.coreSummary}</p>
            </article>
            <article className="topic-card">
              <h2>常見表現</h2>
              <div className="topic-chip-grid">
                {result.topic.commonSymptoms.map((item) => (
                  <span key={item} className="chip">
                    {item}
                  </span>
                ))}
              </div>
            </article>
            <article className="topic-card">
              <h2>治療通常怎麼進行</h2>
              <p>{result.topic.courseExpectation}</p>
              <ul className="topic-list">
                {result.topic.treatmentFocus.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <article className="topic-card warning-card">
              <h2>什麼情況要提早聯絡醫療團隊</h2>
              <ul className="topic-list">
                {result.topic.redFlags.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </section>

          <aside className="topic-side">
            <article className="topic-card">
              <h2>常見迷思</h2>
              <ul className="topic-list">
                {result.topic.myths.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <article className="topic-card">
              <h2>日常可先做到的事</h2>
              <ul className="topic-list">
                {result.topic.selfCareTips.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <article className="topic-card">
              <h2>相關藥物主題</h2>
              <div className="link-stack">
                {getRelatedMedications(contentPack, result.topic.relatedMedicationIds).map((medication) => (
                  <Link key={medication.id} to={`/patient/topic/${medication.slug}`} className="inline-link-card">
                    <strong>{medication.name}</strong>
                    <span>{medication.classLabel}</span>
                  </Link>
                ))}
              </div>
            </article>
          </aside>
        </div>
      ) : (
        <div className="topic-layout">
          <section className="topic-main">
            <article className="topic-card">
              <h2>這類藥物通常在做什麼</h2>
              <p>{result.topic.patientIntro}</p>
            </article>
            <article className="topic-card">
              <h2>常見用途</h2>
              <div className="topic-chip-grid">
                {result.topic.indications.map((item) => (
                  <span key={item} className="chip">
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
                    {result.topic.commonSideEffects.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3>重要副作用</h3>
                  <ul className="topic-list">
                    {result.topic.seriousSideEffects.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
            <article className="topic-card warning-card">
              <h2>漏藥或停藥提醒</h2>
              <p>{result.topic.missedDoseAdvice}</p>
              <p>{result.topic.discontinuationAdvice}</p>
            </article>
          </section>

          <aside className="topic-side">
            <article className="topic-card">
              <h2>什麼時候要回診確認</h2>
              <ul className="topic-list">
                {result.topic.whenToCall.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <article className="topic-card">
              <h2>病人常問</h2>
              <div className="faq-stack">
                {result.topic.faq.map((item) => (
                  <div key={item.question} className="faq-item">
                    <strong>{item.question}</strong>
                    <p>{item.answer}</p>
                  </div>
                ))}
              </div>
            </article>
            <article className="topic-card">
              <h2>回到主題入口</h2>
              <div className="link-stack">
                {contentPack.diagnoses
                  .filter((diagnosis) => result.topic.relatedDiagnosisIds.includes(diagnosis.id))
                  .map((diagnosis) => (
                    <Link key={diagnosis.id} to={`/patient/topic/${diagnosis.slug}`} className="inline-link-card">
                      <strong>{diagnosis.name}</strong>
                      <span>{diagnosis.coreSummary}</span>
                    </Link>
                  ))}
              </div>
            </article>
          </aside>
        </div>
      )}
    </div>
  )
}
