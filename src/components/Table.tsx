"use client"
import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Users, Timer, Receipt, Coffee } from 'lucide-react'
import { cn } from "@/lib/utils"
import { FaMoneyBillAlt, FaCreditCard, FaQrcode, FaWallet } from 'react-icons/fa';


export interface OrderItem {
  name: string
  quantity: number
  price: number
}

export interface CartProps {
  tableNumber: string
}

export interface TableOrder {
  id: string
  item: string
  quantity: number
  price: number
  isNew: boolean
  isServed: boolean
}

export interface Table {
  id: string
  status: "available" | "occupied" | "ready"
  size: "small" | "medium" | "large"
  hasAlert?: boolean
  capacity: number
  lastOrder?: string
  orders: TableOrder[]
}

export interface WebSocketMessage {
  type: "admin_order_update" | "order_update"
  tableNumber: number
  orders: OrderItem[]
}

const initialTables: Table[] = [
  { id: "T-01", status: "available", size: "large", capacity: 6, orders: [] },
  { id: "T-02", status: "available", size: "medium", capacity: 4, orders: [] },
  { id: "T-03", status: "available", size: "large", capacity: 8, orders: [] },
  { id: "T-04", status: "available", size: "small", capacity: 2, orders: [] },
  { id: "T-05", status: "available", size: "medium", capacity: 4, orders: [] },
  { id: "T-06", status: "available", size: "medium", capacity: 4, orders: [] },
  { id: "T-07", status: "available", size: "medium", capacity: 4, orders: [] },
  { id: "T-08", status: "available", size: "medium", capacity: 4, orders: [] },
  { id: "T-09", status: "available", size: "medium", capacity: 4, orders: [] },
  { id: "T-10", status: "available", size: "medium", capacity: 4, orders: [] },
  { id: "T-11", status: "available", size: "medium", capacity: 4, orders: [] },
  { id: "T-12", status: "available", size: "medium", capacity: 4, orders: [] },
  { id: "T-13", status: "available", size: "medium", capacity: 4, orders: [] },
  { id: "T-14", status: "available", size: "medium", capacity: 4, orders: [] },
  { id: "T-15", status: "available", size: "medium", capacity: 4, orders: [] },
]

const getStatusColor = (status: Table["status"]) => {
  switch (status) {
    case "available":
      return "bg-emerald-50 text-emerald-700 border-emerald-300"
    case "occupied":
      return "bg-amber-50 text-amber-700 border-amber-300"
    case "ready":
      return "bg-blue-50 text-blue-700 border-blue-300"
  }
}

const paymentOptions = [
  { value: 'CASH', label: 'Cash', icon: <FaMoneyBillAlt className="mr-2" /> },
  { value: 'CARD', label: 'Card', icon: <FaCreditCard className="mr-2" /> },
  { value: 'UPI', label: 'UPI', icon: <FaQrcode className="mr-2" /> },
  { value: 'WALLET', label: 'Mixed (Online + Cash)', icon: <FaWallet className="mr-2" /> },
];



