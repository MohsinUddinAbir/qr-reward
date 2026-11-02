import toast from "react-hot-toast";
import ResultPage from "./Pages/ResultPage";
import type { Reward } from "./types";
import { useEffect, useState } from "react";

const API_URL = import.meta.env.DEV ? "http://localhost:3000/api" : "/api";

function App() {
	const [rewards, setRewards] = useState<Reward[]>([]);

	// const fetchCSV = async () => {
	// 	try {
	// 		const response = await fetch("/rewards.csv");
	// 		const reader = response.body?.getReader();
	// 		if (!reader) return;

	// 		const result = await reader.read();

	// 		// Decode stream into text string
	// 		const decoder = new TextDecoder("utf-8");
	// 		const csvText = decoder.decode(result.value);

	// 		// Parse CSV string into JSON objects
	// 		Papa.parse(csvText, {
	// 			header: true,
	// 			skipEmptyLines: true,
	// 			complete: (result) => {
	// 				setRewards(result.data as Reward[]);
	// 			},
	// 		});
	// 	} catch (error) {
	// 		console.error("Error fetching local CSV:", error);
	// 	}
	// };

	const fetchRewards = async () => {
		try {
			const response = await fetch(`${API_URL}/rewards`);
			const rewards = await response.json();
			console.log(rewards);
			setRewards(rewards);
		} catch (error) {
			console.error("Error fetching local CSV:", error);
			toast.error(error instanceof Error ? error.message : "Failed to fetch rewards");
		}
	};

	useEffect(() => {
		fetchRewards();
	}, []);

	return <ResultPage rewards={rewards} />;
}

export default App;
