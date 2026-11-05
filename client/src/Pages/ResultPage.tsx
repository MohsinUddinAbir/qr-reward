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

	const convertGoogleDriveImageUrl = (url: string, size = "w1000") => {
		if (!url || typeof url !== "string") return url;
		const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
		if (!match) return url;
		const fileId = match[1];
		return `https://drive.google.com/thumbnail?id=${fileId}&sz=${size}`;
	};

	return (
		<div className="w-full">
			{!loading && !error && !record ?
				<div className="w-full">
					<button
						// onClick={() => getRecord("1001")}
						className="w-full flex items-center justify-center">
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
						<img
							src={convertGoogleDriveImageUrl(record["image_url"])}
							alt={record["title"]}
							onError={(e) => {
								const img = e.currentTarget;
								console.error("Image failed to load:", img.src);
							}}
							className="w-full max-w-[600px]"
						/>
					</div>
				</div>
			:	null}
		</div>
	);
};

export default ResultPage;
