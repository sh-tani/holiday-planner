'use client'

import { FormEvent, useMemo, useState } from 'react'
import {
  CalendarDays,
  Check,
  ChevronRight,
  CloudSun,
  Compass,
  Edit3,
  MapPin,
  Plus,
  Sparkles,
  Trash2,
  Wind,
  X,
} from 'lucide-react'

type Plan = {
  id: number
  mountain: string
  area: string
  date: string
  day: string
  weather: string
  rain: number
  wind: number
  fixed: boolean
}

const initialPlans: Plan[] = [
  { id: 1, mountain: '高尾山', area: '東京・八王子', date: '6月14日', day: '土', weather: '晴れ', rain: 10, wind: 2, fixed: true },
  { id: 2, mountain: '筑波山', area: '茨城・つくば', date: '6月21日', day: '土', weather: 'くもり', rain: 30, wind: 4, fixed: true },
  { id: 3, mountain: '大山', area: '神奈川・伊勢原', date: '', day: '', weather: '晴れ', rain: 20, wind: 3, fixed: false },
]

function getRating(plan: Plan) {
  if (plan.rain <= 20 && plan.wind <= 4) return { label: 'おすすめ', tone: 'good', score: 92 }
  if (plan.rain <= 40 && plan.wind <= 7) return { label: '注意して計画', tone: 'caution', score: 68 }
  return { label: 'おすすめしない', tone: 'bad', score: 34 }
}

export default function Page() {
  const [plans, setPlans] = useState(initialPlans)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isAlternativesOpen, setIsAlternativesOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formError, setFormError] = useState('')
  const [mountain, setMountain] = useState('')
  const [area, setArea] = useState('')
  const [date, setDate] = useState('')
  const [day, setDay] = useState('')
  const [undecided, setUndecided] = useState(false)

  const fixedPlans = plans.filter((plan) => plan.fixed)
  const undecidedPlans = plans.filter((plan) => !plan.fixed)
  const sortedAlternatives = useMemo(() => [...plans].sort((a, b) => getRating(b).score - getRating(a).score), [plans])

  function resetForm() {
    setMountain(''); setArea(''); setDate(''); setDay(''); setUndecided(false); setEditingId(null); setFormError('')
  }

  function openCreate() { resetForm(); setIsFormOpen(true) }
  function openEdit(plan: Plan) {
    setEditingId(plan.id); setMountain(plan.mountain); setArea(plan.area); setDate(plan.date); setDay(plan.day); setUndecided(!plan.fixed); setFormError(''); setIsFormOpen(true)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!mountain.trim() || !area.trim() || (!undecided && !date)) { setFormError('山名・エリアと、日程または「未定」を入力してください。'); return }
    const nextPlan: Plan = { id: editingId ?? Date.now(), mountain: mountain.trim(), area: area.trim(), date: undecided ? '' : date, day: undecided ? '' : day, weather: '晴れ', rain: 20, wind: 3, fixed: !undecided }
    setPlans((current) => editingId ? current.map((plan) => plan.id === editingId ? nextPlan : plan) : [...current, nextPlan])
    setIsFormOpen(false); resetForm()
  }

  function removePlan(id: number) { setPlans((current) => current.filter((plan) => plan.id !== id)) }

  return (
    <main className="planner-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="休日プランナー ホーム"><span className="brand-mark"><Compass size={20} /></span><span>休日プランナー</span></a>
        <button className="login-button" type="button">ログイン <ChevronRight size={16} /></button>
      </header>

      <div id="top" className="page-content">
        <section className="hero-section">
          <div><p className="eyebrow"><Sparkles size={15} /> WEATHER SMART PLANNER</p><h1>次の休日を、<br /><em>もっと楽しむ。</em></h1><p className="hero-copy">天気と予定をまとめて管理して、<br className="mobile-break" />最高の休日プランを見つけよう。</p></div>
          <div className="hero-illustration" aria-hidden="true"><CloudSun size={116} strokeWidth={1.2} /><span>週末の天気を<br />チェック</span></div>
        </section>

        <section className="section-heading"><div><p className="section-kicker">YOUR PLANS</p><h2>今週の予定</h2></div><button className="primary-button" type="button" onClick={openCreate}><Plus size={18} />予定を登録</button></section>
        <section className="plan-grid" aria-label="今週の予定">
          {fixedPlans.map((plan) => <PlanCard key={plan.id} plan={plan} onEdit={openEdit} onDelete={removePlan} />)}
          {fixedPlans.length === 0 && <EmptyState onClick={openCreate} />}
        </section>

        <section className="undecided-section"><div className="section-heading compact"><div><p className="section-kicker">FLEXIBLE IDEAS</p><h2>日程未定の予定</h2></div><span className="count-badge">{undecidedPlans.length}件</span></div>
          {undecidedPlans.length > 0 ? <div className="undecided-list">{undecidedPlans.map((plan) => <PlanCard key={plan.id} plan={plan} onEdit={openEdit} onDelete={removePlan} compact />)}</div> : <p className="empty-note">日程未定の予定はありません。</p>}
        </section>

        <section className="alternative-cta"><div className="cta-icon"><Sparkles size={22} /></div><div><p className="section-kicker">FIND YOUR BEST DAY</p><h2>天気が良い日に変更する？</h2><p>登録した予定から、天気の良い日を探してみましょう。</p></div><button className="secondary-button" type="button" onClick={() => setIsAlternativesOpen(true)}>代替プランを検索 <ChevronRight size={17} /></button></section>
      </div>

      {isFormOpen && <div className="modal-backdrop" role="presentation"><section className="modal" role="dialog" aria-modal="true" aria-labelledby="form-title"><button className="close-button" type="button" onClick={() => setIsFormOpen(false)} aria-label="閉じる"><X size={20} /></button><p className="section-kicker">NEW PLAN</p><h2 id="form-title">{editingId ? '予定を編集' : '予定を登録'}</h2><form onSubmit={handleSubmit}><label>山名<input value={mountain} onChange={(event) => setMountain(event.target.value)} placeholder="例：高尾山" /></label><label>エリア<input value={area} onChange={(event) => setArea(event.target.value)} placeholder="例：東京・八王子" /></label><div className="form-row"><label>日付<input type="date" value={date} disabled={undecided} onChange={(event) => setDate(event.target.value)} /></label><label>曜日<select value={day} disabled={undecided} onChange={(event) => setDay(event.target.value)}><option value="">選択</option><option>土</option><option>日</option><option>祝</option></select></label></div><label className="check-label"><input type="checkbox" checked={undecided} onChange={(event) => setUndecided(event.target.checked)} /><span>日程は未定</span></label>{formError && <p className="form-error">{formError}</p>}<button className="primary-button submit-button" type="submit">{editingId ? '変更を保存' : '予定を追加'} <Check size={17} /></button></form></section></div>}
      {isAlternativesOpen && <div className="modal-backdrop" role="presentation"><section className="modal alternatives-modal" role="dialog" aria-modal="true" aria-labelledby="alternatives-title"><button className="close-button" type="button" onClick={() => setIsAlternativesOpen(false)} aria-label="閉じる"><X size={20} /></button><p className="section-kicker">SMART SUGGESTIONS</p><h2 id="alternatives-title">おすすめの予定</h2><p className="modal-intro">現在の天気情報をもとにしたプロトタイプ表示です。</p><div className="suggestion-list">{sortedAlternatives.map((plan) => <div className="suggestion-row" key={plan.id}><div><strong>{plan.mountain}</strong><span>{plan.area} {plan.date && `・${plan.date}`}</span></div><Rating rating={getRating(plan)} /></div>)}</div><button className="secondary-button full-button" type="button" onClick={() => setIsAlternativesOpen(false)}>閉じる</button></section></div>}
    </main>
  )
}

