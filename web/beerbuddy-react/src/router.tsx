import { Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/Home/HomePage";
import { StockPage } from "./pages/Stock/StockPage";
import { HistoryPage } from "./pages/History/HistoryPage";
import { FinancePage } from "./pages/Finance/FinancePage";
import { LeaderboardPage } from "./pages/Leaderboard/LeaderboardPage";
import { SettingsPage } from "./pages/Settings/SettingsPage";
import { SupportPage } from "./pages/Support/SupportPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/stock" element={<StockPage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/finance" element={<FinancePage />} />
      <Route path="/leaderboard" element={<LeaderboardPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/support" element={<SupportPage />} />
    </Routes>
  );
}
