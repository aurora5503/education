import type { ContentPack, DiagnosisTopic, MedicationTopic } from '../types/content'

const diagnoses: DiagnosisTopic[] = [
  {
    id: 'depression',
    slug: 'major-depression',
    name: '憂鬱症',
    coreSummary:
      '憂鬱症不只是心情不好，而是情緒、睡眠、專注力與身體能量一起受到影響的疾病，通常需要連續幾週到數月的規律治療。',
    commonSymptoms: ['情緒低落', '興趣下降', '睡眠改變', '食慾波動', '疲倦與注意力下降'],
    courseExpectation:
      '多數人在規律服藥與持續追蹤後，2 到 6 週內可先看到部分改善，完整恢復通常需要更長時間。',
    redFlags: ['出現自傷或自殺想法', '完全無法進食或起床', '突然極度激動或混亂'],
    myths: ['不是意志力差', '症狀好轉後也不建議自行停藥', '身體不舒服與憂鬱可能互相影響'],
    treatmentFocus: ['規律服藥比頻繁換藥更重要', '合併心理治療可降低復發', '先把睡眠與作息穩住，治療效果通常更好'],
    selfCareTips: ['每天固定起床時間', '用簡單任務恢復節奏', '把情緒變化告訴家人或醫療團隊'],
    relatedMedicationIds: ['antidepressants', 'anxiolytics'],
    relatedModuleIds: ['sleep-rhythm', 'stress-regulation', 'family-communication'],
  },
  {
    id: 'anxiety',
    slug: 'anxiety-disorder',
    name: '焦慮症',
    coreSummary:
      '焦慮症會讓大腦長時間處於警覺模式，常表現為坐立不安、胸悶、心悸、反覆擔心與難以放鬆。',
    commonSymptoms: ['過度擔心', '心悸胸悶', '肌肉緊繃', '腸胃不適', '睡眠淺與易醒'],
    courseExpectation:
      '若能及早辨識誘發情境並配合藥物或心理介入，多數症狀可逐步下降，治療需要持續練習而非一次見效。',
    redFlags: ['恐慌發作頻率明顯增加', '因焦慮無法上班上學', '合併明顯憂鬱或自傷念頭'],
    myths: ['焦慮不是想太多而已', '呼吸訓練要反覆練習才會有用', '短效安眠鎮定藥不等於長期唯一治療'],
    treatmentFocus: ['先建立可重複使用的放鬆工具', '藥物與心理治療常需並行', '避免把所有生理不適都解讀成危險'],
    selfCareTips: ['練習慢呼吸和肌肉放鬆', '減少咖啡因與能量飲', '記錄最常出現焦慮的場景'],
    relatedMedicationIds: ['antidepressants', 'anxiolytics'],
    relatedModuleIds: ['stress-regulation', 'therapy-engagement', 'substance-reduction'],
  },
  {
    id: 'insomnia',
    slug: 'insomnia',
    name: '失眠症',
    coreSummary:
      '失眠常與壓力、作息混亂、焦慮憂鬱或生理節律失衡有關，重點不是只靠安眠藥入睡，而是重建穩定睡眠訊號。',
    commonSymptoms: ['入睡困難', '夜間易醒', '太早醒', '白天疲倦', '對睡眠過度焦慮'],
    courseExpectation:
      '睡眠改善通常先從固定作息與減少錯誤補眠開始，再搭配短期藥物或行為治療，效果會比單靠加藥穩定。',
    redFlags: ['連續多日幾乎無法入睡', '合併躁期表現', '日間嗜睡造成安全風險'],
    myths: ['躺久不等於休息到', '酒精不能當安眠方法', '失眠治療不一定需要長期吃藥'],
    treatmentFocus: ['縮短躺床清醒時間', '建立固定起床點比固定睡著時間更重要', '必要時短期用藥，但同步調整睡眠習慣'],
    selfCareTips: ['晚間減少藍光與滑手機', '白天保留固定活動量', '中午後避免茶咖啡與尼古丁'],
    relatedMedicationIds: ['anxiolytics', 'antidepressants'],
    relatedModuleIds: ['sleep-rhythm', 'stress-regulation', 'substance-reduction'],
  },
  {
    id: 'bipolar',
    slug: 'bipolar-disorder',
    name: '雙相情緒障礙',
    coreSummary:
      '雙相情緒障礙會在憂鬱期與躁期或輕躁期之間波動，治療重點是穩定情緒週期，避免只治單一階段而忽略整體病程。',
    commonSymptoms: ['情緒起伏大', '睡眠需求下降', '衝動消費', '語速變快', '憂鬱與倦怠期交替'],
    courseExpectation:
      '情緒穩定通常需要較長期追蹤與規律用藥，早期辨識躁期前兆可大幅降低住院或功能受損風險。',
    redFlags: ['幾乎不睡仍精力旺盛', '衝動行為快速增加', '出現幻聽妄想或明顯判斷力下降'],
    myths: ['情緒很好不一定代表恢復', '只在低潮時吃藥通常不夠', '家屬觀察到的前兆很有價值'],
    treatmentFocus: ['規律服用情緒穩定藥是核心', '睡眠長短常是最早警訊', '需要和家屬一起建立前兆清單'],
    selfCareTips: ['固定睡眠節律', '避免熬夜與酒精', '事先約定躁期時的求助方式'],
    relatedMedicationIds: ['mood-stabilizers', 'antipsychotics'],
    relatedModuleIds: ['sleep-rhythm', 'family-communication', 'return-to-work'],
  },
  {
    id: 'schizophrenia',
    slug: 'schizophrenia-spectrum',
    name: '思覺失調症',
    coreSummary:
      '思覺失調症會影響感知、思考與現實感，治療的目標是降低復發、維持功能，並讓病人與家屬更早辨識警訊。',
    commonSymptoms: ['幻聽', '妄想', '思考跳躍', '動機下降', '社交退縮'],
    courseExpectation:
      '藥物對急性症狀常有效，但功能恢復和社會重建需要更長期的支持、復健與家屬合作。',
    redFlags: ['命令型幻聽', '拒食拒水或明顯混亂', '突然停止藥物後迅速惡化'],
    myths: ['症狀改善後仍可能復發', '副作用可調整，不要自行停藥', '家屬支持會直接影響穩定度'],
    treatmentFocus: ['規律抗精神病藥能降低復發', '生活節奏與社會支持同樣重要', '及早處理副作用可提高服藥持續度'],
    selfCareTips: ['固定作息與回診', '把前兆症狀寫下來', '讓主要照顧者知道求助窗口'],
    relatedMedicationIds: ['antipsychotics'],
    relatedModuleIds: ['family-communication', 'therapy-engagement', 'return-to-work'],
  },
  {
    id: 'adhd',
    slug: 'adhd',
    name: 'ADHD',
    coreSummary:
      'ADHD 會影響注意力、衝動控制與時間管理，治療不是要把個性改掉，而是幫助病人更穩定地發揮功能。',
    commonSymptoms: ['容易分心', '拖延', '衝動插話', '忘東忘西', '任務切換困難'],
    courseExpectation:
      '合適藥物搭配環境調整與任務分解，通常能在數天到數週內看到專注力與執行功能的改善。',
    redFlags: ['衝動行為造成安全風險', '學業或工作功能快速下降', '合併情緒失控或物質使用'],
    myths: ['不是懶散或不夠努力', '成年人也可能有 ADHD', '吃藥不是唯一方法，但常能明顯降低生活摩擦'],
    treatmentFocus: ['藥物幫助專注，策略幫助維持', '安排具體提醒與任務拆解', '追蹤食慾、睡眠與心悸變化'],
    selfCareTips: ['把任務拆成 10 到 20 分鐘', '用外部提醒取代只靠記憶', '規律運動能幫助情緒與專注'],
    relatedMedicationIds: ['adhd-medications'],
    relatedModuleIds: ['return-to-work', 'therapy-engagement', 'sleep-rhythm'],
  },
]

