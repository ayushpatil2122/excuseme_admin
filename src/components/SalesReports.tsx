"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, Download, FileSpreadsheet, FileText, Table } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Cell, Pie, PieChart, ResponsiveContainer, Legend, Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"

interface OrderHistory {
  id: string
  tableNumber: number
  totalAmount: number
  paymentMode: string
  status: string
  bookMark: boolean
  items: { name: string; quantity: number; price: number }[]
  createdAt: string
}

export default function ReportsPage() {
  const [orderHistory, setOrderHistory] = useState<OrderHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        const response = await fetch("/api/order-history")
        const data = await response.json()
        setOrderHistory(data)
      } catch (error) {
        console.error("Error fetching order history:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrderHistory()
  }, [])

  const exportData = (format: string) => {
    console.log(`Exporting as ${format}`)
  }

  const calculateOrderMetrics = (period: string) => {
    const now = new Date()
    let filteredOrders = orderHistory

    if (period === "daily") {
      filteredOrders = orderHistory.filter(
        (order) => new Date(order.createdAt).toDateString() === now.toDateString()
      )
    } else if (period === "weekly") {
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
      filteredOrders = orderHistory.filter(
        (order) => new Date(order.createdAt) >= startOfWeek
      )
    } else if (period === "monthly") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      filteredOrders = orderHistory.filter(
        (order) => new Date(order.createdAt) >= startOfMonth
      )
    }

    const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0)
    const highestOrder = Math.max(...filteredOrders.map((order) => order.totalAmount))
    const lowestOrder = Math.min(...filteredOrders.map((order) => order.totalAmount))
    const averageOrder = totalRevenue / filteredOrders.length || 0

    return { totalRevenue, highestOrder, lowestOrder, averageOrder }
  }

  // Calculate most selling dishes
  const getMostSellingDishes = () => {
    const dishSales: { [key: string]: number } = {}

    orderHistory.forEach((order) => {
      order.items.forEach((item) => {
        if (dishSales[item.name]) {
          dishSales[item.name] += item.quantity
        } else {
          dishSales[item.name] = item.quantity
        }
      })
    })

    const colors = [
      '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
      '#f97316', '#84cc16', '#06b6d4', '#d946ef', '#0ea5e9',
      '#64748b', '#a855f7', '#14b8a6', '#f43f5e', '#f472b6',
      '#e11d48', '#db2777', '#c026d3', '#9333ea', '#6d28d9',
      '#4f46e5', '#3730a3', '#2563eb', '#1d4ed8', '#1e40af',
      '#1e3a8a', '#1d4ed8', '#1e40af', '#1e3a8a', '#1d4ed8',
      '#1e40af', '#1e3a8a', '#1d4ed8', '#1e40af', '#1e3a8a',
      '#1d4ed8', '#1e40af', '#1e3a8a', '#1d4ed8', '#1e40af',
      '#1e3a8a', '#1d4ed8', '#1e40af', '#1e3a8a', '#1d4ed8',
      '#1e40af', '#1e3a8a', '#1d4ed8', '#1e40af', '#1e3a8a',
      '#1d4ed8', '#1e40af', '#1e3a8a', '#1d4ed8', '#1e40af',
      '#1e3a8a', '#1d4ed8', '#1e40af', '#1e3a8a'
    ];
    

    return Object.entries(dishSales)
      .map(([name, value], index) => ({ 
        name, 
        value,
        color: colors[index % colors.length] 
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
  }


  const getPaymentMethods = () => {
    const paymentMethods: { [key: string]: number } = {}
  
    orderHistory.forEach((order) => {
      if (paymentMethods[order.paymentMode]) {
        paymentMethods[order.paymentMode]++
      } else {
        paymentMethods[order.paymentMode] = 1
      }
    })
  
    return Object.entries(paymentMethods).map(([name, value]) => ({
      name,
      value,
      color: name === "CARD" ? "#3b82f6" : "#10b981",
    }))
  }
  
  const getSalesData = (period: string) => {
    const now = new Date()
    let groupedData: { time: string; amount: number }[] = []
  
    if (period === "daily") {
      groupedData = Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`,
        amount: 0,
      }))
  
      orderHistory.forEach((order) => {
        const hour = new Date(order.createdAt).getHours()
        groupedData[hour].amount += order.totalAmount
      })
    } else if (period === "weekly") {
      groupedData = Array.from({ length: 7 }, (_, i) => ({
        time: new Date(now.setDate(now.getDate() - now.getDay() + i)).toLocaleDateString(),
        amount: 0,
      }))
  
      orderHistory.forEach((order) => {
        const day = new Date(order.createdAt).getDay()
        groupedData[day].amount += order.totalAmount
      })
    } else if (period === "monthly") {
      groupedData = Array.from({ length: 4 }, (_, i) => ({
        time: `Week ${i + 1}`,
        amount: 0,
      }))
  
      orderHistory.forEach((order) => {
        const week = Math.floor(new Date(order.createdAt).getDate() / 7) // Fixed missing parenthesis
        groupedData[week].amount += order.totalAmount
      })
    }
  
    return groupedData
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex flex-col gap-6 p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Reports and Analysis</h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => exportData("csv")}>
                <Table className="mr-2 h-4 w-4" />
                CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportData("excel")}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportData("pdf")}>
                <FileText className="mr-2 h-4 w-4" />
                PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Tabs defaultValue="daily" className="w-full">
          <TabsList>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>

          {["daily", "weekly", "monthly"].map((period) => {
            const { totalRevenue, highestOrder, lowestOrder, averageOrder } = calculateOrderMetrics(period)

            return (
              <TabsContent key={period} value={period} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-5">
                  <Card className="md:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
                      <p className="text-xs text-green-500">+0% from last {period}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Highest Order</CardTitle>
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">₹{highestOrder.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">Top value order</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Lowest Order</CardTitle>
                      <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">₹{lowestOrder.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">Minimum order</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Average Order</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">₹{averageOrder.toFixed(2)}</div>
                      <p className="text-xs text-green-500">+0% from last {period}</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  <Card className="col-span-4">
                    <CardHeader>
                      <CardTitle>Sales Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={getSalesData(period)} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="time" stroke="#888888" fontSize={12} tickLine={false} axisLine={{ stroke: "#888888" }} />
                            <YAxis
                              stroke="#888888"
                              fontSize={12}
                              tickLine={false}
                              axisLine={{ stroke: "#888888" }}
                              tickFormatter={(value) => `₹${value.toLocaleString()}`}
                            />
                            <Tooltip
                              contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "4px" }}
                              formatter={(value: number) => [`₹${value.toLocaleString()}`, "Amount"]}
                            />
                            <Line
                              type="monotone"
                              dataKey="amount"
                              stroke="hsl(var(--primary))"
                              strokeWidth={2}
                              dot={{ r: 4, fill: "hsl(var(--primary))" }}
                              activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Most Selling Dishes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer
                        config={{
                          value: {
                            label: "Sales Share",
                            color: "hsl(var(--primary))",
                          },
                        }}
                        className="h-[300px]"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={getMostSellingDishes()}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={100}
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              labelLine={true}
                            >
                              {getMostSellingDishes().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color || "#3b82f6"} stroke="white" strokeWidth={2} />
                              ))}
                            </Pie>
                            <ChartTooltip />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                          </PieChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Payment Methods</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer
                        config={{
                          value: {
                            label: "Payment Share",
                            color: "hsl(var(--primary))",
                          },
                        }}
                        className="h-[300px]"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={getPaymentMethods()}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={100}
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              labelLine={true}
                            >
                              {getPaymentMethods().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="white" strokeWidth={2} />
                              ))}
                            </Pie>
                            <ChartTooltip />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                          </PieChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            )
          })}
        </Tabs>
      </div>
    </div>
  )
}