import { createRoot } from "react-dom/client";
import "@fontsource/fraunces/300.css";
import "@fontsource/fraunces/400.css";
import App from "./App.tsx";
import "./index.css";
import { registerServiceWorker } from "./lib/registerSW.ts";

createRoot(document.getElementById("root")!).render(<App />);
registerServiceWorker();
