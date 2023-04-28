const wecom =
  process.env.NODE_ENV === "development"
    ? {
        CorpId: "wxd7b90b4f3cfb65e8",
        AgentId: "1000030",
        Secret: "jrF7me1RltwpdENlZNCTgMi6ajrD-xrQFNlJ5ZZFnTQ",
        HomeUrl: "https://scrm.idea-group.cn:9024?from=wecom",
        OAuthRedirectUri: "https://scrm.idea-group.cn:9024/api/wecom",
        RedirectUri: "https://scrm.idea-group.cn:9024/callback.html",
        UserInfoApi: "https://scrm.idea-group.cn:9024/api/user",
        UserHeartbeatApi:
          "https://scrm.idea-group.cn:9024/chat/idea/active_online_user",
        OnlineUserListApi:
          "https://scrm.idea-group.cn:9024/chat/idea/count_recent_request_detail",
        OnlineUserApi:
          "https://scrm.idea-group.cn:9024/chat/idea/count_recent_online_users",
        OnlineStatDuration: 5,
        Admin: ["camin"],
      }
    : {
        CorpId: "ww3d958fa2c53f1e60",
        AgentId: "1000047",
        Secret: "",
        HomeUrl: "https://ai.idea-group.cn:7850?from=wecom",
        OAuthRedirectUri: "https://ai.idea-group.cn:7850/api/wecom",
        RedirectUri: "https://ai.idea-group.cn:7850/callback.html",
        UserInfoApi: "https://ai.idea-group.cn:7850/chat/idea/qywechat_info",
        UserHeartbeatApi:
          "https://ai.idea-group.cn:7850/chat/idea/active_online_user",
        OnlineUserListApi:
          "https://ai.idea-group.cn:7850/chat/idea/count_recent_request_detail",
        OnlineUserApi:
          "https://ai.idea-group.cn:7850/chat/idea/count_recent_online_users",
        OnlineStatDuration: 1,
        Admin: ["qy0197eb6db3bff27e531cca3318", "qy015bebb2b3e9f27a53c839ebe7"],
      };

export default wecom;
