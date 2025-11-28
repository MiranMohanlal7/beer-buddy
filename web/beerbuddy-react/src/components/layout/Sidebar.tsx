import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import BrewBuddyLogoText2 from "../../assets/Brew_Buddy_Logo_Text 2.png";
import { useApi } from "../../api/ApiProvider";
import type { UiIconName } from "../ui/Icon";
import { UiIcon } from "../ui/Icon";
import type { LeaderboardEntry } from "../../domain/types";
import { useActiveProfile, useResolvedProfileName } from "../../state/ActiveProfileContext";

const navItems: { label: string; to: string; icon: UiIconName }[] = [
  { label: "Home", to: "/", icon: "home" },
  { label: "Stock", to: "/stock", icon: "stock" },
  { label: "History", to: "/history", icon: "history" },
  { label: "Finance", to: "/finance", icon: "costs" },
  { label: "Leaderboard", to: "/leaderboard", icon: "leaderboard" },
  { label: "Settings", to: "/settings", icon: "settings" },
];
const supportNavItem: { label: string; to: string; icon: UiIconName } = {
  label: "Support",
  to: "/support",
  icon: "support",
};

/**
 * Left-hand navigation rendered across every page.
 */
export function Sidebar() {
  const mainNavItems = navItems;
  const api = useApi();
  const { activeProfile, selectProfile, clearProfile } = useActiveProfile();
  const profileName = useResolvedProfileName("Fridge buddy");
  const [profileOptions, setProfileOptions] = useState<LeaderboardEntry[]>([]);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const selectorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (activeProfile) {
      return;
    }
    const controller = new AbortController();
    api
      .getDashboardSummary(controller.signal)
      .then((summary) => {
        if (controller.signal.aborted || !summary.currentUserName) {
          return;
        }
        selectProfile({ username: summary.currentUserName }, "api");
      })
      .catch(() => {
        /* ignored */
      });
    return () => controller.abort();
  }, [api, activeProfile, selectProfile]);

  useEffect(() => {
    const controller = new AbortController();
    api
      .getLeaderboard({ signal: controller.signal })
      .then((entries) => {
        if (controller.signal.aborted) {
          return;
        }
        setProfileOptions(entries);
      })
      .catch(() => {
        if (controller.signal.aborted) {
          return;
        }
        setProfileOptions([]);
      });

    return () => controller.abort();
  }, [api]);

  useEffect(() => {
    if (!isSelectorOpen) {
      return;
    }
    const handleClickOutside = (event: MouseEvent) => {
      if (!selectorRef.current) {
        return;
      }
      if (!selectorRef.current.contains(event.target as Node)) {
        setIsSelectorOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSelectorOpen]);

  const normalizedOptions = useMemo(() => {
    const map = new Map<string, { userId: number | null; username: string }>();
    profileOptions.forEach((entry) => {
      const userId = Number.isFinite(entry.userId) ? entry.userId : null;
      const username = entry.username?.trim();
      if (!username) {
        return;
      }
      const key = userId !== null ? `id-${userId}` : `name-${username.toLowerCase()}`;
      if (!map.has(key)) {
        map.set(key, { userId, username });
      }
    });
    return Array.from(map.values());
  }, [profileOptions]);

  const profileLabel = activeProfile?.source === "manual" ? "Testing as" : "Signed in";

  return (
    <aside className="sidebar">
      <div className="sidebar__header">
        <div className="sidebar__brand">
          <img
            src={BrewBuddyLogoText2}
            alt="Brew Buddy"
            className="sidebar__brand-image"
          />
        </div>
        <div className="sidebar__profile">
          <div className="sidebar__profile-wrapper" ref={selectorRef}>
            <button
              type="button"
              className={`sidebar__profile-button ${isSelectorOpen ? "sidebar__profile-button--open" : ""}`}
              onClick={() => setIsSelectorOpen((prev) => !prev)}
              aria-haspopup="true"
              aria-expanded={isSelectorOpen}
            >
              <span className="sidebar__avatar" aria-hidden="true">
                <UiIcon name="housemates" variant="active" size={20} />
              </span>
              <div className="sidebar__profile-info">
                <p className="sidebar__profile-label">{profileLabel}</p>
                <p className="sidebar__user-name">{profileName}</p>
              </div>
              <span className="sidebar__profile-caret" aria-hidden="true">
                v
              </span>
            </button>

            {isSelectorOpen ? (
              <div className="sidebar__profile-menu">
                <p className="sidebar__profile-menu-title">Switch profile</p>
                <ul className="sidebar__profile-menu-list">
                  {normalizedOptions.length === 0 ? (
                    <li>
                      <span className="sidebar__profile-option sidebar__profile-option--empty">
                        No leaderboard data yet.
                      </span>
                    </li>
                  ) : (
                    normalizedOptions.map((option) => {
                      const isActive =
                        (!!activeProfile && activeProfile.userId !== null && option.userId !== null
                          ? activeProfile.userId === option.userId
                          : activeProfile?.username === option.username) &&
                        activeProfile?.source === "manual";
                      return (
                        <li key={`${option.userId ?? "name"}-${option.username}`}>
                          <button
                            type="button"
                            className={`sidebar__profile-option ${
                              isActive ? "sidebar__profile-option--active" : ""
                            }`}
                            onClick={() => {
                              selectProfile(
                                { username: option.username, userId: option.userId },
                                "manual",
                              );
                              setIsSelectorOpen(false);
                            }}
                          >
                            {option.username}
                          </button>
                        </li>
                      );
                    })
                  )}
                </ul>
                <button
                  type="button"
                  className="sidebar__profile-reset"
                  onClick={() => {
                    clearProfile();
                    setIsSelectorOpen(false);
                  }}
                  disabled={!activeProfile || activeProfile.source !== "manual"}
                >
                  Use live fridge profile
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <nav className="sidebar__nav-wrapper">
        <ul className="sidebar__nav">
          {mainNavItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
                }
                end={item.to === "/"}
              >
                {({ isActive }) => (
                  <span className="sidebar__link-content">
                    <span
                      className={`sidebar__link-icon ${
                        isActive ? "sidebar__link-icon--active" : ""
                      }`}
                    >
                      <UiIcon name={item.icon} variant="active" size={18} />
                    </span>
                    <span className="sidebar__link-label">{item.label}</span>
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar__spacer" aria-hidden="true" />

      <div className="sidebar__support">
        <NavLink
          to={supportNavItem.to}
          className={({ isActive }) =>
            `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
          }
        >
          {({ isActive }) => (
            <span className="sidebar__link-content">
              <span
                className={`sidebar__link-icon ${
                  isActive ? "sidebar__link-icon--active" : ""
                }`}
              >
                <UiIcon name={supportNavItem.icon} variant="active" size={18} />
              </span>
              <span className="sidebar__link-label">{supportNavItem.label}</span>
            </span>
          )}
        </NavLink>
      </div>
    </aside>
  );
}
