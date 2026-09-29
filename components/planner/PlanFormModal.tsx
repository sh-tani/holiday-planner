import type { FormEvent } from 'react'
import {
  Check,
  X,
} from 'lucide-react'

type PlanFormModalProps = {
  isOpen: boolean
  formError: string
  saving: boolean

  title: string
  mountainName: string
  date: string
  undecided: boolean

  onClose: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void

  onTitleChange: (value: string) => void
  onDateChange: (value: string) => void
  onUndecidedChange: (checked: boolean) => void
}

export default function PlanFormModal({
  isOpen,
  formError,
  saving,

  title,
  mountainName,
  date,
  undecided,

  onClose,
  onSubmit,
  onTitleChange,
  onDateChange,
  onUndecidedChange,
}: PlanFormModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="modal-backdrop"
      role="presentation"
    >
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="form-title"
      >
        <button
          className="close-button"
          type="button"
          onClick={onClose}
          aria-label="閉じる"
        >
          <X size={20} />
        </button>

        <p className="section-kicker">
          EDIT PLAN
        </p>

        <h2 id="form-title">
          予定を編集
        </h2>

        <form onSubmit={onSubmit}>
          {/* タイトル */}
          <label>
            タイトル（任意）

            <input
              value={title}
              onChange={(event) =>
                onTitleChange(event.target.value)
              }
              placeholder="例：秋の高尾山ハイキング"
            />
          </label>

          {/* 山名 */}
          <label>
            山名

            <input
              value={mountainName}
              readOnly
            />
          </label>

          {/* 日付 */}
          <label>
            日付

            <input
              type="date"
              value={date}
              disabled={undecided}
              onChange={(event) =>
                onDateChange(event.target.value)
              }
            />
          </label>

          {/* 日程未定 */}
          <label className="check-label">
            <input
              type="checkbox"
              checked={undecided}
              onChange={(event) =>
                onUndecidedChange(
                  event.target.checked
                )
              }
            />

            日程未定
          </label>

          {/* エラー */}
          {formError && (
            <p className="form-error">
              {formError}
            </p>
          )}

          {/* 保存 */}
          <button
            className="primary-button submit-button"
            type="submit"
            disabled={saving}
          >
            {saving
              ? '保存中...'
              : '変更を保存'}

            <Check size={17} />
          </button>
        </form>
      </section>
    </div>
  )
}