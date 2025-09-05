export type SensorPreset = {
	name: string;
	widthMm: number;
	heightMm: number;
};

export const SENSOR_PRESETS: SensorPreset[] = [
	{ name: 'Full Frame (36 x 24 mm)', widthMm: 36, heightMm: 24 },
	{ name: 'APS-C Canon (22.3 x 14.9 mm)', widthMm: 22.3, heightMm: 14.9 },
	{ name: 'Micro Four Thirds (17.3 x 13.0 mm)', widthMm: 17.3, heightMm: 13.0 },
	{ name: '1" (13.2 x 8.8 mm)', widthMm: 13.2, heightMm: 8.8 },
	{ name: '2/3" (8.8 x 6.6 mm)', widthMm: 8.8, heightMm: 6.6 },
	{ name: '1/1.8" (7.18 x 5.32 mm)', widthMm: 7.18, heightMm: 5.32 },
	{ name: '1/1.7" (7.60 x 5.70 mm)', widthMm: 7.6, heightMm: 5.7 },
	{ name: '1/2.3" (6.17 x 4.55 mm)', widthMm: 6.17, heightMm: 4.55 },
	{ name: '1/3" (4.8 x 3.6 mm)', widthMm: 4.8, heightMm: 3.6 },
	{ name: '1/4" (3.6 x 2.7 mm)', widthMm: 3.6, heightMm: 2.7 }
]; 