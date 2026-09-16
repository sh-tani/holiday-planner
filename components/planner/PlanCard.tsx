import { MapPin, Pencil, Trash2, CloudSun, Wind } from 'lucide-react'
import type { Plan } from '@/lib/types'
import { getRating } from '@/lib/planner/rating'
import { formatDateWithWeekday } from '@/lib/planner/date'
import Rating from '@/components/planner/Rating'

type Mountain = {
  id: string
  name: string
  area: string
  latitude: number
  longitude: number
  elevation: number | null
}

type PlanCardProps = {
  plan: Plan
  mountain: Mountain | undefined
  onEdit: (plan: Plan) => void
  onDelete: (id: string) => void
  compact?: boolean
}

export default function PlanCard({
  plan,
  mountain,
  onEdit,
  onDelete,
  compact = false,
}: PlanCardProps) {
  const rating = getRating(plan)

  return (
    <article
      className={`plan-card ${compact ? 'compact' : ''}`}
    >
      <div className="card-top">

        {/* 日付 */}
        <div className="date-block">
          {plan.fixed ? (
            <>
              <strong>
                {plan.date
                  ? formatDateWithWeekday(plan.date)
                  : '日程未定'}
              </strong>

              <span>
                お出かけ予定
              </span>
            </>
          ) : (
            <>
              <strong>
                日程未定
              </strong>

              <span>
                候補として保存中
              </span>
            </>
          )}
        </div>

        {/* 編集・削除 */}
        <div className="card-actions">
          <button
            type="button"
            onClick={() => onEdit(plan)}
            aria-label={`${mountain?.name ?? '山情報不明'}を編集`}
          >
            <Pencil size={16} />
          </button>

          <button
            type="button"
            onClick={() => onDelete(plan.id)}
            aria-label={`${mountain?.name ?? '山情報不明'}を削除`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* 山情報 */}
      <div className="mountain-info">
        <h3>{plan.title}</h3>

        <span>
          <MapPin size={14} />
          {mountain
            ? `${mountain.name}（${mountain.area}）`
            : '山情報不明'}
        </span>
      </div>

      {/* 天気 */}
      <div className="weather-row">

        <div>
          <span className="weather-label">
            <CloudSun size={16} />
            予報
          </span>

          <strong>
            {plan.weather}
          </strong>
        </div>

        <div>
          <span className="weather-label">
            <CloudSun size={16} />
            降水確率
          </span>

          <strong>
            {plan.rain}%
          </strong>
        </div>

        <div>
          <span className="weather-label">
            <Wind size={16} />
            風速
          </span>

          <strong>
            {plan.wind}m/s
          </strong>
        </div>
      </div>

      {/* おすすめ度 */}
      <Rating rating={getRating(plan)} />
    </article>
  )
}