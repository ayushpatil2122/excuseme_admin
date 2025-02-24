"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { CalendarIcon, Search } from "lucide-react"
import { FaMoneyBillWave, FaCreditCard, FaExchangeAlt } from "react-icons/fa"
import type { SelectRangeEventHandler } from "react-day-picker"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import OrderItemsDialog from "./ui/OrderItemsDialog"

interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
}

interface Order {
  id: string
  tableNumber: number
  totalAmount: number
  paymentMode: "Cash" | "Card" | "Mixed"
  status: "Completed" | "Pending" | "Refunded" | "Cancelled"
  createdAt: string
  items: OrderItem[]
  bookMark: boolean
}

interface DateRange {
  from: Date | undefined
  to: Date | undefined
}

type PaymentMethodFilter = "all" | "Cash" | "Card" | "Mixed"

const OrderHistory = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<PaymentMethodFilter>("all")
  const [page, setPage] = useState(1)
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined })

  console.log(orders)

  useEffect(() => {
    fetchOrders()
  }, [])


  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/order-history")
      const data = await response.json()
      setOrders(data)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching orders:", error)
      setLoading(false)
    }
  }

  const handleBookmarkToggle = async (id: string) => {
    try {
      const order = orders.find((o) => o.id === id)
      const response = await fetch(`/api/order-history?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookMark: !order?.bookMark,
        }),
      })
      if (response.ok) {
        fetchOrders()
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error)
    }
  }

  const handleSaveItems = async (orderId: string, updatedItems: OrderItem[], newTotal: number) => {
    try {
      const response = await fetch(`/api/order-history?id=${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: updatedItems,
          totalAmount: newTotal,
        }),
      })
      if (response.ok) {
        fetchOrders() 
      }
    } catch (error) {
      console.error('Error updating items:', error)
    }
  }


  const handleDateRangeSelect: SelectRangeEventHandler = (range: any) => {
    setDateRange(range || { from: undefined, to: undefined })
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toString().includes(searchTerm) ||
      order.tableNumber.toString().includes(searchTerm) ||
      order.totalAmount.toString().includes(searchTerm) ||
      order.status.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesPaymentMethod = paymentMethodFilter === "all" || order.paymentMode === paymentMethodFilter

    const matchesDateRange =
      (!dateRange.from || new Date(order.createdAt) >= dateRange.from) &&
      (!dateRange.to || new Date(order.createdAt) <= dateRange.to)

    return matchesSearch && matchesPaymentMethod && matchesDateRange
  })

  const pageSize = 10
  const totalPages = Math.ceil(filteredOrders.length / pageSize)
  const paginatedOrders = filteredOrders.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="container mx-auto py-10 bg-gray-50">
      <h1 className="text-2xl font-bold mb-6">Order History</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Select
          onValueChange={(value: PaymentMethodFilter) => setPaymentMethodFilter(value)}
          value={paymentMethodFilter}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Payment Method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            <SelectItem value="Cash">Cash</SelectItem>
            <SelectItem value="Card">Card</SelectItem>
            <SelectItem value="Mixed">Mixed</SelectItem>
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="range" selected={dateRange} onSelect={handleDateRangeSelect} numberOfMonths={2} />
          </PopoverContent>
        </Popover>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Table Number</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Mode</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.tableNumber}</TableCell>
                  <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>
                    {order.paymentMode === "Cash" && <FaMoneyBillWave className="inline mr-2" />}
                    {order.paymentMode === "Card" && <FaCreditCard className="inline mr-2" />}
                    {order.paymentMode === "Mixed" && <FaExchangeAlt className="inline mr-2" />}
                    {order.paymentMode}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800`}
                    >
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell>{format(new Date(order.createdAt), "yyyy-MM-dd HH:mm")}</TableCell>
                  <TableCell>
                  <OrderItemsDialog
                      items={order.items}
                      orderId={order.id}
                      onSave={handleSaveItems}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleBookmarkToggle(order.id)}>
                        {order.bookMark ? "★" : "☆"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex items-center justify-between space-x-2 py-4">
        <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
          Previous
        </Button>
        <div className="flex-1 text-center text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

export default OrderHistory

