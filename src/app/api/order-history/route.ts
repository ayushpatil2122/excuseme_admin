import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const tableNumber = searchParams.get("tableNumber")

    let query = {}

    if (tableNumber) {
      query = {
        where: {
          tableNumber: parseInt(tableNumber),
        },
        include: {
          items: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }
    } else {
      query = {
        include: {
          items: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }
    }

    const orderHistory = await prisma.orderHistory.findMany(query)

    return NextResponse.json(orderHistory, { status: 200 })
  } catch (error) {
    console.error("Error fetching order history:", error)
    return NextResponse.json(
      { error: "Failed to fetch order history" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { tableNumber, items, totalAmount, paymentMode, status, bookMark = false } = body

    if (!tableNumber || !items || !totalAmount || !paymentMode || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const orderHistory = await prisma.orderHistory.create({
      data: {
        tableNumber,
        totalAmount,
        paymentMode,
        status,
        bookMark,
        items: {
          create: items.map((item: { name: string; quantity: number }) => ({
            name: item.name,
            quantity: item.quantity
          }))
        }
      },
      include: {
        items: true
      }
    })

    return NextResponse.json(orderHistory, { status: 201 })
  } catch (error) {
    console.error("Error creating order history:", error)
    return NextResponse.json(
      { error: "Failed to create order history" },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Order history ID is required" }, { status: 400 })
    }

    const body = await req.json()
    const { tableNumber, totalAmount, paymentMode, status, bookMark, items } = body

    const updateData: any = {}
    if (tableNumber !== undefined) updateData.tableNumber = tableNumber
    if (totalAmount !== undefined) updateData.totalAmount = totalAmount
    if (paymentMode !== undefined) updateData.paymentMode = paymentMode
    if (status !== undefined) updateData.status = status
    if (bookMark !== undefined) updateData.bookMark = bookMark

    const updatedOrderHistory = await prisma.$transaction(async (tx) => {
      if (items) {
        await tx.item.deleteMany({
          where: {
            orderHistoryId: id,
          },
        })

        await tx.item.createMany({
          data: items.map((item: { name: string; quantity: number; price: number }) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            orderHistoryId: id,
          })),
        })
      }

      return tx.orderHistory.update({
        where: {
          id: id,
        },
        data: updateData,
        include: {
          items: true,
        },
      })
    })

    return NextResponse.json(updatedOrderHistory, { status: 200 })
  } catch (error) {
    console.error("Error updating order history:", error)
    return NextResponse.json({ error: "Failed to update order history" }, { status: 500 })
  }
}