function PlanCard({ plan, onEdit, onDelete, compact = false }: { plan: Plan; onEdit: (plan: Plan) => void; onDelete: (id: number) => void; compact?: boolean }) {
  const rating = getRating(plan)
  return <article className={`plan-card ${compact ? 'compact-card' : ''}`}><div className="card-top"><div className="date-block">{plan.fixed ? <><strong>{plan.date}</strong><span>{plan.day}曜日</span></> : <><strong>日程未定</strong><span>候補として保存中</span></>}</div><div className="card-actions"><button type="button" onClick={() => onEdit(plan)} aria-label={`${plan.mountain}を編集`}><Edit3 size={16} /></button><button type="button" onClick={() => onDelete(plan.id)} aria-label={`${plan.mountain}を削除`}><Trash2 size={16} /></button></div></div><div className="mountain-info"><h3>{plan.mountain}</h3><span><MapPin size={14} />{plan.area}</span></div><div className="weather-row"><div><span className="weather-label"><CloudSun size={16} />予報（モック）</span><strong>{plan.weather}</strong></div><div><span className="weather-label"><CloudSun size={16} />降水確率</span><strong>{plan.rain}%</strong></div><div><span className="weather-label"><Wind size={16} />風速</span><strong>{plan.wind}m/s</strong></div></div><Rating rating={rating} /></article>
}

function Rating({ rating }: { rating: ReturnType<typeof getRating> }) { return <div className={`rating ${rating.tone}`}><span className="rating-score">{rating.score}</span><span><strong>{rating.label}</strong><small>お出かけしやすさ</small></span><span className="rating-bar"><i style={{ width: `${rating.score}%` }} /></span></div> }
function EmptyState({ onClick }: { onClick: () => void }) { return <div className="empty-state"><CalendarDays size={28} /><p>今週の予定はまだありません。</p><button className="text-button" type="button" onClick={onClick}>最初の予定を登録する <ChevronRight size={15} /></button></div> }
