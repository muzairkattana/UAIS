"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { useInventory, type InventoryItem } from "./inventory-context"
import { NotificationContext } from "./notification-context"

// Define the structure of a tradable item
export interface TradableItem {
  id: string
  name: string
  icon: string
  description: string
  buyPrice: number
  sellPrice: number
}

// Create a context to manage trading state
interface TradingContextType {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  tradableItems: TradableItem[]
  gold: number
  buyItem: (item: TradableItem, quantity: number) => boolean
  sellItem: (item: InventoryItem, quantity: number) => boolean
}

const TradingContext = createContext<TradingContextType | null>(null)

// Define tradable items
const TRADABLE_ITEMS: TradableItem[] = [
  {
    id: "item_wood",
    name: "Wood",
    icon: "/wood.png",
    description: "A piece of wood.",
    buyPrice: 10,
    sellPrice: 5,
  },
  {
    id: "item_stone",
    name: "Stone",
    icon: "/stone.png",
    description: "A piece of stone.",
    buyPrice: 20,
    sellPrice: 10,
  },
  {
    id: "item_apple",
    name: "Apple",
    icon: "/apple.png",
    description: "A juicy red apple.",
    buyPrice: 5,
    sellPrice: 2,
  },
  {
    id: "item_carrot",
    name: "Carrot",
    icon: "/carrot.png",
    description: "A crunchy orange carrot.",
    buyPrice: 7,
    sellPrice: 3,
  },
]

// Create a provider for the trading context
export function TradingProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [gold, setGold] = useState(100)
  const { addItem, removeItem } = useInventory()
  const notificationsContext = useContext(NotificationContext)
  const addNotification = notificationsContext?.addNotification || (() => {})

  const buyItem = (item: TradableItem, quantity: number): boolean => {
    const cost = item.buyPrice * quantity
    if (gold < cost) {
      addNotification({
        message: "Not enough gold!",
        type: "error",
      })
      return false
    }

    const purchasedItem: InventoryItem = {
      id: `${item.id}_${Date.now()}`,
      type: "item",
      name: item.name,
      icon: item.icon,
      quantity: quantity,
    }

    if (addItem(purchasedItem)) {
      setGold(gold - cost)
      addNotification({
        message: `Purchased ${quantity} ${item.name}`,
        type: "info",
        icon: item.icon,
      })
      return true
    }

    return false
  }

  const sellItem = (item: InventoryItem, quantity: number): boolean => {
    const tradableItem = TRADABLE_ITEMS.find((ti) => ti.name === item.name)
    if (!tradableItem) {
      addNotification({
        message: "This item cannot be sold!",
        type: "error",
      })
      return false
    }

    if (removeItem(item.id, quantity)) {
      const earnings = tradableItem.sellPrice * quantity
      setGold(gold + earnings)
      addNotification({
        message: `Sold ${quantity} ${item.name}`,
        type: "info",
        icon: item.icon,
      })
      return true
    }

    return false
  }

  return (
    <TradingContext.Provider
      value={{
        isOpen,
        setIsOpen,
        tradableItems: TRADABLE_ITEMS,
        gold,
        buyItem,
        sellItem,
      }}
    >
      {children}
    </TradingContext.Provider>
  )
}

// Hook for using trading context
export function useTrading() {
  const context = useContext(TradingContext)
  if (!context) {
    throw new Error("useTrading must be used within a TradingProvider")
  }
  return context
}
