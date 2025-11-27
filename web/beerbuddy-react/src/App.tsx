import { BrowserRouter } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { AppRoutes } from "./router";

/**
 * Root application component with routing + shared layout.
 */
export default function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <AppRoutes />
      </AppLayout>
    </BrowserRouter>
  );
}
