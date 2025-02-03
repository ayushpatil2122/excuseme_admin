import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request : NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const tableNumber = (searchParams.get('tableNumber') ?? '0');

    try {
        await prisma.idAllocated.deleteMany({
            where : {
                tableNumber : tableNumber
            }
        })

        return NextResponse.json(`idAllocated deleted on tableNumber ${tableNumber}`);
    } catch (error) {
        console.error("Error deleting idAllocated:", error);
        return NextResponse.json(
            { error: "Error while deleting idAllocated" },
            { status: 500 }
        );       
    }
}