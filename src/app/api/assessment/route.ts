import { NextResponse } from "next/server";
import { computeAndSaveAssessment } from "@/actions/assessment.actions";
export async function GET() {
    try {
        const result =
            await computeAndSaveAssessment();
        return NextResponse.json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error(error);
    }

    return NextResponse.json(
    {
        success: false,
        error:
            "Assessment generation failed.",
    },
    {
        status: 500,
    }
    );
}
