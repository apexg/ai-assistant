import { useState, useEffect, useRef, useImperativeHandle } from "react";
import { showToast } from "./ui-lib";

import styles from "./home.module.scss";

import { IconButton } from "./button";
import SettingsIcon from "../icons/settings.svg";
import GithubIcon from "../icons/github.svg";
import ChatGptIcon from "../icons/chatgpt.svg";
import LoadingIcon from "../icons/three-dots.svg";
import AddIcon from "../icons/add.svg";
import UserIcon from "../icons/head.svg";
import LogoutIcon from "../icons/logout.svg";
import CloseIcon from "../icons/close.svg";
import Locale from "../locales";

import { useAppConfig, useChatStore } from "../store";

import {
  MAX_SIDEBAR_WIDTH,
  MIN_SIDEBAR_WIDTH,
  NARROW_SIDEBAR_WIDTH,
  Path,
  REPO_URL,
} from "../constant";

import { Link, useNavigate } from "react-router-dom";
import { isMobileScreen, useMobileScreen } from "../utils";
import dynamic from "next/dynamic";
import { setInterval } from "timers";
import Wecom from "../config/wecom";
import {
  loadOnlineUser,
  loadOnlineUserList,
  loadUserInfo,
  getCurrentUser,
  setCurrentUser,
  getUserCode,
  setUserCode,
  clearUser,
  isWeCom,
  getWeComCode,
} from "./common";

const ChatList = dynamic(async () => (await import("./chat-list")).ChatList, {
  loading: () => null,
});

function useDragSideBar() {
  const limit = (x: number) =>
    Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, x));

  const config = useAppConfig();
  const startX = useRef(0);
  const startDragWidth = useRef(config.sidebarWidth ?? 300);
  const lastUpdateTime = useRef(Date.now());
  const lastDragWidth = useRef(config.sidebarWidth ?? 300);

  const handleMouseMove = useRef((e: MouseEvent) => {
    if (Date.now() < lastUpdateTime.current + 50) {
      return;
    }
    lastUpdateTime.current = Date.now();
    const d = e.clientX - startX.current;
    const nextWidth = limit(startDragWidth.current + d);
    config.update((config) => (config.sidebarWidth = nextWidth));
  });

  const handleMouseUp = useRef(() => {
    // startDragWidth.current = config.sidebarWidth ?? 300;
    startDragWidth.current = lastDragWidth.current;
    window.removeEventListener("mousemove", handleMouseMove.current);
    window.removeEventListener("mouseup", handleMouseUp.current);
  });

  const onDragMouseDown = (e: MouseEvent) => {
    startX.current = e.clientX;

    window.addEventListener("mousemove", handleMouseMove.current);
    window.addEventListener("mouseup", handleMouseUp.current);
  };
  const isMobileScreen = useMobileScreen();
  const shouldNarrow =
    !isMobileScreen && config.sidebarWidth < MIN_SIDEBAR_WIDTH;

  useEffect(() => {
    const barWidth = shouldNarrow
      ? NARROW_SIDEBAR_WIDTH
      : limit(config.sidebarWidth ?? 300);
    const sideBarWidth = isMobileScreen ? "100vw" : `${barWidth}px`;
    document.documentElement.style.setProperty("--sidebar-width", sideBarWidth);
    lastDragWidth.current = barWidth;
  }, [config.sidebarWidth, isMobileScreen, shouldNarrow]);

  return {
    onDragMouseDown,
    shouldNarrow,
  };
}

function TimeDurationSelect(props: {
  statTime?: number;
  onChange?: (evt: any) => void;
  onClick?: () => void;
}) {
  return (
    <select
      onChange={props?.onChange}
      onClick={props.onClick}
      value={props?.statTime}
    >
      <option value={1}>1 {Locale.Home.StatFilterMinute}</option>
      <option value={5}>5 {Locale.Home.StatFilterMinute}</option>
      <option value={10}>10 {Locale.Home.StatFilterMinute}</option>
      <option value={30}>30 {Locale.Home.StatFilterMinute}</option>
      <option value={60}>1 {Locale.Home.StatFilterHour}</option>
      <option value={1440}>1 {Locale.Home.StatFilterDay}</option>
      <option value={7200}>5 {Locale.Home.StatFilterDay}</option>
      <option value={10080}>7 {Locale.Home.StatFilterDay}</option>
      <option value={43200}>30 {Locale.Home.StatFilterDay}</option>
    </select>
  );
}