export default function TableManagement() {
  const [tableData, setTableData] = useState<Table[]>(initialTables)
  const [loading, setLoading] = useState(true)
  const [toastMessage, setToastMessage] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null)
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<string>("")


  useEffect(() => {
    Notification.requestPermission().then((permission) => {
      console.log("Notification permission:", permission)
    })

    const socket = new WebSocket("wss://ws-production-7739.up.railway.app/")

    socket.onopen = () => {
      console.log("TableManagement: WebSocket connection established")
      socket.send(JSON.stringify({ type: "register_admin" }))
      setLoading(false)
    }

    socket.onmessage = async (event) => {
      console.log("TableManagement: Received message:", event.data)
      try {
        const data: WebSocketMessage = JSON.parse(event.data instanceof Blob ? await event.data.text() : event.data)

        if (data.type === "admin_order_update") {
          updateTableWithOrder(data)
        }
      } catch (error) {
        console.log("TableManagement: Error handling WebSocket message:", error)
      }
    }

    socket.onerror = (error) => {
      console.log("TableManagement: WebSocket error:", error)
    }

    socket.onclose = () => {
      console.log("TableManagement: WebSocket connection closed")
    }

    return () => socket.close()
  }, [])

  const playSound = async () => {
    const audio = new Audio("/assets/NewOrder.mp3")

    try {
      await audio.play()
      console.log("Sound played successfully")
    } catch (err) {
      console.log("Error playing sound:", err)
      document.addEventListener("click", () => {
        audio.play().catch(err => console.error("Still blocked:", err))
      }, { once: true })
    }
  }

  const updateTableWithOrder = (data: WebSocketMessage) => {
    console.log("Updating table with order:", data)

    setTableData((prevData) =>
      prevData.map((table) => {
        if (table.id === `T-${data.tableNumber.toString().padStart(2, "0")}`) {
          console.log("Found matching table:", table.id)

          let updatedOrders = [...table.orders]

          updatedOrders = updatedOrders.map((order) => ({ ...order, isNew: false }))

          data.orders.forEach((newOrder) => {
            updatedOrders.unshift({
              id: `order-${Date.now()}-${Math.random()}`,
              item: newOrder.name,
              quantity: newOrder.quantity,
              price: newOrder.price,
              isNew: true,
              isServed: false,
            })
          })

          console.log("Updated orders for table:", updatedOrders)

          playSound()

          if (Notification.permission === "granted") {
            new Notification(`New Order for Table ${table.id}`, {
              body: `New order received: ${data.orders.map((order) => order.name).join(", ")}`,
              requireInteraction: true,
            })
            console.log("Notification sent!")
          } else {
            console.warn("Notification not allowed:", Notification.permission)
          }

          return {
            ...table,
            status: "occupied",
            orders: updatedOrders,
            lastOrder: new Date().toISOString(),
            hasAlert: true,
          }
        }
        return table
      })
    )
  }

  const toggleOrderServed = (tableId: string, orderId: string) => {
    setTableData((prevData) =>
      prevData.map((table) => {
        if (table.id === tableId) {
          return {
            ...table,
            orders: table.orders.map((order) =>
              order.id === orderId ? { ...order, isServed: !order.isServed } : order
            ),
          }
        }
        return table
      })
    )
  }

  const getAggregatedOrders = (orders: TableOrder[]) => {
    const aggregatedOrders = orders.reduce((acc, order) => {
      if (acc[order.item]) {
        acc[order.item].quantity += order.quantity
      } else {
        acc[order.item] = {
          ...order,
          quantity: order.quantity,
          price: order.price,
        }
      }
      return acc
    }, {} as Record<string, TableOrder>)

    return Object.values(aggregatedOrders)
  }

  const clearTable = async (tableId: string, paymentMode: string) => {
    const tableNumber = tableId.replace("T-", "")[1]
    try {
      const aggregatedOrders = getAggregatedOrders(tableData.find((t) => t.id === tableId)?.orders || [])
      console.log(aggregatedOrders)
      const totalAmount = aggregatedOrders.reduce((total, order) => total + order.price * order.quantity, 0)

      const orderHistoryResponse = await fetch("/api/order-history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tableNumber: parseInt(tableNumber),
          items: aggregatedOrders.map((order) => ({
            name: order.item,
            quantity: order.quantity,
            price: order.price,
          })),
          totalAmount: totalAmount,
          paymentMode: paymentMode,
          status: "COMPLETED",
          bookMark: false,
        }),
      })

      if (!orderHistoryResponse.ok) {
        throw new Error("Failed to save order history")
      }

      const response3 = await fetch(`/api/orders?tableNumber=${tableNumber}`, {
        method: "DELETE",
      })
      if (!response3.ok) {
        throw new Error("Failed to clear orders")
      }

      setTableData((prevData) =>
        prevData.map((table) => {
          if (table.id === tableId) {
            return {
              ...table,
              status: "available",
              orders: [],
              hasAlert: false,
              lastOrder: undefined,
            }
          }
          return table
        })
      )

      setToastMessage({ message: `Bill printed and table cleared successfully`, type: "success" })
    } catch (error) {
      console.error("Error processing bill and clearing table:", error)
      setToastMessage({ message: "Failed to process bill. Please try again.", type: "error" })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading tables...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex space-x-2">
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
              Available
            </Badge>
            <Badge variant="outline" className="bg-amber-50 text-amber-700">
              Occupied
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Input placeholder="Search tables..." className="w-64" />
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
              Filter
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tableData.map((table) => {
            const aggregatedOrders = getAggregatedOrders(table.orders)

            return (
              <Card key={table.id} className={cn("overflow-hidden transition-all border", getStatusColor(table.status))}>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold">Table {table.id}</h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="h-4 w-4 mr-1" />
                        <span>Capacity: {table.capacity}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className={cn("capitalize", getStatusColor(table.status))}>
                      {table.status}
                    </Badge>
                  </div>

                  {table.status === "occupied" && (
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Timer className="h-4 w-4 mr-1" />
                        <span>{table.lastOrder ? `${Math.floor((Date.now() - new Date(table.lastOrder).getTime()) / 60000)} minutes` : "N/A"}</span>
                      </div>
                      <div className="flex items-center text-sm font-medium">
                        <Receipt className="h-4 w-4 mr-1" />
                        <span>₹{aggregatedOrders.reduce((total, order) => total + order.price * order.quantity, 0).toFixed(2)}</span>
                      </div>

                      {/* Display Orders Directly */}
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Orders:</h4>
                        <ul className="space-y-1">
                          {table.orders.map((order) => (
                            <li
                              key={order.id}
                              className={`p-2 border rounded-lg flex justify-between items-center transition-opacity ${order.isServed ? "opacity-50" : "opacity-100"}`}
                            >
                              <div>
                                <label className="text-sm cursor-pointer">
                                  {order.quantity}x {order.item}
                                </label>
                                <span className="ml-2">₹{(order.price * order.quantity).toFixed(2)}</span>
                              </div>

                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={order.isServed}
                                  onChange={() => toggleOrderServed(table.id, order.id)}
                                  className="sr-only peer"
                                />
                                <div className="w-10 h-5 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-400 
                                    rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-5 peer-checked:after:border-white
                                    after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 
                                    after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500">
                                </div>
                                <span className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                  {order.isServed ? "Served" : "Pending"}
                                </span>
                              </label>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {table.status === "available" && (
                    <div className="mt-4 flex items-center justify-center text-emerald-600">
                      <Coffee className="h-8 w-8 mr-2" />
                      <span className="text-sm font-medium">Ready for guests</span>
                    </div>
                  )}

                  {table.status === "occupied" && (
                    <div className="mt-4 space-y-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="w-full">
                            Print Bill
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Bill for Table {table.id}</DialogTitle>
                            <DialogDescription>Review the bill details for this table.</DialogDescription>
                          </DialogHeader>
                          <div className="py-4 space-y-4">
                          <div className="space-y-2">
                              <label htmlFor="paymentType" className="text-sm font-medium">
                                Payment Method
                              </label>
                              <select
                                id="paymentType"
                                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background"
                                value={selectedPaymentMode}
                                onChange={(e) => setSelectedPaymentMode(e.target.value)}
                              >
                                <option value="" disabled>Select payment method</option>
                                <option value="CASH" className="flex items-center">
                                  <FaMoneyBillAlt className="mr-2" /> Cash
                                </option>
                                <option value="CARD" className="flex items-center">
                                  <FaCreditCard className="mr-2" /> Card
                                </option>
                                <option value="UPI" className="flex items-center">
                                  <FaQrcode className="mr-2" /> UPI
                                </option>
                                <option value="WALLET" className="flex items-center">
                                  <FaWallet className="mr-2" /> Mixed (Online + Cash)
                                </option>
                              </select>
                            </div>
                            <table className="w-full">
                              <thead>
                                <tr className="border-b">
                                  <th className="text-left pb-2">Item</th>
                                  <th className="text-right pb-2">Quantity</th>
                                  <th className="text-right pb-2">Price</th>
                                </tr>
                              </thead>
                              <tbody>
                                {aggregatedOrders.map((order) => (
                                  <tr key={order.id} className="border-b">
                                    <td className="py-2">{order.item}</td>
                                    <td className="text-right py-2">{order.quantity}</td>
                                    <td className="text-right py-2">₹{(order.price * order.quantity).toFixed(2)}</td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot>
                                <tr>
                                  <td colSpan={2} className="text-right font-bold pt-2">
                                    Total:
                                  </td>
                                  <td className="text-right font-bold pt-2">
                                    ₹{aggregatedOrders
                                      .reduce((total, order) => total + order.price * order.quantity, 0)
                                      .toFixed(2)}
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                          <DialogFooter>
                            <Button
                              type="button"
                              onClick={() => clearTable(table.id, selectedPaymentMode)}
                              disabled={!selectedPaymentMode}
                            >
                              Print Bill
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}