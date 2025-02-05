"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

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
  { id: "T-02", status: "occupied", size: "medium", capacity: 4, orders: [], hasAlert: true },
  { id: "T-03", status: "ready", size: "large", capacity: 8, orders: [] },
  { id: "T-04", status: "available", size: "small", capacity: 2, orders: [] },
  { id: "T-05", status: "occupied", size: "medium", capacity: 4, orders: [] },
]

const getStatusColor = (status: Table["status"]) => {
  switch (status) {
    case "available":
      return "bg-green-100 text-green-700 border-green-300"
    case "occupied":
      return "bg-orange-100 text-orange-700 border-orange-300"
    case "ready":
      return "bg-blue-100 text-blue-700 border-blue-300"
  }
}

const getStatusIcon = (status: Table["status"]) => {
  switch (status) {
    case "available":
      return "🟢"
    case "occupied":
      return "🔴"
    case "ready":
      return "🔵"
  }
}

const generateRandomOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
}




export default function TableManagement() {
  const [tableData, setTableData] = useState<Table[]>(initialTables)
  const [loading, setLoading] = useState(true)
  const [otpInputs, setOtpInputs] = useState<Record<string, string>>({})
  const [submittingOtp, setSubmittingOtp] = useState(false)

  useEffect(() => {
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
        console.error("TableManagement: Error handling WebSocket message:", error)
      }
    }

    socket.onerror = (error) => {
      console.error("TableManagement: WebSocket error:", error)
    }

    socket.onclose = () => {
      console.log("TableManagement: WebSocket connection closed")
    }

    return () => socket.close()
  }, [])

  const updateTableWithOrder = (data: WebSocketMessage) => {
    console.log("Updating table with order:", data)

    setTableData((prevData) =>
      prevData.map((table) => {
        if (table.id === `T-${data.tableNumber.toString().padStart(2, "0")}`) {
          console.log("Found matching table:", table.id)

          // Create a copy of existing orders
          const updatedOrders = [...table.orders]

          data.orders.forEach((newOrder) => {
            const existingOrderIndex = updatedOrders.findIndex((order) => order.item === newOrder.name)

            if (existingOrderIndex !== -1) {
              // If the item already exists, update the quantity
              updatedOrders[existingOrderIndex].quantity += newOrder.quantity
            } else {
              // Otherwise, add a new order
              updatedOrders.push({
                id: `order-${Date.now()}-${Math.random()}`, // Ensure unique ID
                item: newOrder.name,
                quantity: newOrder.quantity,
                price: newOrder.price,
              })
            }
          })

          console.log("Updated orders for table:", updatedOrders)

          return {
            ...table,
            status: "occupied",
            orders: updatedOrders, 
            lastOrder: new Date().toISOString(),
            hasAlert: true,
          }
        }
        return table
      }),
    )
  }

  const handleStatusChange = (tableId: string) => {
    setTableData((prevData) =>
      prevData.map((table) => {
        if (table.id === tableId) {
          const newStatus =
            table.status === "available" ? "occupied" : table.status === "occupied" ? "ready" : "available"
          return { ...table, status: newStatus }
        }
        return table
      }),
    )
  }

  const handleGenerateOTP = (tableId: string) => {
    const newOTP = generateRandomOTP();
    setOtpInputs((prev) => ({
      ...prev,
      [tableId]: newOTP,
    }));
  };

  const handleOtpChange = (tableId: string, value: string) => {
    setOtpInputs((prev) => ({
      ...prev,
      [tableId]: value,
    }))
  }

  const handleOtpSubmit = async (tableId: string) => {
    if (!otpInputs[tableId]) {
      alert("Please enter an OTP")
      return
    }

    setSubmittingOtp(true)
    const tableNumber = tableId.replace("T-", "")[1]

    try {
      const response = await fetch(`/api/otp?tableNumber=${tableNumber}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ otp: otpInputs[tableId] }),
      })

      if (!response.ok) {
        throw new Error("Failed to save OTP")
      }

      const data = await response.json()
      alert(data.message)

      setOtpInputs((prev) => ({
        ...prev,
        [tableId]: "",
      }))
    } catch (error) {
      console.error("Error saving OTP:", error)
      alert("Failed to save OTP. Please try again.")
    } finally {
      setSubmittingOtp(false)
    }
  }

  const clearTable = async (tableId: string) => {
    const tableNumber = tableId.replace("T-", "")[1]
    try {
      const response1 = await fetch(`/api/secure?tableNumber=${tableNumber}`, {
        method : 'PATCH'
      })
      if (!response1.ok) {
        throw new Error("Failed to clear table")
      }

      const response2 = await fetch(`/api/otp?tableNumber=${tableNumber}`, {
        method : 'DELETE'
      })
      if (!response2.ok) {
        throw new Error("Failed to clear table")
      }

      const response3 = await fetch(`/api/orders?tableNumber=${tableNumber}`, {
        method : 'DELETE'
      })
      if (!response3.ok) {
        throw new Error("Failed to clear table")
      }

      const response4 = await fetch(`/api/allocate?tableNumber=${tableNumber}`, {
        method : 'DELETE'
      });
      if(!response4.ok) {
        throw new Error("Failed to clear table")
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
        }),
      )
    } catch (error) {
      console.error("Error clearing table:", error)
      alert("Failed to clear table. Please try again.")
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
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {tableData.map((table) => (
          <Card key={table.id} className="overflow-hidden transition-all hover:shadow-lg">
            <CardHeader className={`${getStatusColor(table.status)} flex flex-row items-center justify-between`}>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                {getStatusIcon(table.status)} {table.id}
                {table.hasAlert && <span className="animate-pulse text-red-500">🔔</span>}
              </CardTitle>
              <Badge variant="outline" className="text-xs font-normal">
                {table.size}
              </Badge>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Capacity:</span>
                <span className="text-sm">{table.capacity}</span>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Orders:</h4>
                {table.orders.length > 0 ? (
                  <ul className="space-y-1">
                    {table.orders.map((order) => (
                      <li key={order.id} className="text-sm flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox id={`checkbox-${order.id}`} />
                          <label htmlFor={`checkbox-${order.id}`} className="text-sm cursor-pointer">
                            {order.quantity}x {order.item}
                          </label>
                        </div>
                        <span>₹{(order.price * order.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 italic">No orders yet</p>
                )}
              </div>
              <div className="flex flex-col space-y-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full">
                      View Bill
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Bill for Table {table.id}</DialogTitle>
                      <DialogDescription>Review the bill details for this table.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left pb-2">Item</th>
                            <th className="text-right pb-2">Quantity</th>
                            <th className="text-right pb-2">Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {table.orders.map((order) => (
                            <tr key={order.id} className="border-b">
                              <td className="py-2 flex items-center space-x-2">
                                <Checkbox id={`dialog-checkbox-${order.id}`} />
                                <label htmlFor={`dialog-checkbox-${order.id}`} className="cursor-pointer">
                                  {order.item}
                                </label>
                              </td>
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
                              ₹
                              {table.orders
                                .reduce((total, order) => total + order.price * order.quantity, 0)
                                .toFixed(2)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                    <DialogFooter>
                      <Button type="button" onClick={() => clearTable(table.id)}>
                        Clear Table
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button variant="secondary" size="sm" className="w-full" onClick={() => handleStatusChange(table.id)}>
                  Change Status
                </Button>
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Enter OTP"
                  value={otpInputs[table.id] || ""}
                  onChange={(e) => handleOtpChange(table.id, e.target.value)}
                  maxLength={6}
                />
                <Button 
                    variant="secondary"
                    size="sm"
                    onClick={() => handleGenerateOTP(table.id)}
                    className="whitespace-nowrap"
                  >
                    Generate OTP
                  </Button>
                <Button className="w-full" onClick={() => handleOtpSubmit(table.id)} disabled={submittingOtp}>
                  {submittingOtp ? "Saving..." : "Save OTP"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

