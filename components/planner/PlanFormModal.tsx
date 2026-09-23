import type { FormEvent } from 'react'
import {
  Check,
  X,
} from 'lucide-react'

import type { Mountain } from '@/lib/mountains/api'

type PlanFormModalProps = {
  isOpen: boolean
  editingId: string | null
  formError: string
  saving: boolean

  title: string
  mountainId: string
  mountainName: string
  mountainList: string
  mountainCandidates: Mountain[]
  isMountainSearching: boolean
  selectedMountain: Mountain | null

  date: string
  undecided: boolean

  onClose: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void

  onTitleChange: (value: string) => void
  onMountainNameChange: (value: string) => void
  onMountainListChange: (value: string) => void
  onSelectMountain: (mountain: Mountain) => void
  onClearMountain: () => void
  onDateChange: (value: string) => void
  onUndecidedChange: (checked: boolean) => void
  mountainLists: {
    id: string
    name: string
  }[]
}

export default function PlanFormModal({
  isOpen,
  editingId,
  formError,
  saving,

  title,
  mountainId,
  mountainName,
  mountainList,
  mountainCandidates,
  isMountainSearching,
  selectedMountain,

  date,
  undecided,

  onClose,
  onSubmit,
  onTitleChange,
  onMountainNameChange,
  onMountainListChange,
  mountainLists,
  onSelectMountain,
  onClearMountain,
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
          NEW PLAN
        </p>

        <h2 id="form-title">
          {editingId
            ? '予定を編集'
            : '予定を登録'}
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

          {/* リストで絞り込み */}
          <label>
            リストで絞り込み
            <select
              value={mountainList}
              onChange={(event) =>
                onMountainListChange(event.target.value)
              }
            >
              <option value="">すべての山</option>

              {mountainLists.map((list) => (
                <option key={list.id} value={list.name}>
                  {list.name}
                </option>
              ))}
            </select>
          </label>

          {/* 山名 */}
          <label>
            山名

            <div className="mountain-search">
              <input
                value={mountainName}
                onChange={(event) =>
                  onMountainNameChange(event.target.value)
                }
                placeholder="例：高尾山"
                autoComplete="off"
              />

              {isMountainSearching && (
                <p className="search-status">
                  山を検索しています...
                </p>
              )}

              {!isMountainSearching &&
                mountainCandidates.length > 0 && (
                  <div className="mountain-candidates">
                    {mountainCandidates.map((mountain) => (
                      <button
                        key={mountain.id}
                        type="button"
                        className="mountain-candidate"
                        onClick={() =>
                          onSelectMountain(mountain)
                        }
                      >
                        <strong>
                          {mountain.name}
                        </strong>

                        <span>
                          {mountain.area}
                          {mountain.elevation
                            ? ` ・ ${mountain.elevation}m`
                            : ''}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

              {!isMountainSearching &&
                mountainName.trim() &&
                !mountainId &&
                mountainCandidates.length === 0 && (
                  <p className="search-status">
                    該当する山がありません
                  </p>
                )}
            </div>
          </label>

          {/* 選択した山 */}
          {mountainId && (
            <div className="selected-mountain">
              <span>
                選択中：
                <strong>{mountainName}</strong>
              </span>

              <button
                type="button"
                onClick={onClearMountain}
              >
                変更
              </button>
            </div>
          )}

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
                onUndecidedChange(event.target.checked)
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
              : editingId
                ? '変更を保存'
                : '予定を追加'}

            <Check size={17} />
          </button>
        </form>
      </section>
    </div>
  )
}