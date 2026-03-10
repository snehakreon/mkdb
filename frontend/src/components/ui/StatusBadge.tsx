const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  true: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  pending_dealer_approval: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  suspended: "bg-red-100 text-red-700",
  inactive: "bg-gray-100 text-gray-600",
  false: "bg-gray-100 text-gray-600",
  verified: "bg-green-100 text-green-700",
}

export default function StatusBadge({ status }: { status: string }) {
  const color = statusColors[status?.toLowerCase()] || "bg-gray-100 text-gray-600"
  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full capitalize ${color}`}>
      {status?.replace(/_/g, " ") || "N/A"}
    </span>
  )
}
