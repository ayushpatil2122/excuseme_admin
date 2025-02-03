import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request : NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const tableNumber = "0" + (searchParams.get('tableNumber') ?? '0');



    try {
        const record = await prisma.secure.findFirst({
            where : {
                tableNumber : tableNumber
            }
        })

        if(!record) {
            console.log(`No record found for table number: ${tableNumber}`);
            return NextResponse.json(
                { error: 'Record not found' },
                { status: 404 }
            );
        }

        const updatedRecord = await prisma.secure.update({
            where: { id: record.id },
            data: { isVerified: false }
        });

        console.log(`Updated record:`, updatedRecord);

        return NextResponse.json(
            { message: "Table verified successfully", record: updatedRecord },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error updating secure record:', error);
        return NextResponse.json(
            { error: 'Failed to update record', details: error },
            { status: 500 }
        );
    }   
}