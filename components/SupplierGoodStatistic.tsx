interface Stats {
  existing: number
  contacted: number
  pending: number
  emissionDataReceived: number
  supportingDocumentsReceived: number
  contactApproachFailed: number
}

interface SupplierGoodStatisticProps {
  stats: Stats
}

export function SupplierGoodStatistic({ stats }: SupplierGoodStatisticProps) {
  return (
    <div className="bg-white overflow-hidden sm:rounded-lg mb-6">
      <div className="px-4 py-5 sm:p-6">
        <dl className="grid grid-cols-3 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Existing Suppliers</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.existing}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Contacted Suppliers</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.contacted}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Pending</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.pending}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Emission data received</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.emissionDataReceived}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Supporting Documentation received</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.supportingDocumentsReceived}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Contact approach failed</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.contactApproachFailed}</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
