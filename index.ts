import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { addReward, deleteReward, editReward, getReward, getRewards } from "./helper.js";
import { connectMongoDB } from "./db.js";

const app = express();
const port = process.env.PORT || 3000;
const password = process.env.BASE_AUTH_PASSWORD || "secret";

app.enable("trust proxy");

const allowedOrigins = ["http://localhost:3000", "http://localhost:5173", "https://qr-reward-three.vercel.app"];
app.use(
	cors({
		credentials: true,
		origin: allowedOrigins,
	}),
);
app.use(express.json());
app.use(express.static(path.join(process.cwd(), "public"), { index: "_" }));

app.get(`/admin-${password}`, (req, res) => {
	res.sendFile(path.join(process.cwd(), "public", "admin.html"));
});

app.get("/api/admin/rewards", async (req, res) => {
	try {
		const rewards = await getRewards();
		res.json(rewards);
	} catch (err: any) {
		console.error(err);
		res.status(500).json({ error: err.message || "Failed to fetch rewards" });
	}
});

app.post("/api/admin/rewards", async (req, res) => {
	try {
		await addReward(req.body);
		const rewards = await getRewards();
		res.json(rewards);
	} catch (err: any) {
		console.error(err);
		res.status(500).json({ error: err.message || "Failed to add reward" });
	}
});

app.put("/api/admin/rewards/:id", async (req, res) => {
	try {
		const id = String(req.params.id);
		await editReward(id, req.body);
		const rewards = await getRewards();
		res.json(rewards);
	} catch (err: any) {
		console.error(err);
		res.status(500).json({ error: err.message || "Failed to edit reward" });
	}
});

app.delete("/api/admin/rewards/:id", async (req, res) => {
	try {
		const id = String(req.params.id);
		await deleteReward(id);
		const rewards = await getRewards();
		res.json(rewards);
	} catch (err: any) {
		console.error(err);
		res.status(500).json({ error: err.message || "Failed to delete reward" });
	}
});

app.get("/api/rewards", async (req, res) => {
	try {
		const rewards = await getRewards();
		res.json(rewards);
	} catch (err: any) {
		console.error(err);
		res.status(500).json({ error: err.message || "Failed to fetch rewards" });
	}
});

app.get("/api/rewards/:id", async (req, res) => {
	try {
		const id = String(req.params.id);
		const reward = await getReward(id);
		if (!reward) {
			return res.status(404).json({ error: "Reward not found" });
		}
		res.json(reward);
	} catch (err: any) {
		console.error(err);
		res.status(500).json({ error: err.message || "Failed to fetch reward" });
	}
});

app.get("/", (req, res) => {
	res.sendFile(path.join(process.cwd(), "public", "index.html"));
});

connectMongoDB().catch((error: unknown) => {
	console.error("Failed to start server:", error);
	process.exitCode = 1;
});

app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});
