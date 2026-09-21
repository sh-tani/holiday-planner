import { MapPin, Pencil, Trash2 } from "lucide-react"
import type { Plan } from "@/lib/types"
import { formatDateWithWeekday } from "@/lib/planner/date"

type Mountain = {
  id: string
  name: string
  area: string
  latitude: number
  longitude: number
  elevation: number | null
}

type PlanListItemProps = {
  plan: Plan
  mountain: Mountain | undefined
  onEdit: (plan: Plan) => void
  onDelete: (id: string) => void
}

export default function PlanListItem({
  plan,
  mountain,
  onEdit,
  onDelete,
}: PlanListItemProps) {
  return (
    <article className="plan-list-item">
      <div className="plan-list-date">
        {plan.date ? formatDateWithWeekday(plan.date) : "日程未定"}
      </div>

      <div className="plan-list-main">
        <h3>{plan.title}</h3>

        <span className="plan-list-mountain">
          <MapPin size={14} />
          {mountain
            ? `${mountain.name}（${mountain.area}）`
            : "山情報不明"}
        </span>
      </div>

      <div className="plan-list-actions">
        <button
          type="button"
          onClick={() => onEdit(plan)}
          aria-label={`${mountain?.name ?? "山情報不明"}を編集`}
        >
          <Pencil size={16} />
        </button>

        <button
          type="button"
          onClick={() => onDelete(plan.id)}
          aria-label={`${mountain?.name ?? "山情報不明"}を削除`}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </article>
  )
}