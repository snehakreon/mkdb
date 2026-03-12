export default function WishlistPage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-mk-gray-900 mb-6">My Wishlist</h1>

      <div className="bg-white border border-gray-200 rounded-xl py-16 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-heart text-3xl text-gray-300"></i>
        </div>
        <h3 className="text-lg font-semibold text-mk-gray-800 mb-1">Your wishlist is empty</h3>
        <p className="text-sm text-mk-gray-500 mb-4">Save products you love to buy them later.</p>
        <a href="/products" className="inline-block bg-mk-red text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-mk-red-600 transition-colors">
          Browse Products
        </a>
      </div>
    </div>
  )
}
