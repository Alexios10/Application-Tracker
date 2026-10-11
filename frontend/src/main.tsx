import { createRoot } from "react-dom/client";
import App from "./App.tsx";
// Font is bundled with the app instead of loaded from Google Fonts
import "@fontsource-variable/schibsted-grotesk";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
