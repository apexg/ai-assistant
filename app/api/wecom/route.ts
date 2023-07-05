import { NextRequest, NextResponse } from "next/server";
import querystring from "querystring";
import Profile from "../profile";

export async function GET(req: NextRequest) {
  const query = querystring.parse(req.url.split("?")[1]);
  const { code, state } = query;

  if (code && state === "redirect") {
    return NextResponse.redirect(`${Profile.HomeUrl}&code=${code}`);
  } else {
    const redirectUrl = querystring.escape(Profile.OAuthRedirectUri);
    const url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${Profile.CorpId}&redirect_uri=${redirectUrl}&response_type=code&scope=snsapi_base&state=redirect#wechat_redirect`;
    return NextResponse.redirect(url);
  }
}
