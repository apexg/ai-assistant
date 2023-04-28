import Locale from "../locales";
import Wecom from "../config/wecom";

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

export function loadOnlineUser(userId: string, recentMinutes: number) {
  return request({
    url: Wecom.OnlineUserApi,
    method: "POST",
    data: { user_id: userId, recent_minutes: recentMinutes },
  });
}

export function loadOnlineUserList(recentMinutes: number) {
  return request({
    url: Wecom.OnlineUserListApi,
    method: "POST",
    data: { recent_minutes: recentMinutes },
  });
}

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

export function loadUserHeartbeat(userId: string) {
  return request({
    url: Wecom.UserHeartbeatApi,
    method: "POST",
    data: { user_id: userId },
  });
}

export function getWeComCode() {
  if (sessionStorage.getItem("is_first") === "true") {
    sessionStorage.removeItem("is_first");
    return new URLSearchParams(window.location.search)?.get("code");
  }
  return null;
}

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

export function setCurrentUser(user: any) {
  localStorage.setItem("current_user", JSON.stringify(user));
}

export function getUserCode() {
  return localStorage.getItem("ww_code");
}

export function setUserCode(code: any) {
  localStorage.setItem("ww_code", code);
}

export function clearUser() {
  localStorage.removeItem("ww_code");
  localStorage.removeItem("current_user");
  localStorage.removeItem("is_wecom");
}
