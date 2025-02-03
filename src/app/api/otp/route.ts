import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request : NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const tableNumber = "0" + searchParams.get('tableNumber');   
    const { otp } = await request.json();


    try {
        const record = await prisma.otp.create({
            data : {
                tableNumber : tableNumber,
                otp : otp
            }
        })

        return NextResponse.json(record, { status: 201 });
    } catch (error) {
        console.error("otp creation error:", error);
        return NextResponse.json(
            { error: "Error while creating otp" },
            { status: 500 }
        );
    }
}


export async function DELETE(request : NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const tableNumber = "0" + searchParams.get('tableNumber'); 


    try {
        await prisma.otp.deleteMany({
            where : {
                tableNumber : tableNumber
            }
        })

        return NextResponse.json(`otp created successfully for table : ${tableNumber}`)
    } catch (error) {
        return NextResponse.json(
            { error: "Error while deleting otp" },
            { status: 500 }
        );
    }
} 