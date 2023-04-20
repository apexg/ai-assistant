const wecom = process.env.NODE_ENV === 'development' ? {
  CorpId: "wxd7b90b4f3cfb65e8",
  AgentId: "1000030",
  RedirectUri: "https://scrm.idea-group.cn:9024/callback.html",
  UserInfoApi: "https://scrm.idea-group.cn:9024/chat/idea/qywechat_info",
  UserHeartbeatApi: "https://scrm.idea-group.cn:9024/chat/idea/active_online_user",
  OnlineUserListApi: "https://scrm.idea-group.cn:9024/chat/idea/count_recent_request_detail",
  OnlineUserApi: "https://scrm.idea-group.cn:9024/chat/idea/count_recent_online_users",
  Admin: [ "camin" ]
} : {
  CorpId: "ww3d958fa2c53f1e60",
  AgentId: "1000047",
  RedirectUri: "https://ai.idea-group.cn:7850/callback.html",
  UserInfoApi: "https://ai.idea-group.cn:7850/chat/idea/qywechat_info",
  UserHeartbeatApi: "https://ai.idea-group.cn:7850/chat/idea/active_online_user",
  OnlineUserListApi: "https://ai.idea-group.cn:7850/chat/idea/count_recent_request_detail",
  OnlineUserApi: "https://ai.idea-group.cn:7850/chat/idea/count_recent_online_users",
  Admin: [ "qy0197eb6db3bff27e531cca3318", "qy015bebb2b3e9f27a53c839ebe7" ]
};

export default wecom;