const medications: MedicationTopic[] = [
  {
    id: 'antidepressants',
    slug: 'medication-antidepressants',
    name: '抗憂鬱劑',
    classLabel: 'SSRI / SNRI / 其他抗憂鬱劑',
    patientIntro: '常用於憂鬱、焦慮與部分失眠相關症狀，重點是規律服用並預留起效時間。',
    indications: ['憂鬱症', '焦慮症', '強迫與恐慌症狀', '部分慢性失眠合併情緒症狀'],
    onset: '情緒與焦慮改善常需 2 到 4 週，部分身體不適可能更早減少。',
    commonSideEffects: ['噁心', '腸胃不適', '頭暈', '口乾', '初期睡不好或想睡', '性功能副作用'],
    seriousSideEffects: ['躁期惡化', '嚴重坐立不安', '明顯自傷想法增加', '高燒、肌肉僵硬或意識改變'],
    missedDoseAdvice: '想起來時若距離下次服藥還久可補吃，若太接近下次時間就跳過，不要一次補兩倍。',
    discontinuationAdvice: '不要突然停藥，否則可能出現頭暈、麻電感、焦躁與睡眠惡化，需與醫師討論逐步調整。',
    whenToCall: ['出現自傷念頭', '嚴重噁心嘔吐無法進食', '疑似躁期或情緒突然過度亢奮'],
    faq: [
      { question: '為什麼吃了幾天還沒感覺？', answer: '這類藥物多半需要數週累積效果，請先看規律服藥與副作用調整。' },
      { question: '症狀好了就可以停嗎？', answer: '通常還要維持一段時間，過早停藥容易復發。' },
    ],
    relatedDiagnosisIds: ['depression', 'anxiety', 'insomnia'],
  },
  {
    id: 'anxiolytics',
    slug: 'medication-anxiolytics',
    name: '抗焦慮與鎮靜安眠藥',
    classLabel: 'BZD / Z-drug / 其他鎮靜藥物',
    patientIntro: '常用於短期緩解焦慮、失眠與急性緊張，效果快，但需要注意嗜睡、跌倒與依賴風險。',
    indications: ['急性焦慮', '短期失眠', '急性恐慌與坐立不安'],
    onset: '多數藥物服後 15 到 60 分鐘內可感受到鎮靜或放鬆。',
    commonSideEffects: ['嗜睡', '頭暈', '反應變慢', '注意力下降', '隔天宿醉感'],
    seriousSideEffects: ['跌倒', '呼吸抑制', '和酒精併用造成危險', '突然停用後戒斷不適'],
    missedDoseAdvice: '此類藥物多依需要或睡前使用，若已接近起床時間就不要補吃，以免白天過度嗜睡。',
    discontinuationAdvice: '連續使用一段時間後需逐步減量，突然停藥可能引發反彈失眠、焦躁或手抖。',
    whenToCall: ['白天太昏沉影響安全', '跌倒或意識混亂', '需要越吃越多才有感'],
    faq: [
      { question: '會不會上癮？', answer: '並非每個人都會，但長期連續使用確實會增加依賴風險，需要和醫師一起規劃使用長度。' },
      { question: '可以配酒嗎？', answer: '不建議，酒精會放大鎮靜效果並提高危險。' },
    ],
    relatedDiagnosisIds: ['depression', 'anxiety', 'insomnia'],
  },
  {
    id: 'antipsychotics',
    slug: 'medication-antipsychotics',
    name: '抗精神病藥',
    classLabel: '第二代抗精神病藥為主',
    patientIntro: '用於思覺失調、躁期或部分重度情緒症狀，目標是降低幻聽妄想與情緒失控，同時兼顧副作用監測。',
    indications: ['思覺失調症', '躁期', '重度激躁或精神病性症狀'],
    onset: '鎮靜與躁動減少可能較早出現，幻聽妄想等核心症狀常需要數天到數週改善。',
    commonSideEffects: ['嗜睡', '體重增加', '口乾', '便秘', '姿勢性頭暈'],
    seriousSideEffects: ['高燒與肌肉僵硬', '明顯手抖僵硬坐立不安', '血糖血脂上升', '嚴重心律不整'],
    missedDoseAdvice: '若是固定每天服用，發現漏吃時先和醫師或藥師確認，避免自行大量補服。',
    discontinuationAdvice: '突然停藥會提高復發與再住院風險，若副作用困擾通常可調整劑量或更換藥物。',
    whenToCall: ['發燒合併僵硬', '嚴重不自主動作', '明顯復發前兆再次出現'],
    faq: [
      { question: '為什麼症狀穩了還要吃？', answer: '穩定期持續用藥能顯著降低復發風險。' },
      { question: '體重增加怎麼辦？', answer: '可提早和醫療團隊討論飲食、運動與換藥選項。' },
    ],
    relatedDiagnosisIds: ['bipolar', 'schizophrenia'],
  },
  {
    id: 'mood-stabilizers',
    slug: 'medication-mood-stabilizers',
    name: '情緒穩定劑',
    classLabel: 'Lithium / Valproate / Lamotrigine 等',
    patientIntro: '主要用於雙相情緒障礙，目的在穩定情緒週期、降低躁期與憂鬱期反覆發作。',
    indications: ['雙相情緒障礙躁期', '雙相維持治療', '情緒起伏反覆'],
    onset: '不同藥物起效速度差異大，部分需要數天到數週，且常需驗血或漸進調整。',
    commonSideEffects: ['手抖', '口渴', '腸胃不適', '體重變化', '皮膚疹'],
    seriousSideEffects: ['嚴重皮膚過敏', '中毒症狀', '肝功能異常', '懷孕相關風險'],
    missedDoseAdvice: '請依個別藥物指示處理，若是需要定期驗血的藥物更不要自行補倍數。',
    discontinuationAdvice: '即使近期情緒穩定，也不建議自行停藥；停藥過快容易誘發躁期或憂鬱期回來。',
    whenToCall: ['持續嘔吐腹瀉或脫水', '明顯手抖步態不穩', '皮疹快速擴大'],
    faq: [
      { question: '為什麼要抽血？', answer: '部分情緒穩定劑需要監測藥物濃度與身體代謝安全性。' },
      { question: '懷孕可以吃嗎？', answer: '需要及早和醫師討論，部分藥物需提前調整。' },
    ],
    relatedDiagnosisIds: ['bipolar'],
  },
  {
    id: 'adhd-medications',
    slug: 'medication-adhd',
    name: 'ADHD 常用藥',
    classLabel: '中樞神經刺激劑 / 非刺激劑',
    patientIntro: '用於提升專注與抑制衝動，常見需要配合時間安排、食慾監測與睡眠調整。',
    indications: ['兒童與成人 ADHD', '專注力與衝動控制困難'],
    onset: '刺激劑可能當天見效，非刺激劑通常需要數週逐步累積。',
    commonSideEffects: ['食慾下降', '心悸', '睡眠延後', '口乾', '情緒煩躁'],
    seriousSideEffects: ['胸痛', '明顯情緒惡化', '體重快速下降', '抽動明顯加劇'],
    missedDoseAdvice: '通常不建議下午或晚上補吃刺激劑，以免影響睡眠。',
    discontinuationAdvice: '若食慾、心悸或情緒副作用明顯，應回診調整，不要自行頻繁停停吃吃。',
    whenToCall: ['胸痛或明顯心悸', '食慾下降到影響體重', '情緒暴躁或哭鬧明顯增加'],
    faq: [
      { question: '吃藥會不會改變個性？', answer: '目標是減少分心和衝動，不是讓人變得沒有特色。' },
      { question: '假日需要停藥嗎？', answer: '要看學習、工作與副作用情況，最好和醫師一起決定。' },
    ],
    relatedDiagnosisIds: ['adhd'],
  },
]

