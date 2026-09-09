import { useEffect, useState } from "react";
import { useBarcodeScanner } from "react-simple-usb-scanner";

type ResultData = {
	BARCODE: string;
	ITEM: string;
	"PICTURE LINK": string;
};

const ResultPage = ({ records, onBackClick }: { records: ResultData[]; onBackClick: () => void }) => {
	const [scanned, setScanned] = useState(false);
	const [loading] = useState(false);
	const [record, setRecord] = useState<ResultData | null>(null);
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
			getRecord(code);
			setScanned(true);
		},
		enabled: true, // Listens globally while true
	});

	const getRecord = async (code: string) => {
		const record = records.find((r) => r["BARCODE"] == code);
		if (!record) {
			setError("No result found!");
			return;
		}

		setRecord(record);
		setGoBackTimer();
	};

	const setGoBackTimer = (seconds = 20) => {
		setTimeout(() => {
			resetBarcode();
			onBackClick();
		}, seconds * 1000);
	};

	return (
		<div className="w-full">
			<div className="w-full">
				<button className="cursor-pointer mt-4 ml-6 text-lg text-pink-500" onClick={onBackClick}>
					Back
				</button>
			</div>
			{!scanned ?
				<div className="text-3xl py-6 text-center font-bold text-pink-500">Scan your Card</div>
			:	null}
			{loading ?
				<div className="text-center text-3xl py-6 text-gray-700">Loading...</div>
			:	null}
			{record ?
				<div className="text-center py-6">
					<div className="text-3xl mb-6">Reward</div>
					<div className="text-3xl mb-6 text-gray-700">{record["BARCODE"]}</div>
					<div className="text-6xl mb-10 font-bold text-pink-500">{record["ITEM"]}</div>
					<div className="w-full flex items-center justify-center">
						<img className="w-full max-w-[600px]" src={record["PICTURE LINK"]} alt="Reward Image" />
					</div>
				</div>
			:	null}
			{error ?
				<div className="text-center text-3xl py-6 text-gray-700">{error}</div>
			:	null}
		</div>
	);
};

export default ResultPage;
