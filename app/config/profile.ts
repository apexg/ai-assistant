
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
        CorpId: "ww3d958fa2c53f1e60",
        AgentId: "1000047",
        RedirectUri: "https://ai.idea-group.cn:7850/callback.html",
        UserInfoApi: "https://ai.idea-group.cn:7850/api/chat/user",
        UserCodeApi: "https://ai.idea-group.cn:7850/api/chat/code",
        UserHeartbeatApi: "https://ai.idea-group.cn:7850/api/chat/heartbeat",
        OnlineUserApi: "https://ai.idea-group.cn:7850/api/chat/online/stat",
        OnlineUserListApi: "https://ai.idea-group.cn:7850/api/chat/online/list",
        OnlineStatDuration: 1,
        Admin: ["qy0197eb6db3bff27e531cca3318", "qy015bebb2b3e9f27a53c839ebe7"]
      };

export default profile;
