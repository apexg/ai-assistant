import { NextRequest, NextResponse } from "next/server";
import { execDb, bigInt } from "../../db";

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { userId, questTime } = body;
    
    const questSql = 'insert into user_quest (id, user_id, quest_time) select ?, id, ? from user where user_name = ?';
    execDb(questSql, [bigInt(), questTime, userId])
  
    return NextResponse.json({ code: 0 });
}