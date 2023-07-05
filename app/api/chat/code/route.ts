import { NextRequest, NextResponse } from "next/server";
import querystring from "querystring";
import { execDb } from "../../db";

export async function GET(req: NextRequest) {
    const query = querystring.parse(req.url.split("?")[1]);
    const { userId } = query;
    
    const statSql = 'select user_code as userCode from user where user_name = ?';
    const rows: any = await execDb(statSql, [userId]);
  
    return NextResponse.json({ result: rows.length ? rows[0] : { userCode: '' } });
}