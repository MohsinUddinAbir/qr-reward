import { useEffect, useState } from "react";
import Papa from "papaparse";
import HomePage from "./Pages/HomePage";
import ResultPage from "./Pages/ResultPage";
import toast from "react-hot-toast";

function App() {
	const [homeScene, setHomeScene] = useState(true);
	const [records, setRecords] = useState<any[]>([]);

	const fetchCSV = async () => {
		try {
			const response = await fetch("/public/barcode.csv");
			const reader = response.body?.getReader();
			if (!reader) return;

			const result = await reader.read();

			// Decode stream into text string
			const decoder = new TextDecoder("utf-8");
			const csvText = decoder.decode(result.value);

			// Parse CSV string into JSON objects
			Papa.parse(csvText, {
				header: true,
				skipEmptyLines: true,
				complete: (result) => {
					setRecords(result.data);
				},
			});
		} catch (error) {
			console.error("Error fetching local CSV:", error);
		}
	};

	useEffect(() => {
		fetchCSV();
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