const modules = [
  {
    id: 'sleep-rhythm',
    kind: 'lifestyle' as const,
    title: '睡眠節律重整',
    summary: '固定起床、減少補眠與建立晚間降速流程，讓身體重新學會在對的時間睡。',
    bullets: ['起床時間固定，比睡著時間更重要', '若 20 到 30 分鐘睡不著，先離床做安靜活動', '晚間減少藍光、尼古丁與酒精'],
    tags: ['睡眠', '作息', '門診常用'],
  },
  {
    id: 'stress-regulation',
    kind: 'counseling' as const,
    title: '壓力與焦慮調節',
    summary: '用可操作的放鬆練習取代單靠意志力硬撐，降低身體一直處在警報模式的機會。',
    bullets: ['每天固定 5 分鐘呼吸或肌肉放鬆', '把焦慮想法寫下來再分類真實風險', '先減少咖啡因與長時間過度刺激'],
    tags: ['焦慮', '呼吸', '日常練習'],
  },
  {
    id: 'family-communication',
    kind: 'counseling' as const,
    title: '家屬溝通與危機辨識',
    summary: '讓主要照顧者知道哪些是需要盡快協助就醫的前兆，也知道日常可以怎麼支持。',
    bullets: ['先約定一位主要聯絡人', '把復發前兆寫成清單貼在明顯處', '遇到爭執時先處理安全與就醫，不先爭論對錯'],
    tags: ['家屬', '危機', '支持系統'],
  },
  {
    id: 'therapy-engagement',
    kind: 'counseling' as const,
    title: '心理治療與追蹤參與',
    summary: '把回診、心理治療與自我觀察當成同一套治療，不只依賴當下症狀變化。',
    bullets: ['每次回診帶 1 到 2 個最困擾的狀況', '把副作用和生活變化一起記錄', '若開始心理治療，先設定一個明確目標'],
    tags: ['追蹤', '心理治療', '自我觀察'],
  },
  {
    id: 'return-to-work',
    kind: 'lifestyle' as const,
    title: '復學復工節奏',
    summary: '優先恢復穩定而不是一次回到滿檔，讓功能重建比短期衝刺更可持續。',
    bullets: ['先從固定時段或半天任務開始', '把重要任務拆成可以完成的小步驟', '與學校或主管預先溝通可調整項目'],
    tags: ['功能', '學業', '工作'],
  },
  {
    id: 'substance-reduction',
    kind: 'lifestyle' as const,
    title: '酒精與物質減量提醒',
    summary: '酒精、娛樂性藥物與過量咖啡因常讓睡眠、焦慮與情緒波動惡化，也會放大藥物副作用。',
    bullets: ['鎮靜安眠藥不要配酒', '若有依賴問題，回診時直接說明使用量', '先從辨識最常使用的情境開始'],
    tags: ['物質使用', '安全', '睡眠'],
  },
]

