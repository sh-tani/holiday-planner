import { getRating } from '@/lib/planner/rating'

type RatingProps = {
  rating: ReturnType<typeof getRating>
}

export default function Rating({ rating }: RatingProps) {
  return (
    <div className={`rating ${rating.tone}`}>
      <span className="rating-score">
        {rating.score}
      </span>

      <span>
        <strong>{rating.label}</strong>
        <small>お出かけしやすさ</small>
      </span>

      <span className="rating-bar">
        <i style={{ width: `${rating.score}%` }} />
      </span>
    </div>
  )
}