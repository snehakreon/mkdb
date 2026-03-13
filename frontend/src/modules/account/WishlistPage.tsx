import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { wishlistService } from "../../services/wishlist.service"

interface WishlistItem {
  id: number
  product_id: number
  name: string
  slug: string
  price: string
  mrp: string
  image_url: string | null
  unit: string
  stock_qty: number
  brand_name: string | null
  created_at: string
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<number | null>(null)

  const fetchWishlist = async () => {
    setLoading(true)
    try {
      const res = await wishlistService.getAll()
      setItems(res.data)
    } catch {
      /* empty */
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchWishlist()
  }, [])

  const handleRemove = async (productId: number) => {
    setRemoving(productId)
    try {
      await wishlistService.remove(productId)
      setItems((prev) => prev.filter((item) => item.product_id !== productId))
    } catch {
      /* empty */
    }
    setRemoving(null)
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-mk-gray-900 mb-6">My Wishlist</h1>

      {loading && (
        <div className="text-center py-12 text-mk-gray-500 text-sm">Loading wishlist...</div>
      )}

      {!loading && items.length > 0 && (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
              {/* Product Image */}
              <Link to={`/products/${item.product_id}`} className="w-20 h-20 bg-mk-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <i className="fas fa-th-large text-2xl text-gray-300"></i>
                )}
              </Link>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                {item.brand_name && (
                  <span className="text-[10px] text-mk-gray-600 uppercase tracking-wider">{item.brand_name}</span>
                )}
                <Link to={`/products/${item.product_id}`} className="block">
                  <h3 className="font-semibold text-sm text-mk-gray-800 truncate hover:text-mk-red transition-colors">
                    {item.name}
                  </h3>
                </Link>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-lg font-bold text-mk-gray-900">
                    ₹{Number(item.price).toLocaleString("en-IN")}
                  </span>
                  {item.mrp && Number(item.mrp) > Number(item.price) && (
                    <span className="text-sm text-mk-gray-600 line-through">
                      ₹{Number(item.mrp).toLocaleString("en-IN")}
                    </span>
                  )}
                  {item.unit && <span className="text-xs text-mk-gray-500">/{item.unit}</span>}
                </div>
                <span className={`text-xs mt-1 inline-block ${item.stock_qty > 0 ? "text-green-600" : "text-red-500"}`}>
                  {item.stock_qty > 0 ? "In Stock" : "Out of Stock"}
                </span>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 flex-shrink-0">
                <button
                  onClick={() => handleRemove(item.product_id)}
                  disabled={removing === item.product_id}
                  className="text-xs font-semibold text-red-400 hover:text-red-600 transition-colors disabled:opacity-50 flex items-center gap-1"
                >
                  <i className="fas fa-trash-alt"></i>
                  {removing === item.product_id ? "Removing..." : "Remove"}
                </button>
                <Link
                  to={`/products/${item.product_id}`}
                  className="text-xs font-semibold text-mk-red hover:underline flex items-center gap-1"
                >
                  <i className="fas fa-eye"></i>
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl py-16 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-heart text-3xl text-gray-300"></i>
          </div>
          <h3 className="text-lg font-semibold text-mk-gray-800 mb-1">Your wishlist is empty</h3>
          <p className="text-sm text-mk-gray-500 mb-4">Save products you love to buy them later.</p>
          <Link to="/products" className="inline-block bg-mk-red text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-mk-red-600 transition-colors">
            Browse Products
          </Link>
        </div>
      )}
    </div>
  )
}
