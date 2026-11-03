import mongoose from "mongoose";

type Reward = { code: string; title: string; image_url: string };

const rewardSchema = new mongoose.Schema<Reward>(
	{
		code: { type: String, required: true, unique: true, trim: true, uppercase: true },
		title: { type: String, required: true, trim: true },
		image_url: { type: String, required: true, trim: true },
	},
	{ versionKey: false },
);

const existingRewardModel = mongoose.models.Reward as mongoose.Model<Reward> | undefined;
const RewardModel = existingRewardModel ?? mongoose.model<Reward>("Reward", rewardSchema);

const normalizeCode = (code: string): string => code.trim().toUpperCase();

const validate = (reward: Reward): void => {
	for (const key of ["code", "title", "image_url"] as const) {
		if (typeof reward?.[key] !== "string" || !reward[key].trim()) {
			throw new Error(`Reward "${key}" is required`);
		}
	}
};

const isDuplicateKeyError = (error: unknown): boolean => typeof error === "object" && error !== null && "code" in error && error.code === 11000;

const toReward = (reward: Reward): Reward => ({
	code: reward.code,
	title: reward.title,
	image_url: reward.image_url,
});

const getRewards = async (): Promise<Reward[]> => RewardModel.find().sort({ _id: 1 }).select({ _id: 0, code: 1, title: 1, image_url: 1 }).lean().exec();

const addReward = async (reward: Reward): Promise<Reward> => {
	validate(reward);
	const code = normalizeCode(reward.code);

	try {
		const created = await RewardModel.create({
			code,
			title: reward.title.trim(),
			image_url: reward.image_url.trim(),
		});
		return toReward(created);
	} catch (error) {
		if (isDuplicateKeyError(error)) {
			throw new Error(`Reward with code "${code}" already exists`);
		}
		throw error;
	}
};

const editReward = async (code: string, reward: Reward): Promise<Reward> => {
	validate(reward);
	const current = normalizeCode(code);
	const nextCode = normalizeCode(reward.code);
	const updated = {
		code: nextCode,
		title: reward.title.trim(),
		image_url: reward.image_url.trim(),
	};

	try {
		const result = await RewardModel.findOneAndUpdate({ code: current }, updated, { runValidators: true, returnDocument: "after" })
			.select({ _id: 0, code: 1, title: 1, image_url: 1 })
			.lean()
			.exec();

		if (!result) throw new Error(`Reward "${current}" not found`);
		return result;
	} catch (error) {
		if (isDuplicateKeyError(error)) {
			throw new Error(`Reward with code "${nextCode}" already exists`);
		}
		throw error;
	}
};

const getReward = async (code: string): Promise<Reward | null> =>
	RewardModel.findOne({ code: normalizeCode(code) })
		.select({ _id: 0, code: 1, title: 1, image_url: 1 })
		.lean()
		.exec();

const deleteReward = async (code: string): Promise<Reward> => {
	const target = normalizeCode(code);
	const deleted = await RewardModel.findOneAndDelete({ code: target }).select({ _id: 0, code: 1, title: 1, image_url: 1 }).lean().exec();

	if (!deleted) throw new Error(`Reward "${target}" not found`);
	return deleted;
};

export { getRewards, addReward, editReward, getReward, deleteReward };
