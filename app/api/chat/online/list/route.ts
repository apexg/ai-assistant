import { NextRequest, NextResponse } from "next/server";
import querystring from "querystring";
import { execDb } from "../../../db";

export async function GET(req: NextRequest) {
    const query = querystring.parse(req.url.split("?")[1]);
    const { statTime } = query;

    const statSql = 'select b.alias_name as name, count(*) as questCnt, max(quest_time) as questTime '
        + 'from user_quest as a '
        + 'inner join user as b on a.user_id = b.id '
        + 'where a.quest_time > ? '
        + 'group by b.alias_name '
        + 'order by questTime desc';
    const rows = await execDb(statSql, [statTime]);

    return NextResponse.json({ result: rows });
}