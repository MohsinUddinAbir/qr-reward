import { useState } from "react";
import { useBarcodeScanner } from "react-simple-usb-scanner";
import type { Reward } from "../types";
import homeImg from "../assets/home.png";

const ResultPage = ({ rewards }: { rewards: Reward[] }) => {
	const [loading, setLoading] = useState(false);
	const [record, setRecord] = useState<Reward | null>(null);
	const [error, setError] = useState<string | null>(null);

	// const handleScanResult = (result: IDetectedBarcode[]) => {
	// 	if (result.length > 0) {
	// 		const code = result[0].rawValue;
	// 		console.log(code);
	// 		setScanned(true);
	// 		getRecord(code);
	// 	}
	// };

	const { resetBarcode } = useBarcodeScanner({
		onBarcodeScanned: async (code) => {
			console.log("Barcode detected via USB:", code);
			setLoading(true);
			getRecord(code);
		},
		enabled: true,
	});

	const getRecord = async (code: string) => {
		const nCode = code.trim().toUpperCase();
		const record = rewards.find((r) => r["code"] === nCode);
		if (!record) {
			setGoBackTimer(3);
			setError("No result found!");
			setLoading(false);
			return;
		}
		setGoBackTimer();
		setRecord(record);
		setLoading(false);
	};

	const setGoBackTimer = (seconds = 10) => {
		setTimeout(() => {
			resetBarcode();
			setError(null);
			setRecord(null);
		}, seconds * 1000);
	};

	return (
		<div className="w-full">
			{!loading && !error && !record ?
				<div className="w-full">
					<button>
						<img src={homeImg} alt="" />
					</button>
				</div>
			:	null}

			{loading ?
				<div className="text-center text-3xl py-6 text-gray-700">Loading...</div>
			:	null}

			{error ?
				<div className="text-center text-3xl py-6 text-gray-700">{error}</div>
			:	null}

			{record ?
				<div className="text-center py-6">
					<div className="text-3xl mb-6">Reward</div>
					<div className="text-3xl mb-6 text-gray-700">{record["code"]}</div>
					<div className="text-6xl mb-10 font-bold text-pink-500">{record["title"]}</div>
					<div className="w-full flex items-center justify-center">
						<img className="w-full max-w-[600px]" src={record["image_url"]} alt="Reward Image" />
					</div>
				</div>
			:	null}
		</div>
	);
};

export default ResultPage;
