interface Column {
  key: string
  label: string
  render?: (value: any, row: any) => React.ReactNode
}

interface DataTableProps {
  columns: Column[]
  data: any[]
  onEdit?: (row: any) => void
  onDelete?: (row: any) => void
  loading?: boolean
}

export default function DataTable({ columns, data, onEdit, onDelete, loading }: DataTableProps) {
  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading...</div>
  }

  if (data.length === 0) {
    return <div className="text-center py-8 text-gray-400">No records found</div>
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {col.label}
              </th>
            ))}
            {(onEdit || onDelete) && (
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((row, idx) => (
            <tr key={row.id || idx} className="hover:bg-gray-50">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                  {col.render ? col.render(row[col.key], row) : (row[col.key] ?? "-")}
                </td>
              ))}
              {(onEdit || onDelete) && (
                <td className="px-4 py-3 text-sm text-right space-x-2 whitespace-nowrap">
                  {onEdit && (
                    <button onClick={() => onEdit(row)} className="text-primary-600 hover:text-primary-800 font-medium">
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button onClick={() => onDelete(row)} className="text-red-600 hover:text-red-800 font-medium">
                      Delete
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
