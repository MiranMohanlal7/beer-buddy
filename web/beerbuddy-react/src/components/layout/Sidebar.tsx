import { NavLink } from "react-router-dom";
import BrewBuddyLogoText2 from "../../assets/Brew_Buddy_Logo_Text 2.png";
import type { UiIconName } from "../ui/Icon";
import { UiIcon } from "../ui/Icon";

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
  const currentUserName = "User X"; // TODO: replace with api.getCurrentUser() response.

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
          <span className="sidebar__avatar" aria-hidden="true">
            <UiIcon name="housemates" variant="active" size={20} />
          </span>
          <div>
            <p className="sidebar__profile-label">Signed in</p>
            <p className="sidebar__user-name">{currentUserName}</p>
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
