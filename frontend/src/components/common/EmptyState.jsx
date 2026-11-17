import { SearchX } from "lucide-react"

export default function EmptyState({
  title = "No results found",
  message = "Try changing your filters.",
}) {
  return (
    <div className="empty-state">
      <SearchX size={24} />
      <strong>{title}</strong>
      <span>{message}</span>
    </div>
  )
}
