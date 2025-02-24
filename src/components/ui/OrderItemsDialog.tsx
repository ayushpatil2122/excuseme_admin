import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { menuItems } from '@/lib/data';

interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
}

interface OrderItemsDialogProps {
  items: OrderItem[]
  orderId: string
  onSave: (orderId: string, items: OrderItem[], newTotal: number) => Promise<void>
}

const OrderItemsDialog = ({ items, orderId, onSave }: OrderItemsDialogProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [totalAmount, setTotalAmount] = useState(0)

  useEffect(() => {
    calculateTotal(items)
  }, [items])

  const calculateTotal = (items: OrderItem[]) => {
    const total = items.reduce((sum, item) => {
      const menuItem = menuItems.find(menuItem => menuItem.name === item.name)
      const price = menuItem ? menuItem.price : 0
      return sum + (price * item.quantity)
    }, 0)
    setTotalAmount(total)
  }

  const handleSave = async () => {
    await onSave(orderId, items, totalAmount)
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          View Items
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Order Items - {orderId}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto py-4">
          {items.map((item, index) => {
            const menuItem = menuItems.find(menuItem => menuItem.name === item.name)
            const price = menuItem ? menuItem.price : 0

            return (
              <div key={item.id} className="grid gap-2">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`item-name-${index}`}>Item Name</Label>
                    <div className="flex items-center h-10 px-3 text-sm border rounded-md">
                      {item.name}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`item-quantity-${index}`}>Quantity</Label>
                    <div className="flex items-center h-10 px-3 text-sm border rounded-md">
                      {item.quantity}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`item-price-${index}`}>Price</Label>
                    <div className="flex items-center h-10 px-3 text-sm border rounded-md">
                      ${price.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          <div className="mt-4 pt-4 border-t">
            <div className="text-right font-semibold">
              Total Amount: ${totalAmount.toFixed(2)}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default OrderItemsDialog