export function SideBar(props: {
  className?: string;
  onAuthLogin?: (user: any) => void; // 企微工作台登录事件
  onQRLoginCallback?: (callback: (user: any) => void) => void; // chat登录回调
  onLogout?: () => void; // 退出事件
}) {
  const chatStore = useChatStore();
  const isMobileScreen = useMobileScreen();

  // drag side bar
  const { onDragMouseDown, shouldNarrow } = useDragSideBar();
  const navigate = useNavigate();

  const statTime = useRef(Wecom.OnlineStatDuration);
  const [isShowLoginLoading, setIsShowLoginLoading] = useState(false);
  const [userInfo, setUserInfo] = useState({
    userId: "",
    userName: Locale.Home.NoLogin,
  });
  const [statInfo, setStatInfo] = useState({
    online_users_count: 0,
    total_request_count: 0,
    user_code: "",
  });
  const [isShowStatList, setIsShowStatList] = useState(false);
  const [statList, setStatList] = useState({
    online_users_count: 0,
    total_request_count: 0,
    user_requests_detail: [],
  });

  const userTimer = useRef<NodeJS.Timeout>();

  const getDisplayTime = (dateTimeString: string) => {
    const now = new Date();
    const time = new Date(dateTimeString);

    if (time.getFullYear() === now.getFullYear()) {
      if (time.toDateString() === now.toDateString()) {
        return dateTimeString.substring(11);
      } else {
        return dateTimeString.substring(5);
      }
    }
    return dateTimeString;
  };

  const deleteSession = () => {
    if (!!getCurrentUser(userInfo)?.userId) {
      chatStore.deleteSession();
    } else {
      showToast(Locale.Home.NoLogin, undefined, 2000);
    }
  };

  const newSession = () => {
    if (!!getCurrentUser(userInfo)?.userId) {
      chatStore.newSession();
    } else {
      showToast(Locale.Home.NoLogin, undefined, 2000);
    }
  };

  const logout = () => {
    clearUser();
    setUserInfo({ userId: "", userName: Locale.Home.NoLogin });
    setIsShowStatList(false);
    props.onLogout && props.onLogout();
  };

  const getStatTime = (evt: any) => {
    let recent_minutes = 1;
    if (typeof evt === "number") {
      recent_minutes = evt;
    } else if (evt) {
      recent_minutes = parseInt(evt.currentTarget.value);
      evt.currentTarget.blur();
      statTime.current = recent_minutes;
    } else {
      recent_minutes = statTime.current;
    }
    return recent_minutes;
  };

  const loadStatSummary = (evt?: any) => {
    console.log("定时---------------------" + new Date());
    const user_id = getCurrentUser(userInfo)?.userId;
    console.log("1");
    if (!!user_id) {
      console.log("2");
      const recent_minutes = getStatTime(evt);
      loadOnlineUser(user_id, recent_minutes)
        .then((res) => {
          if (res.result) {
            if (!isWeCom() && res.result.user_code !== getUserCode()) {
              setTimeout(logout, 10000);
              showToast(Locale.Home.Offline, undefined, 10000);
            } else {
              setStatInfo(res.result);
            }
          } else {
            console.log(Locale.Home.GetOnlineUserSummaryFail);
          }
        })
        .catch((err) => {
          console.error(err);
          if (evt) {
            showToast(Locale.Home.GetOnlineUserSummaryFail, undefined, 2000);
          }
        });
    } else if (evt) {
      showToast(Locale.Home.NoLogin, undefined, 2000);
    }
  };

  const loadStatList = (evt: any) => {
    const recent_minutes = getStatTime(evt);
    loadOnlineUserList(recent_minutes)
      .then((res) => {
        if (res.result) {
          setStatList(res.result);
          setStatInfo(
            Object.assign(
              {},
              statInfo,
              (({ user_requests_detail, ...rest }) => rest)(res.result),
            ),
          );
        } else {
          showToast(Locale.Home.GetOnlineStatListFail, undefined, 2000);
        }
      })
      .catch((err) => {
        console.error(err);
        showToast(Locale.Home.GetOnlineStatListFail, undefined, 2000);
      });
  };

  const showStatList = () => {
    if (!!getCurrentUser(userInfo)?.userId) {
      setIsShowStatList(true);
      loadStatList(statTime.current);
    } else {
      showToast(Locale.Home.NoLogin, undefined, 2000);
    }
  };

  useImperativeHandle(props.onQRLoginCallback, () => setUserInfo);

  useEffect(() => {
    if (!getCurrentUser(userInfo)?.userId && isWeCom()) {
      const code = getWeComCode();
      if (code) {
        setUserCode(code);
        setIsShowLoginLoading(true);
        loadUserInfo(code)
          .then((user) => {
            setIsShowLoginLoading(false);
            setCurrentUser(user);
            setUserInfo(user);
            props.onAuthLogin && props.onAuthLogin(user);
          })
          .catch((err) => {
            console.error(err);
            setIsShowLoginLoading(false);
            showToast(Locale.Chat.NoUser, undefined, 2000);
          });
      }
    }

    loadStatSummary();
    userTimer.current = setInterval(loadStatSummary, 60 * 1000);
    return () => clearInterval(userTimer.current);
  }, []);

  return (
    <div
      className={`${styles.sidebar} ${props.className} ${
        shouldNarrow && styles["narrow-sidebar"]
      }`}
    >
      <div className={styles["sidebar-header"]}>
        <div className={styles["sidebar-title"]}>{Locale.Home.HomeTitle}</div>
        <div className={styles["sidebar-sub-title"]}>
          {Locale.Home.HomeDesc}
        </div>
        <div className={styles["sidebar-logo"]}>
          <ChatGptIcon />
        </div>
      </div>

      <div
        className={styles["sidebar-body"]}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            navigate(Path.Home);
          }
        }}
      >
        <ChatList narrow={shouldNarrow} />
      </div>

      <div className={styles["sidebar-tail"]}>
        <div className={styles["sidebar-actions"]}>
          <div className={styles["sidebar-action"] + " " + styles.mobile}>
            <IconButton icon={<CloseIcon />} onClick={deleteSession} />
          </div>
          <div className={styles["sidebar-action"]}>
            <Link to={Path.Settings}>
              <IconButton icon={<SettingsIcon />} shadow />
            </Link>
          </div>
          <div className={styles["sidebar-action"]}>
            <IconButton
              icon={<UserIcon />}
              text={getCurrentUser(userInfo)?.userName}
            />
          </div>
          {!!getCurrentUser(userInfo)?.userId && (
            <div className={styles["sidebar-action"]}>
              <IconButton
                icon={<LogoutIcon />}
                onClick={logout}
                title={Locale.Home.Logout}
              />
            </div>
          )}
        </div>
        <div>
          <IconButton
            icon={<AddIcon />}
            text={shouldNarrow ? undefined : Locale.Home.NewChat}
            onClick={newSession}
            shadow
          />
        </div>
      </div>

      <div className={styles["sidebar-tail"]}>
        <div className={styles["sidebar-actions"]}>
          <span className={styles["sidebar-stat"]}>
            {Locale.Home.StatFilterLabel}
          </span>
          <TimeDurationSelect
            statTime={statTime.current}
            onChange={loadStatSummary}
            onClick={() => setIsShowStatList(false)}
          />
          <a className={styles["sidebar-stat"]} onClick={showStatList}>
            {Locale.Home.OnlineCount(statInfo.online_users_count)}
          </a>
          <a className={styles["sidebar-stat"]} onClick={showStatList}>
            {Locale.Home.MsgCount(statInfo.total_request_count)}
          </a>
        </div>
      </div>

      {isShowLoginLoading && (
        <div className={styles["chat-login-loading"]}>
          <LoadingIcon />
        </div>
      )}

      {isShowStatList ? (
        <div className={styles["stat-list"]}>
          <div className={styles["stat-list-title"]}>
            {Locale.Home.StatTitle}
          </div>
          <div className={styles["stat-list-filter"]}>
            <div>
              {Locale.Home.StatFilterLabel}
              <TimeDurationSelect
                statTime={statTime.current}
                onChange={loadStatList}
              />
            </div>
            <div>{Locale.Home.OnlineCount(statList.online_users_count)}</div>
            <div>
              {statList.total_request_count} {Locale.Home.StatMsgCountColName}
            </div>
          </div>
          <div className={styles["stat-list-data"]}>
            <table>
              <thead>
                <tr>
                  <th>{Locale.Home.No}</th>
                  <th>{Locale.Home.StatNameColName}</th>
                  <th>{Locale.Home.StatAskTimeColName}</th>
                  <th>{Locale.Home.StatMsgCountColName}</th>
                </tr>
              </thead>
              <tbody>
                {statList.user_requests_detail.map(
                  ({ name, request_count, latest_time }, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{name}</td>
                      <td>{getDisplayTime(latest_time)}</td>
                      <td>{request_count}</td>
                    </tr>
                  ),
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td>{Locale.Home.StatTotalColName}</td>
                  <td></td>
                  <td></td>
                  <td>{statList.total_request_count}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className={styles["panel-close"]}>
            <IconButton
              icon={<CloseIcon />}
              onClick={() => setIsShowStatList(false)}
            />
          </div>
        </div>
      ) : (
        <></>
      )}
      <div
        className={styles["sidebar-drag"]}
        onMouseDown={(e) => onDragMouseDown(e as any)}
      ></div>
    </div>
  );
}
