import { CalendarDays, ChevronRight } from 'lucide-react'

/**
 * 予定がない場合
 */
export default function EmptyState({
  onClick,
}: {
  onClick: () => void
}) {
  return (
    <div className="empty-state">
      <CalendarDays size={28} />

      <p>
        今週の予定はまだありません。
      </p>

      <button
        className="text-button"
        type="button"
        onClick={onClick}
      >
        最初の予定を登録する
        <ChevronRight size={15} />
      </button>
    </div>
  )
}