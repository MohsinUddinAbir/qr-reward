import { useEffect, useState } from "react";
import HomePage from "./Pages/HomePage";
import ResultPage from "./Pages/ResultPage";
import toast from "react-hot-toast";
import type { Reward } from "./types";

const API_URL = import.meta.env.DEV ? "http://localhost:3000/api" : "https://qr-reward-three.vercel.app/api";

function App() {
	const [homeScene, setHomeScene] = useState(true);
	const [records, setRecords] = useState<Reward[]>([]);

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
	// 				setRecords(result.data as Reward[]);
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
			setRecords(rewards);
		} catch (error) {
			console.error("Error fetching local CSV:", error);
		}
	};

	useEffect(() => {
		fetchRewards();
	}, []);

	return (
		<>
			{homeScene ?
				<HomePage
					onHomeClick={() => {
						if (records.length == 0) {
							toast.error("Records not loaded yet!");
							return;
						}
						setHomeScene(false);
					}}
				/>
			:	<ResultPage records={records} onBackClick={() => setHomeScene(true)} />}
		</>
	);
}

export default App;
