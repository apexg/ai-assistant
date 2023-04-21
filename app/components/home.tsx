"use client";

require("../polyfill");

import { useState, useEffect, useRef } from "react";
import { showToast } from "./ui-lib";

import { IconButton } from "./button";
import styles from "./home.module.scss";

import SettingsIcon from "../icons/settings.svg";
import GithubIcon from "../icons/github.svg";
import ChatGptIcon from "../icons/chatgpt.svg";

import BotIcon from "../icons/bot.svg";
import AddIcon from "../icons/add.svg";
import UserIcon from "../icons/head.svg";
import LogoutIcon from "../icons/logout.svg";
import LoadingIcon from "../icons/three-dots.svg";
import CloseIcon from "../icons/close.svg";

import { useChatStore } from "../store";
import { isMobileScreen } from "../utils";
import Locale from "../locales";
import { Chat } from "./chat";

import dynamic from "next/dynamic";
import { REPO_URL } from "../constant";
import { ErrorBoundary } from "./error";
import { setInterval } from "timers";
import Wecom from "../config/wecom";

export function Loading(props: { noLogo?: boolean }) {
  return (
    <div className={styles["loading-content"]}>
      {!props.noLogo && <BotIcon />}
      <LoadingIcon />
    </div>
  );
}

const Settings = dynamic(async () => (await import("./settings")).Settings, {
  loading: () => <Loading noLogo />,
});

const ChatList = dynamic(async () => (await import("./chat-list")).ChatList, {
  loading: () => <Loading noLogo />,
});

function useSwitchTheme() {
  const config = useChatStore((state) => state.config);

  useEffect(() => {
    document.body.classList.remove("light");
    document.body.classList.remove("dark");

    if (config.theme === "dark") {
      document.body.classList.add("dark");
    } else if (config.theme === "light") {
      document.body.classList.add("light");
    }

    const metaDescriptionDark = document.querySelector(
      'meta[name="theme-color"][media]',
    );
    const metaDescriptionLight = document.querySelector(
      'meta[name="theme-color"]:not([media])',
    );

    if (config.theme === "auto") {
      metaDescriptionDark?.setAttribute("content", "#151515");
      metaDescriptionLight?.setAttribute("content", "#fafafa");
    } else {
      const themeColor = getComputedStyle(document.body)
        .getPropertyValue("--theme-color")
        .trim();
      metaDescriptionDark?.setAttribute("content", themeColor);
      metaDescriptionLight?.setAttribute("content", themeColor);
    }
  }, [config.theme]);
}

function useDragSideBar() {
  const limit = (x: number) => Math.min(500, Math.max(290, x));

  const chatStore = useChatStore();
  const startX = useRef(0);
  const startDragWidth = useRef(chatStore.config.sidebarWidth ?? 300);
  const lastUpdateTime = useRef(Date.now());

  const handleMouseMove = useRef((e: MouseEvent) => {
    if (Date.now() < lastUpdateTime.current + 100) {
      return;
    }
    lastUpdateTime.current = Date.now();
    const d = e.clientX - startX.current;
    const nextWidth = limit(startDragWidth.current + d);
    chatStore.updateConfig((config) => (config.sidebarWidth = nextWidth));
  });

  const handleMouseUp = useRef(() => {
    startDragWidth.current = chatStore.config.sidebarWidth ?? 300;
    window.removeEventListener("mousemove", handleMouseMove.current);
    window.removeEventListener("mouseup", handleMouseUp.current);
  });

  const onDragMouseDown = (e: MouseEvent) => {
    startX.current = e.clientX;

    window.addEventListener("mousemove", handleMouseMove.current);
    window.addEventListener("mouseup", handleMouseUp.current);
  };

  useEffect(() => {
    if (isMobileScreen()) {
      return;
    }

    document.documentElement.style.setProperty(
      "--sidebar-width",
      `${limit(chatStore.config.sidebarWidth ?? 300)}px`,
    );
  }, [chatStore.config.sidebarWidth]);

  return {
    onDragMouseDown,
  };
}

