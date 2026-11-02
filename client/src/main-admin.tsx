import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Admin from "./Admin/Admin.tsx";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<Toaster position="top-right" />
		<Admin />
	</StrictMode>,
);
