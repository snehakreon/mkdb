export default function MyOrdersPage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-mk-gray-900 mb-6">My Orders</h1>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <button className="px-4 py-1.5 bg-mk-red text-white text-sm rounded-full font-medium">All</button>
          <button className="px-4 py-1.5 text-sm text-mk-gray-600 hover:bg-gray-100 rounded-full">Processing</button>
          <button className="px-4 py-1.5 text-sm text-mk-gray-600 hover:bg-gray-100 rounded-full">Shipped</button>
          <button className="px-4 py-1.5 text-sm text-mk-gray-600 hover:bg-gray-100 rounded-full">Delivered</button>
        </div>

        {/* Empty State */}
        <div className="py-16 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-box-open text-3xl text-gray-300"></i>
          </div>
          <h3 className="text-lg font-semibold text-mk-gray-800 mb-1">No orders yet</h3>
          <p className="text-sm text-mk-gray-500 mb-4">When you place an order, it will appear here.</p>
          <a href="/products" className="inline-block bg-mk-red text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-mk-red-600 transition-colors">
            Start Shopping
          </a>
        </div>
      </div>
    </div>
  )
}
