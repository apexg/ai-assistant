import Profile from "../config/profile";

const profile =
  process.env.NODE_ENV === "development"
    ? {
        CorpId: Profile.CorpId,
        Secret: "jrF7me1RltwpdENlZNCTgMi6ajrD-xrQFNlJ5ZZFnTQ",
        HomeUrl: "https://scrm.idea-group.cn:9024?from=wecom",
        OAuthRedirectUri: "https://scrm.idea-group.cn:9024/api/wecom",
        MySQL: {
          Host: "172.56.2.230",
          Port: "3306",
          User: "root",
          Pwd: "idea@1234",
          Database: "appplatdb"
        }
      }
    : {
        CorpId: Profile.CorpId,
        Secret: "-bZzNz3bsRkZjyFx2BJW9EWN8wyEeZBBeQoPqL4Wddw",
        HomeUrl: "https://laughsky.zeabur.app?from=wecom",
        OAuthRedirectUri: "https://laughsky.zeabur.app/api/wecom",
        MySQL: {
          Host: "124.71.215.126",
          Port: "13306",
          User: "cam",
          Pwd: "QAZwsx123",
          Database: "cam"
        }
      };

export default profile;