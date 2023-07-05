import { NextRequest, NextResponse } from "next/server";
import { request } from "../../common";
import { execDb, bigInt } from "../../db";
import Profile from "../../profile";

export async function POST(req: NextRequest) {
  const corpId = Profile.CorpId;
  const secret = Profile.Secret;
  const body = await req.json();
  const { userCode } = body;

  let res;
  let token = global.cachedData.get(corpId);
  if (!token || token.expires < Date.now() - 60 * 1000) {
    res = await request({
      url: 'https://qyapi.weixin.qq.com/cgi-bin/gettoken',
      data: { corpid: corpId, corpsecret: secret }
    });
    if (res.access_token) {
      token = {
        access_token: res.access_token,
        expires: Date.now() + res.expires_in * 1000,
      };
      global.cachedData.set(corpId, token, res.expires_in);
    }
  }

  if (token) {
    res = await request({
      url: 'https://qyapi.weixin.qq.com/cgi-bin/auth/getuserinfo',
      data: { access_token: token.access_token, code: userCode }
    });
    if (res.userid) {
      res = await request({
        url: 'https://qyapi.weixin.qq.com/cgi-bin/user/get',
        data: { access_token: token.access_token, userid: res.userid }
      });
      if (res.name) {
        const user = {
          userId: res.userid,
          userName: res.name
        }
        const userSql = 'select id from user where user_name = ?';
        const insertSql = 'insert ignore into user (id, user_name, alias_name, user_code) values (?, ?, ?, ?)';
        const updateSql = 'update user set alias_name = ?, user_code = ? where id = ?';
        const loginSql = 'insert into user_login (id, user_id, access_ip, login_time) values (?, ?, ?, ?)';

        const rows: any = await execDb(userSql, [user.userId]);
        let id;
        if (rows.length) {
          id = BigInt(rows[0].id);
          execDb(updateSql, [user.userName, userCode, id]);
        } else {
          id = bigInt();
          execDb(insertSql, [id, user.userId, user.userName, userCode]);
        }
        execDb(loginSql, [bigInt(), id, req.ip || req.headers.get('x-forwarded-for'), Date.now()]);
        
        return NextResponse.json({
          userId: res.userid,
          userName: res.name
        });
      }
    }
  }

  return NextResponse.json(res, { status: 500 });
}
