import { NextRequest, NextResponse } from "next/server";
import querystring from "querystring";
import { execDb } from "../../../db";

export async function GET(req: NextRequest) {
    const query = querystring.parse(req.url.split("?")[1]);
    const { userId, statTime } = query;
    
    const statSql = 'select (select user_code from user where user_name = ?) as userCode, count(distinct user_id) as userCnt, count(*) as questCnt '
        + 'from user_quest '
        + 'where quest_time > ?';
    const rows: any = await execDb(statSql, [userId, statTime]);
  
    return NextResponse.json({ result: rows.length ? rows[0] : { userCode: '', userCnt: 0, questCnt: 0 } });
}