import Locale from "../locales";
import Wecom from "../config/wecom";

// 公共的请求方法
export async function request(options: {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  data?: any;
}) {
  let opt: Record<string, any> = {
    method: options.method || "GET",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  };

  if (options.headers) {
    opt.headers = Object.assign(opt.headers, options.headers);
  }
  if (options.data) {
    opt.body = JSON.stringify(options.data);
  }

  return fetch(options.url, opt).then((res) => res.json());
}

// 获取在线统计（定时执行）
export function loadOnlineUser(userId: string, recentMinutes: number) {
  return request({
    url: Wecom.OnlineUserApi,
    method: "POST",
    data: { user_id: userId, recent_minutes: recentMinutes },
  });
}

// 获取在线统计清单
export function loadOnlineUserList(recentMinutes: number) {
  return request({
    url: Wecom.OnlineUserListApi,
    method: "POST",
    data: { recent_minutes: recentMinutes },
  });
}

// 根据企业微信code获取用户信息
export function loadUserInfo(userCode: string) {
  return request({
    url: Wecom.UserInfoApi,
    method: "POST",
    data: { text: userCode },
  }).then((res) => {
    if (res.result && res.result.userid) {
      return {
        userId: res.result.userid,
        userName: res.result.username,
      };
    } else {
      throw new Error(Locale.Chat.NoUser);
    }
  });
}

// 用户心跳（提问一次算一次心跳）
export function loadUserHeartbeat(userId: string) {
  return request({
    url: Wecom.UserHeartbeatApi,
    method: "POST",
    data: { user_id: userId },
  });
}

// 从url获取企业微信code
export function getWeComCode() {
  if (sessionStorage.getItem("is_first") === "true") {
    sessionStorage.removeItem("is_first");
    return new URLSearchParams(window.location.search)?.get("code");
  }
  return null;
}

// 是否企业微信客户端进入
export function isWeCom() {
  if (sessionStorage.getItem("is_wecom") === "true") {
    return true;
  } else {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams?.get("code") && urlParams?.get("from") === "wecom") {
      sessionStorage.setItem("is_wecom", "true");
      sessionStorage.setItem("is_first", "true");
      return true;
    }
  }

  return false;
}

// 获取缓存的当前用户
export function getCurrentUser(user?: any) {
  if (user && user.userId) {
    return user;
  }

  const userStorage = localStorage.getItem("current_user");
  if (userStorage) {
    return JSON.parse(userStorage);
  }

  return null;
}

// 设置当前用户到缓存
export function setCurrentUser(user: any) {
  localStorage.setItem("current_user", JSON.stringify(user));
}

// 获取缓存的企业微信code
export function getUserCode() {
  return localStorage.getItem("ww_code");
}

// 设置企业微信code到缓存
export function setUserCode(code: any) {
  localStorage.setItem("ww_code", code);
}

// 清除用户缓存
export function clearUser() {
  localStorage.removeItem("ww_code");
  localStorage.removeItem("current_user");
}
