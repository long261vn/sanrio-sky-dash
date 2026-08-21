/** Mây Bông & Kẹo Ngọt: một canvas game toàn màn hình, không có chrome trang web dư thừa. */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import GameCanvas from "./components/GameCanvas";

function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster /><GameCanvas /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}

export default App;
