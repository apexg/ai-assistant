import { NextRequest, NextResponse } from "next/server";
import querystring from "querystring";
import Wecom from "../../config/wecom";

export async function GET(req: NextRequest) {
  const query = querystring.parse(req.url.split("?")[1]);
  const { code, state } = query;

  console.log("地址是-------" + req.url);
  if (code && state === "redirect") {
    console.log("进入了---------------" + code);
    const url = `${Wecom.HomeUrl}&code=${code}`;
    console.log("进入了，地址是---------------" + url);
    return NextResponse.redirect(`${Wecom.HomeUrl}&code=${code}`);
  } else {
    const redirectUrl = querystring.escape(Wecom.OAuthRedirectUri);
    const url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${Wecom.CorpId}&redirect_uri=${redirectUrl}&response_type=code&scope=snsapi_base&state=redirect#wechat_redirect`;
    console.log("回调地址------------------" + url);
    return NextResponse.redirect(url);
  }
}
