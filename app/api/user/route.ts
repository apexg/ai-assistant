import { NextRequest, NextResponse } from "next/server";
import { request } from "../common";
import Wecom from "../../config/wecom";
const Cache = require("node-cache");
const cachedData = new Cache();

export async function POST(req: NextRequest) {
  const corpId = Wecom.CorpId;
  const secret = Wecom.Secret;
  const body = await req.json();
  const { text } = body;

  let res;
  let token = cachedData.get(corpId);
  if (!token || token.expires < Date.now() - 60 * 1000) {
    res = await request({
      url: `https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${corpId}&corpsecret=${secret}`,
    });
    if (res.access_token) {
      token = {
        access_token: res.access_token,
        expires: Date.now() + res.expires_in * 1000,
      };
      cachedData.set(corpId, token, res.expires_in);
    }
  }

  if (token) {
    res = await request({
      url: `https://qyapi.weixin.qq.com/cgi-bin/auth/getuserinfo?access_token=${token.access_token}&code=${text}`,
    });
    if (res.userid) {
      res = await request({
        url: `https://qyapi.weixin.qq.com/cgi-bin/user/get?access_token=${token.access_token}&userid=${res.userid}`,
      });
      if (res.name) {
        return NextResponse.json({
          result: {
            userid: res.userid,
            username: res.name,
          },
        });
      }
    }
  }

  return NextResponse.json(res, { status: 500 });
}
