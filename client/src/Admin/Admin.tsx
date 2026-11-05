import { useCallback, useEffect, useState, type SubmitEvent } from "react";
import toast from "react-hot-toast";
import type { Reward } from "../types";

const API_URL = import.meta.env.DEV ? "http://localhost:3000/api/admin" : "/api/admin";
const EMPTY_REWARD: Reward = { code: "", title: "", image_url: "" };

const isReward = (value: unknown): value is Reward =>
	typeof value === "object" &&
	value !== null &&
	"code" in value &&
	typeof value.code === "string" &&
	"title" in value &&
	typeof value.title === "string" &&
	"image_url" in value &&
	typeof value.image_url === "string";

const readRewardsResponse = async (response: Response): Promise<Reward[]> => {
	const data: unknown = await response.json();
	if (!response.ok) {
		const message = typeof data === "object" && data !== null && "error" in data && typeof data.error === "string" ? data.error : `Request failed (${response.status})`;
		throw new Error(message);
	}
	if (!Array.isArray(data) || !data.every(isReward)) {
		throw new Error("The server returned an invalid rewards list");
	}
	return data;
};

function Admin() {
	const [rewards, setRewards] = useState<Reward[]>([]);
	const [draft, setDraft] = useState<Reward>(EMPTY_REWARD);
	const [editingCode, setEditingCode] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	const fetchRewards = useCallback(async () => {
		try {
			const response = await fetch(`${API_URL}/rewards`);
			const rewards = await readRewardsResponse(response);
			console.log(rewards);
			setRewards(rewards);
		} catch (error) {
			console.error("Error fetching rewards:", error);
			toast.error(error instanceof Error ? error.message : "Failed to fetch rewards");
		} finally {
			setLoading(false);
		}
	}, []);

	const addReward = async (reward: Reward) => {
		setSaving(true);
		try {
			const response = await fetch(`${API_URL}/rewards`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(reward),
			});
			setRewards(await readRewardsResponse(response));
			setDraft(EMPTY_REWARD);
			toast.success("Reward added");
		} catch (error) {
			console.error("Error adding reward:", error);
			toast.error(error instanceof Error ? error.message : "Failed to add reward");
		} finally {
			setSaving(false);
		}
	};

	const editReward = async (code: string, reward: Reward) => {
		setSaving(true);
		try {
			const response = await fetch(`${API_URL}/rewards/${encodeURIComponent(code)}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(reward),
			});
			setRewards(await readRewardsResponse(response));
			setDraft(EMPTY_REWARD);
			setEditingCode(null);
			toast.success("Reward updated");
		} catch (error) {
			console.error("Error editing reward:", error);
			toast.error(error instanceof Error ? error.message : "Failed to edit reward");
		} finally {
			setSaving(false);
		}
	};

	const deleteReward = async (code: string) => {
		setSaving(true);
		try {
			const response = await fetch(`${API_URL}/rewards/${encodeURIComponent(code)}`, { method: "DELETE" });
			setRewards(await readRewardsResponse(response));
			if (editingCode === code) {
				setDraft(EMPTY_REWARD);
				setEditingCode(null);
			}
			toast.success("Reward deleted");
		} catch (error) {
			console.error("Error deleting reward:", error);
			toast.error(error instanceof Error ? error.message : "Failed to delete reward");
		} finally {
			setSaving(false);
		}
	};

	const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (editingCode) {
			void editReward(editingCode, draft);
		} else {
			void addReward(draft);
		}
	};

	const startEditing = (reward: Reward) => {
		setDraft({ ...reward });
		setEditingCode(reward.code);
	};

	const cancelEditing = () => {
		setDraft(EMPTY_REWARD);
		setEditingCode(null);
	};

	const convertGoogleDriveImageUrl = (url: string, size = "w1000") => {
		if (!url || typeof url !== "string") return url;
		const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
		if (!match) return url;
		const fileId = match[1];
		return `https://drive.google.com/thumbnail?id=${fileId}&sz=${size}`;
	};

	useEffect(() => {
		void fetchRewards();
	}, [fetchRewards]);

	return (
		<main className="w-full px-4 py-8 text-slate-900 sm:px-8">
			<h1 className="mb-6 text-3xl font-bold text-gray-900">Reward administration</h1>

			<form onSubmit={handleSubmit} className="mb-10 grid gap-4 rounded-xl bg-white p-6 shadow sm:grid-cols-2">
				<h2 className="sm:col-span-2">{editingCode ? `Edit reward ${editingCode}` : "Add a reward"}</h2>
				<label className="grid gap-1">
					Code
					<input required value={draft.code} onChange={(event) => setDraft({ ...draft, code: event.target.value })} className="rounded border border-slate-300 px-3 py-2" />
				</label>
				<label className="grid gap-1">
					Title
					<input required value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} className="rounded border border-slate-300 px-3 py-2" />
				</label>
				<label className="grid gap-1 sm:col-span-2">
					Image URL
					<input
						required
						type="url"
						value={draft.image_url}
						onChange={(event) => setDraft({ ...draft, image_url: event.target.value })}
						className="rounded border border-slate-300 px-3 py-2"
					/>
				</label>
				<div className="flex gap-3 sm:col-span-2">
					<button type="submit" disabled={saving} className="rounded bg-violet-600 px-4 py-2 font-semibold text-white disabled:opacity-50 cursor-pointer">
						{saving ?
							"Saving..."
						: editingCode ?
							"Save changes"
						:	"Add reward"}
					</button>
					{editingCode && (
						<button type="button" onClick={cancelEditing} className="rounded border border-slate-300 px-4 py-2 cursor-pointer">
							Cancel
						</button>
					)}
				</div>
			</form>

			<section>
				<h2 className="mb-4 text-2xl font-semibold">Rewards</h2>
				{loading ?
					<p>Loading rewards...</p>
				: rewards.length === 0 ?
					<p>No rewards found.</p>
				:	<div className="overflow-x-auto rounded-xl bg-white shadow">
						<table className="w-full text-left">
							<thead className="border-b border-slate-200">
								<tr>
									<th className="px-4 py-3">Code</th>
									<th className="px-4 py-3">Title</th>
									<th className="px-4 py-3">Image</th>
									<th className="px-4 py-3">Actions</th>
								</tr>
							</thead>
							<tbody>
								{rewards.map((reward) => (
									<tr key={reward.code} className="border-b border-slate-100 last:border-0">
										<td className="px-4 py-3">{reward.code}</td>
										<td className="px-4 py-3">{reward.title}</td>
										<td className="px-4 py-3">
											<img src={convertGoogleDriveImageUrl(reward.image_url)} alt={reward.title} className="h-12 w-12 rounded object-cover" />
										</td>
										<td className="px-4 py-3">
											<div className="flex gap-2">
												<button
													type="button"
													disabled={saving}
													onClick={() => startEditing(reward)}
													className="rounded border border-slate-300 px-3 py-1 disabled:opacity-50 cursor-pointer">
													Edit
												</button>
												<button
													type="button"
													disabled={saving}
													onClick={() => void deleteReward(reward.code)}
													className="rounded bg-rose-600 px-3 py-1 text-white disabled:opacity-50 cursor-pointer">
													Delete
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				}
			</section>
		</main>
	);
}

export default Admin;