export const defaultContentPack: ContentPack = {
  diagnoses,
  medications,
  modules,
  template: {
    id: 'default-a4-template',
    name: '精神科個人化衛教單',
    sectionOrder: ['diagnosis', 'treatment', 'medication', 'modules', 'urgent', 'qr'],
    noteLimit: 60,
  },
}

export const contentPack = defaultContentPack

export function cloneContentPack(content: ContentPack = defaultContentPack): ContentPack {
  return JSON.parse(JSON.stringify(content)) as ContentPack
}

export function createContentMaps(content: ContentPack) {
  return {
    diagnosisMap: new Map(content.diagnoses.map((diagnosis) => [diagnosis.id, diagnosis])),
    medicationMap: new Map(content.medications.map((medication) => [medication.id, medication])),
    moduleMap: new Map(content.modules.map((module) => [module.id, module])),
  }
}

export function getTopicBySlug(content: ContentPack, slug: string) {
  const diagnosis = content.diagnoses.find((item) => item.slug === slug)
  if (diagnosis) {
    return { kind: 'diagnosis' as const, topic: diagnosis }
  }

  const medication = content.medications.find((item) => item.slug === slug)
  if (medication) {
    return { kind: 'medication' as const, topic: medication }
  }

  return null
}

export function getRelatedMedications(content: ContentPack, ids: string[]) {
  const { medicationMap } = createContentMaps(content)

  return ids.map((id) => medicationMap.get(id)).filter(Boolean) as MedicationTopic[]
}
