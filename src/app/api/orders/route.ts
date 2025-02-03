import { NextResponse } from "next/server";

import prisma from "@/lib/db";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const tableNumber = parseInt(searchParams.get('tableNumber') ?? '0');

        const orders = await prisma.order.findMany({
            where: {
                tableNumber: tableNumber
            },
            orderBy: {
                id: 'desc'
            }
        });

        return NextResponse.json(orders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        return NextResponse.json(
            { error: "Error while fetching orders" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const tableNumber = parseInt(searchParams.get('tableNumber') ?? '0');
    
    try {
        await prisma.order.deleteMany({
            where : {
                tableNumber : tableNumber
            }
        })

        return NextResponse.json(`order deleted on tableNumber ${tableNumber}`);

    } catch (error) {
        console.error("Error deleting order orders:", error);
        return NextResponse.json(
            { error: "Error while deleting orders" },
            { status: 500 }
        );
    }
}