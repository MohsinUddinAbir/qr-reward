import { Scanner, useDevices, type IDetectedBarcode } from "@yudiel/react-qr-scanner";
import { useState } from "react";

function QRCodeScanner({ onResult }: { onResult: (result: IDetectedBarcode[]) => void }) {
	const devices = useDevices();
	const [selectedDevice, setSelectedDevice] = useState<any>(null);

	return (
		<div className="text-center mt-5">
			<div className="text-3xl mb-6 text-center font-bold text-pink-500">Scan your Card</div>
			<select className="mb-4 text-orange-500 focus:outline-0 px-2 py-1 rounded-lg border border-orange-500" onChange={(e) => setSelectedDevice(e.target.value)}>
				<option value="">Select a camera</option>
				{devices.map((device) => (
					<option key={device.deviceId} value={device.deviceId}>
						{device.label || `Camera ${device.deviceId}`}
					</option>
				))}
			</select>

			<Scanner
				onScan={onResult}
				constraints={{
					deviceId: selectedDevice,
				}}
			/>
		</div>
	);
}

export default QRCodeScanner;
