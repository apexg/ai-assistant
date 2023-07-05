
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
        AgentId: "2",
        RedirectUri: "https://laughsky.zeabur.app/callback.html",
        UserInfoApi: "https://laughsky.zeabur.app/api/chat/user",
        UserCodeApi: "https://laughsky.zeabur.app/api/chat/code",
        UserHeartbeatApi: "https://laughsky.zeabur.app/api/chat/heartbeat",
        OnlineUserApi: "https://laughsky.zeabur.app/api/chat/online/stat",
        OnlineUserListApi: "https://laughsky.zeabur.app/api/chat/online/list",
        OnlineStatDuration: 1,
        Admin: ["camin"]
      };

export default profile;
