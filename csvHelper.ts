import fs from "node:fs/promises";
import path from "node:path";
import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";

const FILE_PATH = path.join(process.cwd(), "public", "rewards.csv");
const COLUMNS = ["code", "title", "image_url"] as const;

type Reward = { code: string; title: string; image_url: string };

// Serialize all read-modify-write operations to avoid race conditions
let queue: Promise<unknown> = Promise.resolve();
const enqueue = <T>(task: () => Promise<T>): Promise<T> => {
	const result = queue.then(task);
	queue = result.catch(() => {}); // keep the queue alive after a failure
	return result;
};

const normalizeCode = (code: string): string => code.trim().toUpperCase();

const readAll = async (): Promise<Reward[]> => {
	try {
		const text = await fs.readFile(FILE_PATH, "utf8");
		return parse(text, {
			columns: true,
			bom: true,
			skip_empty_lines: true,
			trim: true,
			cast: false, // keep codes like "00123" as strings
		}) as Reward[];
	} catch (err) {
		if ((err as NodeJS.ErrnoException).code === "ENOENT") return []; // no file yet
		throw err;
	}
};

const writeAll = async (rewards: Reward[]): Promise<void> => {
	const csv = stringify(rewards, { header: true, columns: [...COLUMNS] });
	const tmp = `${FILE_PATH}.${process.pid}.tmp`;
	await fs.writeFile(tmp, csv, "utf8");
	await fs.rename(tmp, FILE_PATH); // atomic replace: no half-written file on crash
};

const validate = (reward: Reward): void => {
	for (const key of COLUMNS) {
		if (typeof reward[key] !== "string" || !reward[key].trim()) {
			throw new Error(`Reward "${key}" is required`);
		}
	}
};

const getRewards = async (): Promise<Reward[]> => {
	return readAll();
};

const addReward = (reward: Reward): Promise<Reward> =>
	enqueue(async () => {
		validate(reward);
		const code = normalizeCode(reward.code);
		const rewards = await readAll();

		if (rewards.some((r) => normalizeCode(r.code) === code)) {
			throw new Error(`Reward with code "${code}" already exists`);
		}

		const created: Reward = {
			code,
			title: reward.title.trim(),
			image_url: reward.image_url.trim(),
		};
		rewards.push(created);
		await writeAll(rewards);
		return created;
	});

const editReward = (code: string, reward: Reward): Promise<Reward> =>
	enqueue(async () => {
		validate(reward);
		const current = normalizeCode(code);
		const nextCode = normalizeCode(reward.code);
		const rewards = await readAll();

		const index = rewards.findIndex((r) => normalizeCode(r.code) === current);
		if (index === -1) throw new Error(`Reward "${current}" not found`);

		// If the code is being changed, make sure it doesn't collide with another reward
		if (nextCode !== current && rewards.some((r) => normalizeCode(r.code) === nextCode)) {
			throw new Error(`Reward with code "${nextCode}" already exists`);
		}

		const updated: Reward = {
			code: nextCode,
			title: reward.title.trim(),
			image_url: reward.image_url.trim(),
		};
		rewards[index] = updated;
		await writeAll(rewards);
		return updated;
	});

const getReward = async (code: string): Promise<Reward | null> => {
	const target = normalizeCode(code);
	const rewards = await readAll();
	return rewards.find((r) => normalizeCode(r.code) === target) ?? null;
};

const deleteReward = (code: string): Promise<Reward> =>
	enqueue(async () => {
		const target = normalizeCode(code);
		const rewards = await readAll();

		const index = rewards.findIndex((r) => normalizeCode(r.code) === target);
		if (index === -1) throw new Error(`Reward "${target}" not found`);

		const [deleted] = rewards.splice(index, 1);
		await writeAll(rewards);
		return deleted;
	});

export { getRewards, addReward, editReward, getReward, deleteReward };
