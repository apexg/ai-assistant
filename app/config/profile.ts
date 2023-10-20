
const profile =
  process.env.NODE_ENV === "development"
    ? {
        CorpId: "wxd7b90b4f3cfb65e8",
        AgentId: "1000030",
        RedirectUri: "https://scrm.idea-group.cn:9024/callback.html",
        UserInfoApi: "https://scrm.idea-group.cn:9024/api/chat/user",
        UserCodeApi: "https://scrm.idea-group.cn:9024/api/chat/code",
        UserHeartbeatApi: "https://scrm.idea-group.cn:9024/api/chat/heartbeat",
        OnlineUserApi: "https://scrm.idea-group.cn:9024/api/chat/online/stat",
        OnlineUserListApi: "https://scrm.idea-group.cn:9024/api/chat/online/list",
        OnlineStatDuration: 5,
        Admin: ["camin"]
      }
    : {
        CorpId: "wxa31c5a6be71ee9b7",
        AgentId: "5",
        RedirectUri: "https://apexg1.zeabur.app/callback.html",
        UserInfoApi: "https://apexg1.zeabur.app/api/chat/user",
        UserCodeApi: "https://apexg1.zeabur.app/api/chat/code",
        UserHeartbeatApi: "https://apexg1.zeabur.app/api/chat/heartbeat",
        OnlineUserApi: "https://apexg1.zeabur.app/api/chat/online/stat",
        OnlineUserListApi: "https://apexg1.zeabur.app/api/chat/online/list",
        OnlineStatDuration: 1,
        Admin: ["zxg"]
      };

export default profile;
