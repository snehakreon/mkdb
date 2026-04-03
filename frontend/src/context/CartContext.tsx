import { createContext, useState, useContext, useEffect, useCallback, type ReactNode } from "react"
import { useAuth } from "./AuthContext"
import { api } from "../services/api"

export interface CartItem {
  id: number          // product_id
  name: string
  slug: string
  brand_name?: string
  image_url?: string
  price: number
  mrp?: number
  unit: string
  sku?: string
  quantity: number
  stock_qty: number
  min_order_qty: number
}

interface CouponInfo {
  code: string
  discount_type: "percentage" | "fixed"
  discount_value: number
  discount_amount: number
}

interface CartContextType {
  items: CartItem[]
  loading: boolean
  addItem: (product: Omit<CartItem, "quantity">, qty?: number) => Promise<void>
  removeItem: (productId: number) => Promise<void>
  updateQuantity: (productId: number, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  totalItems: number
  subtotal: number
  coupon: CouponInfo | null
  setCoupon: (coupon: CouponInfo | null) => void
}

const CartContext = createContext<CartContextType | null>(null)

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart must be used within CartProvider")
  return context
}

const GUEST_CART_KEY = "mk_guest_cart"

// Guest cart helpers (localStorage)
const getGuestCart = (): CartItem[] => {
  try {
    const stored = localStorage.getItem(GUEST_CART_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}
const saveGuestCart = (items: CartItem[]) => {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items))
}
const clearGuestCart = () => {
  localStorage.removeItem(GUEST_CART_KEY)
}

// Map API response row to CartItem
const mapRow = (row: any): CartItem => ({
  id: row.product_id,
  name: row.name,
  slug: row.slug,
  brand_name: row.brand_name,
  image_url: row.image_url,
  price: Number(row.price),
  mrp: row.mrp ? Number(row.mrp) : undefined,
  unit: row.unit || "piece",
  sku: row.sku,
  quantity: row.quantity,
  stock_qty: row.stock_qty ?? 9999,
  min_order_qty: row.min_order_qty ?? 1,
})

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth()
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [coupon, setCoupon] = useState<CouponInfo | null>(null)

  // Fetch cart from API (logged-in) or localStorage (guest)
  const fetchCart = useCallback(async () => {
    if (authLoading) return

    if (user) {
      try {
        // Sync any guest cart items into backend on login
        const guestItems = getGuestCart()
        if (guestItems.length > 0) {
          const { data } = await api.post("/cart/sync", {
            items: guestItems.map((i) => ({ product_id: i.id, quantity: i.quantity })),
          })
          clearGuestCart()
          setItems(data.map(mapRow))
        } else {
          const { data } = await api.get("/cart")
          setItems(data.map(mapRow))
        }
      } catch {
        // fallback to guest cart if API fails
        setItems(getGuestCart())
      }
    } else {
      setItems(getGuestCart())
    }
    setLoading(false)
  }, [user, authLoading])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  const addItem = async (product: Omit<CartItem, "quantity">, qty = 1) => {
    if (user) {
      try {
        await api.post("/cart", { product_id: product.id, quantity: qty })
        const { data } = await api.get("/cart")
        setItems(data.map(mapRow))
      } catch { /* silent */ }
    } else {
      setItems((prev) => {
        const existing = prev.find((i) => i.id === product.id)
        let next: CartItem[]
        if (existing) {
          next = prev.map((i) =>
            i.id === product.id
              ? { ...i, quantity: Math.min(i.quantity + qty, i.stock_qty) }
              : i
          )
        } else {
          next = [...prev, { ...product, quantity: Math.max(qty, product.min_order_qty) }]
        }
        saveGuestCart(next)
        return next
      })
    }
  }

  const removeItem = async (productId: number) => {
    if (user) {
      try {
        await api.delete(`/cart/${productId}`)
        setItems((prev) => prev.filter((i) => i.id !== productId))
      } catch { /* silent */ }
    } else {
      setItems((prev) => {
        const next = prev.filter((i) => i.id !== productId)
        saveGuestCart(next)
        return next
      })
    }
  }

  const updateQuantity = async (productId: number, quantity: number) => {
    const item = items.find((i) => i.id === productId)
    const moq = item?.min_order_qty || 1
    if (quantity < moq) return
    if (user) {
      try {
        await api.put(`/cart/${productId}`, { quantity })
        setItems((prev) =>
          prev.map((i) => (i.id === productId ? { ...i, quantity } : i))
        )
      } catch { /* silent */ }
    } else {
      setItems((prev) => {
        const next = prev.map((i) =>
          i.id === productId
            ? { ...i, quantity: Math.min(quantity, i.stock_qty) }
            : i
        )
        saveGuestCart(next)
        return next
      })
    }
  }

  const clearCart = async () => {
    if (user) {
      try {
        await api.delete("/cart/clear")
      } catch { /* silent */ }
    }
    clearGuestCart()
    setItems([])
    setCoupon(null)
  }

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, loading, addItem, removeItem, updateQuantity, clearCart, totalItems, subtotal, coupon, setCoupon }}>
      {children}
    </CartContext.Provider>
  )
}
