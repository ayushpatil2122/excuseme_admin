import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
}

interface EditOrderDialogProps {
  isOpen: boolean
  onClose: () => void
  items: OrderItem[]
  onSave: (updatedItems: OrderItem[]) => void
}

export function EditOrderDialog({ isOpen, onClose, items, onSave }: EditOrderDialogProps) {
  const [editedItems, setEditedItems] = useState<OrderItem[]>(items)

  const handleQuantityChange = (id: string, newQuantity: number) => {
    setEditedItems((prevItems) => prevItems.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)))
  }

  const handleSave = () => {
    onSave(editedItems)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Order Items</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {editedItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <span>
                {item.name} (${item.price.toFixed(2)} each)
              </span>
              <Input
                type="number"
                value={item.quantity}
                onChange={(e) => handleQuantityChange(item.id, Number.parseInt(e.target.value) || 0)}
                className="w-20"
                min="0"
              />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

