import { Info } from "lucide-react"

export default function DataDisclaimer({ children }) {
  return (
    <div className="data-disclaimer" role="note">
      <Info size={15} />
      <span>
        {children ||
          "Illustrative search-interest and estimated business guidance. It does not represent confirmed sales or guaranteed purchases."}
      </span>
    </div>
  )
}
