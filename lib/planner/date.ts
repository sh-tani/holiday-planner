/**
 * 日付を「YYYY-MM-DD（曜日）」形式に変換
 */
export function formatDateWithWeekday(date: string) {
  const [year, month, day] = date.split('-').map(Number)
  const dateObject = new Date(year, month - 1, day)

  const weekdays = ['日', '月', '火', '水', '木', '金', '土']

  return `${date}（${weekdays[dateObject.getDay()]}）`
}