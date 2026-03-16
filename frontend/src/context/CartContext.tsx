import { createContext, useState, useContext, useEffect, ReactNode } from "react"

export interface CartItem {
  id: number
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
  addItem: (product: Omit<CartItem, "quantity">, qty?: number) => void
  removeItem: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
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

const CART_KEY = "mk_cart"

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })
  const [coupon, setCoupon] = useState<CouponInfo | null>(null)

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  }, [items])

  const addItem = (product: Omit<CartItem, "quantity">, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id)
      if (existing) {
        return prev.map((i) =>
          i.id === product.id
            ? { ...i, quantity: Math.min(i.quantity + qty, i.stock_qty) }
            : i
        )
      }
      return [...prev, { ...product, quantity: Math.max(qty, product.min_order_qty) }]
    })
  }

  const removeItem = (productId: number) => {
    setItems((prev) => prev.filter((i) => i.id !== productId))
  }

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }
    setItems((prev) =>
      prev.map((i) =>
        i.id === productId
          ? { ...i, quantity: Math.min(quantity, i.stock_qty) }
          : i
      )
    )
  }

  const clearCart = () => {
    setItems([])
    setCoupon(null)
  }

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, subtotal, coupon, setCoupon }}>
      {children}
    </CartContext.Provider>
  )
}
