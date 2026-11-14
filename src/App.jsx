import { useState, useEffect } from 'react'
import { ITEMS, RANKS } from './data.js'

const KEY = 'nasa-relics-v1'
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {} } catch { return {} } }

function Mission({ item, onDone, onBack }) {
  const [step, setStep] = useState(0)
  const [fi, setFi] = useState(0)
  const [val, setVal] = useState(item.lab.def)
  const [touched, setTouched] = useState(false)
  const [qi, setQi] = useState(0)
  const [pick, setPick] = useState(null)
  const [right, setRight] = useState(0)
  const q = item.quiz[qi]
  const answer = i => { if (pick !== null) return; setPick(i); if (i === q.a) setRight(r => r + 1) }
  const next = () => {
    if (qi + 1 < item.quiz.length) { setQi(qi + 1); setPick(null) } else setStep(3)
  }
  const stars = right + (touched ? 1 : 0)
  const xp = right * 100 + (touched ? 50 : 0)
  const steps = ['الحفر', 'المعمل', 'التحدي', 'النتيجة']
  return (
    <section className="mission">
      <button className="link" onClick={onBack}>رجوع للخريطة</button>
      <header><span className="big">{item.icon}</span><div><h2>{item.name}</h2><p>{item.place}</p></div></header>
      <ol className="steps">{steps.map((s, i) => <li key={s} className={i === step ? 'on' : i < step ? 'ok' : ''}>{s}</li>)}</ol>

      {step === 0 && (
        <div className="panel" key={'f' + fi}>
          <p className="fact">{item.facts[fi]}</p>
          <div className="row">
            <span className="muted">معلومة {fi + 1} من {item.facts.length}</span>
            <button className="btn" onClick={() => fi + 1 < item.facts.length ? setFi(fi + 1) : setStep(1)}>
              {fi + 1 < item.facts.length ? 'المعلومة اللي بعدها' : 'روح المعمل'}
            </button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="panel">
          <h3>{item.lab.title}</h3>
          <label htmlFor="lab">{item.lab.label}: <b>{val} {item.lab.unit}</b></label>
          <input id="lab" type="range" min={item.lab.min} max={item.lab.max} step="1" value={val}
            onChange={e => { setVal(+e.target.value); setTouched(true) }} />
          <p className="out" aria-live="polite">{item.lab.calc(val)}</p>
          <div className="row"><span className="muted">{touched ? 'تمام! خدت 50 نقطة' : 'حرّك المؤشر عشان تاخد 50 نقطة'}</span>
            <button className="btn" onClick={() => setStep(2)}>ابدأ التحدي</button></div>
        </div>
      )}

      {step === 2 && (
        <div className="panel">
          <p className="muted">سؤال {qi + 1} من {item.quiz.length}</p>
          <h3>{q.q}</h3>
          <div className="opts">
            {q.o.map((t, i) => (
              <button key={i} onClick={() => answer(i)} disabled={pick !== null}
                className={'opt' + (pick !== null ? (i === q.a ? ' good' : i === pick ? ' bad' : '') : '')}>{t}</button>
            ))}
          </div>
          {pick !== null && (
            <div className="fb" role="status">
              <p><b>{pick === q.a ? 'صح! +100 نقطة.' : 'مش دي. '}</b> {q.e}</p>
              <button className="btn" onClick={next}>{qi + 1 < item.quiz.length ? 'السؤال اللي بعده' : 'شوف نتيجتك'}</button>
            </div>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="panel center">
          <div className="stars" aria-label={`${stars} من 3 نجوم`}>{[0, 1, 2].map(i => <span key={i} className={i < stars ? 'lit' : ''}>★</span>)}</div>
          <h3>{xp} نقطة</h3>
          <p className="muted">{stars === 3 ? 'ممتاز! أنهيت المهمة بالكامل.' : 'تقدر تعيد المهمة وتجمع نجوم أكتر.'}</p>
          <button className="btn" onClick={() => onDone({ xp, stars })}>سجّل في سجل البعثات</button>
        </div>
      )}
    </section>
  )
}

export default function App() {
  const [scr, setScr] = useState('intro')
  const [cur, setCur] = useState(null)
  const [prog, setProg] = useState(load)
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(prog)) } catch { /* ignore */ } }, [prog])
  const total = Object.values(prog).reduce((s, p) => s + p.xp, 0)
  const done = Object.keys(prog).length
  const rank = RANKS.find(r => total >= r[0])[1]
  const save = r => {
    setProg(p => ({ ...p, [cur.id]: { xp: Math.max(r.xp, p[cur.id]?.xp || 0), stars: Math.max(r.stars, p[cur.id]?.stars || 0) } }))
    setScr('map')
  }
  return (
    <main>
      <div className="sky" aria-hidden="true" />
      {scr === 'intro' && (
        <section className="intro">
          <p className="muted">NASA Space Apps · التحدي الأول</p>
          <h1>حُفريات الفضاء</h1>
          <p className="lead">في آثار على القمر والمريخ ومدارات الفضاء، سابتها ناسا بعد ما خلصت شغلها. إنت عالم آثار فضائية، مهمتك تزور 5 مواقع وتعرف قصة كل جهاز.</p>
          <button className="btn big-btn" onClick={() => setScr('map')}>ابدأ البعثة</button>
        </section>
      )}
      {scr === 'map' && (
        <section>
          <header className="bar">
            <div><h2>خريطة المواقع</h2><p className="muted">الرتبة: {rank}</p></div>
            <div className="score"><b>{total}</b><span>نقطة · {done}/5 مواقع</span></div>
          </header>
          <div className="grid">
            {ITEMS.map(it => {
              const p = prog[it.id]
              return (
                <button key={it.id} className={'card' + (p ? ' done' : '')} onClick={() => { setCur(it); setScr('mission') }}>
                  <span className="big">{it.icon}</span>
                  <strong>{it.name}</strong>
                  <small>{it.place}</small>
                  <span className="stars sm" aria-label={`${p?.stars || 0} من 3 نجوم`}>{[0, 1, 2].map(i => <span key={i} className={i < (p?.stars || 0) ? 'lit' : ''}>★</span>)}</span>
                </button>
              )
            })}
          </div>
          {done === ITEMS.length && <div className="center"><button className="btn big-btn" onClick={() => setScr('final')}>شهادة البعثة</button></div>}
        </section>
      )}
      {scr === 'mission' && cur && <Mission key={cur.id} item={cur} onDone={save} onBack={() => setScr('map')} />}
      {scr === 'final' && (
        <section className="intro">
          <h1>أنهيت البعثة</h1>
          <p className="lead">رتبتك: <b>{rank}</b> بمجموع {total} نقطة من {ITEMS.length * 250}.</p>
          <p className="muted">كل البيانات مصدرها أرشيف NSSDCA وصفحات ناسا الرسمية للمهمات.</p>
          <button className="btn" onClick={() => setScr('map')}>رجوع للخريطة</button>
        </section>
      )}
      <footer>مشروع لمسابقة NASA Space Apps. ناسا لا تدعم هذا المشروع رسميًا.</footer>
    </main>
  )
}