const useHasHydrated = () => {
  const [hasHydrated, setHasHydrated] = useState<boolean>(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  return hasHydrated;
};

function TimeDurationSelect(props: {
  statTime?: number;
  onChange?: (evt : any) => void;
  onClick?: () => void;
}) {
  return (
    <select onChange={props?.onChange} onClick={props.onClick} value={props?.statTime}>
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

function _Home() {
  const [createNewSession, currentIndex, removeSession] = useChatStore(
    (state) => [
      state.newSession,
      state.currentSessionIndex,
      state.removeSession,
    ],
  );
  const chatStore = useChatStore();
  const loading = !useHasHydrated();
  const [showSideBar, setShowSideBar] = useState(true);
  const [userInfo, setUserInfo] = useState({ userId: "", userName: Locale.Home.NoLogin });
  const [statInfo, setStatInfo] = useState({ online_users_count: 0, total_request_count: 0 });
  const [isShowStatList, setIsShowStatList] = useState(false);
  const [statTime, setStatTime] = useState(Wecom.OnlineStatDuration);
  const [statList, setStatList] = useState({ online_users_count: 0, total_request_count:0, user_requests_detail: [] });

  // setting
  const [openSettings, setOpenSettings] = useState(false);
  const config = useChatStore((state) => state.config);

  // drag side bar
  const { onDragMouseDown } = useDragSideBar();
  const userTimer = useRef<NodeJS.Timeout>();
  const getCurrentUser = () => {
    if (!userInfo.userId) {
      const currentUser = localStorage.getItem("current_user");
      if (currentUser) {
        return JSON.parse(currentUser);
      }
    }
    return userInfo;
  }

  const logout = () => {
    localStorage.removeItem("ww_code")
    localStorage.removeItem("current_user")
    setUserInfo({ userId: "", userName: Locale.Home.NoLogin })
  }

  const getStatTime = (evt : any) => {
    let recent_minutes = statTime;
    if (typeof(evt) === "number") {
      recent_minutes = evt;
    } else if (evt) {
      recent_minutes = parseInt(evt.currentTarget.value);
      evt.currentTarget.blur();
      setStatTime(recent_minutes);
    }
    return recent_minutes;
  }

  const loadStatSummary = (evt?: any) => {
    const user_id = getCurrentUser().userId;
    if (!!user_id) {
      let recent_minutes = getStatTime(evt);
      fetch(Wecom.OnlineUserApi, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recent_minutes, user_id }),
      }).then(res => res.json()).then(res => {
        if (res.result) {
          if (res.result.user_code !== localStorage.getItem("ww_code")) {
            setTimeout(logout, 10000);
            showToast(Locale.Home.Offline, undefined, 10000);
          } else {
            setStatInfo(res.result)
          }
        } else {
          console.log(Locale.Home.GetOnlineUserSummaryFail);
        }
      }).catch(err => {
        console.error(err);
        if (evt) {
          showToast(Locale.Home.GetOnlineUserSummaryFail, undefined, 2000);
        }
      });
    }
  }

  const loadStatList = (evt : any) => {
    const recent_minutes = getStatTime(evt);
        
    fetch(Wecom.OnlineUserListApi, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recent_minutes }),
    }).then(res => res.json()).then(res => {
      if (res.result) {
        setStatList(res.result)
      } else {
        showToast(Locale.Home.GetOnlineStatListFail, undefined, 2000);
      }
    }).catch(err => {
      console.error(err);
      showToast(Locale.Home.GetOnlineStatListFail, undefined, 2000);
    });
  }

  const showStatList = () => {    
    if (!!getCurrentUser().userId) {
      setIsShowStatList(true);
      loadStatList(statTime);
    } else {
      showToast(Locale.Home.NoLogin, undefined, 2000);
    }
  }
  
  useEffect(() => {
    loadStatSummary();
    userTimer.current = setInterval(loadStatSummary, 60 * 1000);
    return () => clearInterval(userTimer.current);
  }, []);

  useSwitchTheme();

  if (loading) {
    return <Loading />;
  }

  return (
    <div
      className={`${
        config.tightBorder && !isMobileScreen()
          ? styles["tight-container"]
          : styles.container
      }`}
    >
      <div
        className={styles.sidebar + ` ${showSideBar && styles["sidebar-show"]}`}
      >
        <div className={styles["sidebar-header"]}>
          <div className={styles["sidebar-title"]}>{Locale.Home.HomeTitle}</div>
          <div className={styles["sidebar-sub-title"]}>{Locale.Home.HomeDesc}</div>
          <div className={styles["sidebar-logo"]}>
            <ChatGptIcon />
          </div>
        </div>

        <div
          className={styles["sidebar-body"]}
          onClick={() => {
            setOpenSettings(false);
            setShowSideBar(false);
          }}
        >
          <ChatList />
        </div>

        <div className={styles["sidebar-tail"]}>
          <div className={styles["sidebar-actions"]}>
            <div className={styles["sidebar-action"] + " " + styles.mobile}>
              <IconButton
                icon={<CloseIcon />}
                onClick={chatStore.deleteSession}
              />
            </div>
            <div className={styles["sidebar-action"]}>
              <IconButton
                icon={<SettingsIcon />}
                onClick={() => {
                  setOpenSettings(true);
                  setShowSideBar(false);
                }}
                shadow
              />
            </div>
            <div className={styles["sidebar-action"]}>
              <IconButton
                icon={<UserIcon />}
                text={getCurrentUser().userName}
              />
            </div>
            {!!getCurrentUser().userId && (
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
              text={Locale.Home.NewChat}
              onClick={() => {
                createNewSession();
                setShowSideBar(false);
              }}
              shadow
            />
          </div>
        </div>
        
        <div className={styles["sidebar-tail"]}>
          <div className={styles["sidebar-actions"]}>
            <span className={styles["sidebar-stat"]}>{Locale.Home.StatFilterLabel}</span>
            <TimeDurationSelect statTime={statTime} onChange={loadStatSummary} onClick={() => setIsShowStatList(false)} />
            <a className={styles["sidebar-stat"]} onClick={showStatList}>
            {Locale.Home.OnlineCount(statInfo.online_users_count)}
            </a>
            <a className={styles["sidebar-stat"]} onClick={showStatList}>
            {Locale.Home.MsgCount(statInfo.total_request_count)}
            </a>
          </div>
        </div>
        
        { isShowStatList ? (
        <div className={styles["stat-list"]}>
          <div className={styles["stat-list-title"]}>{Locale.Home.StatTitle}</div>
          <div className={styles["stat-list-filter"]}>
            <div>
              {Locale.Home.StatFilterLabel}
              <TimeDurationSelect statTime={statTime} onChange={loadStatList} />
            </div>
            <div>{Locale.Home.OnlineCount(statList.online_users_count)}</div>
            <div>{statList.total_request_count} {Locale.Home.StatMsgCountColName}</div>
          </div>
          <div className={styles["stat-list-data"]}>
            <table>
              <thead>
                <tr>
                  <th>{Locale.Home.No}</th>
                  <th>{Locale.Home.StatNameColName}</th>
                  <th>{Locale.Home.StatMsgCountColName}</th>
                </tr>
              </thead>
              <tbody>
                {statList.user_requests_detail.map((obj, index) => {
                  const [key, val] = Object.entries(obj)[0];
                  return (
                    <tr key={index}>
                      <td>{index+1}</td>
                      <td>{key}</td>
                      <td>{val as string}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td>{Locale.Home.StatTotalColName}</td>
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
        ) : (<></>)}

        <div
          className={styles["sidebar-drag"]}
          onMouseDown={(e) => onDragMouseDown(e as any)}
        ></div>
      </div>

      <div className={styles["window-content"]}>
        {openSettings ? (
          <Settings
            closeSettings={() => {
              setOpenSettings(false);
              setShowSideBar(true);
            }}
          />
        ) : (
          <Chat
            key="chat"
            showSideBar={() => setShowSideBar(true)}
            onLogin={setUserInfo}
            sideBarShowing={showSideBar}
          />
        )}
      </div>
    </div>
  );
}

export function Home() {
  return (
    <ErrorBoundary>
      <_Home></_Home>
    </ErrorBoundary>
  );
}
