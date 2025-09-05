export type CameraPreset = {
	name: string;
	widthPx: number;
	heightPx: number;
	pixelPitchUm: number;
	couplerMag: number;
};

export const CAMERA_PRESETS: CameraPreset[] = [
	{ name: 'Educam 105', widthPx: 2592, heightPx: 1944, pixelPitchUm: 2.0, couplerMag: 0.5 },
	{ name: 'Axiocam 105 color', widthPx: 2592, heightPx: 1944, pixelPitchUm: 2.2, couplerMag: 0.5 },
	{ name: 'Axiocam 212 color (12MP; 1/1.7")', widthPx: 4032, heightPx: 3044, pixelPitchUm: 1.85, couplerMag: 0.5 },
	{ name: 'Axiocam 212 color (4K; 1/2.1")', widthPx: 3840, heightPx: 2160, pixelPitchUm: 1.85, couplerMag: 0.5 },
	{ name: 'Axiocam 212 color (1080p; 1/2.1")', widthPx: 1920, heightPx: 1080, pixelPitchUm: 3.7, couplerMag: 0.5 },
	{ name: 'Axiocam 203 mono (3MP; 1/1.7")', widthPx: 1984, heightPx: 1522, pixelPitchUm: 3.7, couplerMag: 0.5 },
	{ name: 'Axiocam 203 mono (1080p; 1/2.1")', widthPx: 1920, heightPx: 1080, pixelPitchUm: 3.7, couplerMag: 0.5 },	
	{ name: 'Axiocam 305 color (2/3")', widthPx: 2464, heightPx: 2056, pixelPitchUm: 3.45, couplerMag: 0.63 },
	{ name: 'Axiocam 705 color (2/3")', widthPx: 2464, heightPx: 2056, pixelPitchUm: 3.45, couplerMag: 0.63 },
	{ name: 'Axiocam 712 color (1")', widthPx: 4096, heightPx: 3008, pixelPitchUm: 3.45, couplerMag: 1 },
	{ name: 'Axiocam 807 color (1.1")', widthPx: 3216, heightPx: 2208, pixelPitchUm: 4.5, couplerMag: 1 },
	{ name: 'Axiocam 820 color (1.1")', widthPx: 4512, heightPx: 4512, pixelPitchUm: 2.74, couplerMag: 1 }
]; 