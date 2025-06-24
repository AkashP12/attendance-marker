"use client";

import { RefObject, useState, useCallback, useEffect, useRef } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";

export interface QRCodeScannerProps {
	scannerRef: RefObject<HTMLDivElement>;
	onScan: (data: string) => void;
	onError: (error: Error) => void;
}

export function useQRCodeScanner({ onScan, onError, scannerRef }: QRCodeScannerProps) {
	const [isCameraActive, setIsCameraActive] = useState(false);
	const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

	const stopScanning = useCallback(async () => {
		if (html5QrCodeRef.current) {
			try {
				if (html5QrCodeRef.current.getState() === Html5QrcodeScannerState.SCANNING) {
					await html5QrCodeRef.current.stop();
				}
				await html5QrCodeRef.current.clear();
			} catch (err) {
				console.error("Error stopping scanner:", err);
			} finally {
				html5QrCodeRef.current = null;
				setIsCameraActive(false);
			}
		}
	}, []);

	const getCameraId = useCallback(async () => {
		try {
			const devices = await Html5Qrcode.getCameras();
			return devices?.[0]?.id || null;
		} catch (err) {
			console.error("Error getting cameras:", err);
			return null;
		}
	}, []);

	const startScanning = useCallback(async () => {
		try {
			const containerElement = scannerRef.current;
			if (!containerElement) {
				throw new Error("Scanner container element not found.");
			}

			const scannerId = containerElement.id;
			if (!scannerId) {
				throw new Error("Scanner container must have a valid ID.");
			}

			const html5QrCode = new Html5Qrcode(scannerId);
			html5QrCodeRef.current = html5QrCode;

			const cameraId = await getCameraId();
			if (!cameraId) {
				throw new Error("No camera found.");
			}

			await html5QrCode.start(
				cameraId,
				{
					fps: 10,
					qrbox: { width: 250, height: 250 },
				},
				(decodedText) => {
					stopScanning(); // Safe to stop immediately after successful scan
					onScan(decodedText);
				},
				(errorMessage) => {
					console.log("QR code scan error: ", errorMessage);
				}
			);

			setIsCameraActive(true);
		} catch (error) {
			console.error("Failed to start QR scanner:", error);
			onError(error instanceof Error ? error : new Error(String(error)));
		}
	}, [onScan, onError, scannerRef, stopScanning, getCameraId]);

	

	useEffect(() => {
		return () => {
			stopScanning();
		};
	}, [stopScanning]);

	return {
		startScanning,
		stopScanning,
		isCameraActive,
	};
}
