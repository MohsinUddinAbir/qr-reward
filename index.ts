import express from "express";
import cors from "cors";
import path from "path";
import basicAuth from "express-basic-auth";
import { addReward, deleteReward, editReward, getReward, getRewards } from "./csvHelper.ts";

const app = express();
const port = process.env.PORT || 3000;
const username = process.env.BASE_AUTH_USERNAME || "admin";
const password = process.env.BASE_AUTH_PASSWORD || "admin";

const allowedOrigins = ["http://localhost:3000", "http://localhost:5173"];
app.use(
	cors({
		credentials: true,
		origin: allowedOrigins,
	}),
);
app.enable("trust proxy");
app.use(express.json());
app.use(express.static(path.join(process.cwd(), "public"), { index: "_" }));

const basicAuthMiddleware = basicAuth({
	realm: "Restricted Area",
	users: {
		[username]: password,
	},
	challenge: true,
});

const admin = express.Router();

admin.get("/", (req, res) => {
	res.sendFile(path.join(process.cwd(), "public", "admin.html"));
});

admin.get("/api/rewards", async (req, res) => {
	try {
		const rewards = await getRewards();
		res.json(rewards);
	} catch (err: any) {
		console.error(err);
		res.status(500).json({ error: err.message || "Failed to fetch rewards" });
	}
});

admin.post("/api/rewards", async (req, res) => {
	try {
		await addReward(req.body);
		const rewards = await getRewards();
		res.json(rewards);
	} catch (err: any) {
		console.error(err);
		res.status(500).json({ error: err.message || "Failed to add reward" });
	}
});

admin.put("/api/rewards/:id", async (req, res) => {
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

admin.delete("/api/rewards/:id", async (req, res) => {
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

app.use("/admin", admin); ///  basicAuthMiddleware,

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

app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});
