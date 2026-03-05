"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import QRCode from "qrcode";

const PRESETS = [
	{ label: "URL", placeholder: "Enter URL here", inputMode: "url" as const },
	{ label: "Plain text", placeholder: "Enter text here", inputMode: "text" as const },
	{ label: "Email", placeholder: "mailto:hello@example.com", inputMode: "email" as const },
	{ label: "Phone", placeholder: "tel:+1234567890", inputMode: "tel" as const },
	{ label: "Wi-Fi", placeholder: "WIFI:T:WPA;S:NetworkName;P:Password;;", inputMode: "text" as const },
];

const SIZES = [256, 512, 1024];

export default function QRGenerator() {
	const [input, setInput] = useState("");
	const [fgColor, setFgColor] = useState("#000000");
	const [bgColor, setBgColor] = useState("#ffffff");
	const [size, setSize] = useState(512);
	const [preset, setPreset] = useState(0);
	const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const generate = useCallback(async (text: string, fg: string, bg: string, sz: number) => {
		if (!text.trim()) {
			setQrDataUrl(null);
			setError(null);
			return;
		}
		try {
			const url = await QRCode.toDataURL(text, {
				width: sz,
				margin: 2,
				color: { dark: fg, light: bg },
				errorCorrectionLevel: "H",
			});
			setQrDataUrl(url);
			setError(null);
		} catch {
			setError("Failed to generate QR code. The input may be too long.");
			setQrDataUrl(null);
		}
	}, []);

	useEffect(() => {
		if (debounceRef.current) clearTimeout(debounceRef.current);
		debounceRef.current = setTimeout(() => generate(input, fgColor, bgColor, size), 300);
	}, [input, fgColor, bgColor, size, generate]);

	const downloadPNG = async () => {
		if (!qrDataUrl) return;
		const res = await fetch(qrDataUrl);
		const blob = await res.blob();
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "qrcode.png";
		a.click();
		URL.revokeObjectURL(url);
	};

	const downloadSVG = async () => {
		if (!input.trim()) return;
		try {
			const svg = await QRCode.toString(input, {
				type: "svg",
				margin: 2,
				color: { dark: fgColor, light: bgColor },
				errorCorrectionLevel: "H",
			});
			const blob = new Blob([svg], { type: "image/svg+xml" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = "qrcode.svg";
			a.click();
			URL.revokeObjectURL(url);
		} catch {
			setError("Failed to export SVG.");
		}
	};

	return (
		<div className="flex min-h-screen flex-col items-start justify-start bg-zinc-50 px-4 py-8 sm:items-center sm:justify-center sm:py-16 dark:bg-zinc-950">
			<div className="w-full max-w-2xl">
				<h1 className="mb-1 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
					QR Code Generator
				</h1>
				<p className="mb-8 text-zinc-500 dark:text-zinc-400">
					Generate and download from options below.
				</p>

				{/* Preset tabs */}
				<div className="mb-4 flex flex-wrap gap-2">
					{PRESETS.map((p, i) => (
						<button
							key={p.label}
							onClick={() => { setPreset(i); setInput(""); setQrDataUrl(null); setError(null); }}
							className={`rounded-full px-4 py-2.5 text-sm font-medium transition-colors ${
								preset === i
									? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
									: "bg-white text-zinc-600 ring-1 ring-zinc-200 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700 dark:hover:bg-zinc-700"
							}`}
						>
							{p.label}
						</button>
					))}
				</div>

				{/* Input — text-base (16px) prevents iOS Safari auto-zoom */}
				<textarea
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder={PRESETS[preset].placeholder}
					inputMode={PRESETS[preset].inputMode}
					rows={3}
					className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-4 py-3 text-base text-zinc-900 placeholder-zinc-400 outline-none ring-0 transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-500 dark:focus:ring-zinc-700"
				/>

				{/* Options row */}
				<div className="mt-4 flex flex-wrap items-center gap-4">
					<label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
						<input
							type="color"
							value={fgColor}
							onChange={(e) => setFgColor(e.target.value)}
							className="h-8 w-8 cursor-pointer rounded border border-zinc-200 p-0.5 dark:border-zinc-700"
						/>
						Foreground
					</label>

					<label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
						<input
							type="color"
							value={bgColor}
							onChange={(e) => setBgColor(e.target.value)}
							className="h-8 w-8 cursor-pointer rounded border border-zinc-200 p-0.5 dark:border-zinc-700"
						/>
						Background
					</label>

					<label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
						Size
						<select
							value={size}
							onChange={(e) => setSize(Number(e.target.value))}
							className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
						>
							{SIZES.map((s) => (
								<option key={s} value={s}>{s}×{s}</option>
							))}
						</select>
					</label>
				</div>

				{/* QR preview */}
				<div className="mt-8 flex flex-col items-center">
					{error && <p className="mb-4 text-sm text-red-500">{error}</p>}
					{qrDataUrl ? (
						<>
							<div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700">
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img
									src={qrDataUrl}
									alt="Generated QR code"
									width={256}
									height={256}
									className="block max-w-full"
								/>
							</div>
							<div className="mt-5 flex gap-3">
								<button
									onClick={downloadPNG}
									className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
								>
									Download PNG
								</button>
								<button
									onClick={downloadSVG}
									className="rounded-full border border-zinc-200 bg-white px-6 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
								>
									Download SVG
								</button>
							</div>
						</>
					) : (
						<div className="flex h-64 w-64 items-center justify-center rounded-2xl border border-dashed border-zinc-300 text-zinc-400 dark:border-zinc-700 dark:text-zinc-600">
							<span className="text-sm">QR code preview</span>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
