export type SensorInput = {
	widthMm?: number;
	heightMm?: number;
	// Optional legacy fields (kept for compatibility)
	widthPx?: number;
	heightPx?: number;
	// Preferred explicit pixel pitch input (μm)
	pixelPitchUm?: number;
	isColor: boolean;
};

export type ObjectiveInput = {
	objectiveMagnification: number; // e.g., 4x, 10x
	numericalAperture: number; // NA
	fieldNumberMm: number; // FN at intermediate image plane
	couplerMagnification: number; // C-mount adapter magnification
};

export type DisplayInput = {
	diagonalInch: number; // monitor diagonal inches
	widthPx: number;
	heightPx: number;
};

export type SystemInput = {
	sensor: SensorInput;
	objective: ObjectiveInput;
	wavelengthUm: number; // default 0.55 µm
	display?: DisplayInput;
};

export type SystemOutput = {
	// sensor
	sensorWidthMm: number;
	sensorHeightMm: number;
	sensorDiagonalMm: number;
	pixelSizeUm: number; // sensor pixel pitch (echo input or computed if provided differently)
	// magnifications
	totalMagnification: number;
	// resolutions
	rayleighResolutionUm: number; // optical limit
	objectPixelSizeUm: number; // size per pixel on object
	sensorLimitedResolutionUm: number; // Nyquist limited on object
	limitingResolutionUm: number; // max( optical, sensor )
	samplingStatus: 'undersampled' | 'optimal' | 'oversampled';
	// FOV
	objectFovWidthMm: number;
	objectFovHeightMm: number;
	imagePlaneFnMm: number; // equals fieldNumberMm
	projectionDiagonalMm: number; // sensor projection diagonal in intermediate image plane
	coverageRatioPct: number; // projectionDiagonal / FN * 100
	coverageStatus: 'too_small' | 'ok' | 'too_large';
	// recommendations
	requiredPixelSizeUmForNyquist: number; // at sensor
	optimumArrayWidthPx: number;
	optimumArrayHeightPx: number;
	// display
	displayMagnification?: number; // at 100% zoom
};

const MM_PER_INCH = 25.4;

export function computeSensorDiagonal(widthMm: number, heightMm: number): number {
	return Math.sqrt(widthMm * widthMm + heightMm * heightMm);
}

export function computePixelPitchUmFromWidth(widthMm: number, widthPx?: number): number {
	if (!widthPx || widthPx <= 0) return NaN;
	return (widthMm * 1000) / widthPx;
}

export function widthMmFromPixels(widthPx?: number, pixelPitchUm?: number): number | undefined {
	if (!widthPx || !pixelPitchUm || widthPx <= 0 || pixelPitchUm <= 0) return undefined;
	return (widthPx * pixelPitchUm) / 1000;
}

export function computeTotalMagnification(objMag: number, coupler: number): number {
	const c = isFinite(coupler) && coupler > 0 ? coupler : 1;
	return Math.max(0, objMag) * c;
}

export function computeRayleighResolutionUm(lambdaUm: number, NA: number): number {
	if (!isFinite(lambdaUm) || lambdaUm <= 0 || !isFinite(NA) || NA <= 0) return NaN;
	// Rayleigh criterion ~ 0.61 λ / NA
	return 0.61 * lambdaUm / NA;
}

export function computeObjectPixelSizeUm(pixelPitchUm: number, totalMag: number): number {
	if (!isFinite(totalMag) || totalMag <= 0 || !isFinite(pixelPitchUm)) return NaN;
	return pixelPitchUm / totalMag;
}

export function computeSamplingStatus(objectPixelSizeUm: number, rayleighUm: number): 'undersampled' | 'optimal' | 'oversampled' {
	if (!isFinite(objectPixelSizeUm) || !isFinite(rayleighUm)) return 'optimal';
	const nyquistUm = rayleighUm / 2; // two pixels per Rayleigh distance
	if (objectPixelSizeUm > nyquistUm) return 'undersampled';
	if (objectPixelSizeUm < nyquistUm / 1.5) return 'oversampled'; // more than 3 px per Rayleigh
	return 'optimal';
}

export function computeObjectFovMm(sensorWidthMm: number, sensorHeightMm: number, totalMag: number): { width: number; height: number } {
	if (!isFinite(totalMag) || totalMag <= 0) return { width: NaN, height: NaN };
	return {
		width: sensorWidthMm / totalMag,
		height: sensorHeightMm / totalMag
	};
}

export function computeSensorLimitedResolutionUm(objectPixelSizeUm: number): number {
	if (!isFinite(objectPixelSizeUm)) return NaN;
	// Nyquist limited smallest resolvable feature on object
	return 2 * objectPixelSizeUm;
}

export function roundNice(x: number, digits = 3): number {
	if (!isFinite(x)) return x as any;
	return parseFloat(x.toFixed(digits));
}

export function computeDisplayMagnification(objectPixelSizeUm: number, display?: DisplayInput): number | undefined {
	if (!display || !isFinite(objectPixelSizeUm) || objectPixelSizeUm <= 0) return undefined;
	const pixelCountDiag = Math.sqrt(display.widthPx * display.widthPx + display.heightPx * display.heightPx);
	if (pixelCountDiag === 0) return undefined;
	const ppi = pixelCountDiag / display.diagonalInch;
	const pixelSizeOnDisplayMm = MM_PER_INCH / ppi;
	const objectPixelSizeMm = objectPixelSizeUm / 1000;
	return pixelSizeOnDisplayMm / objectPixelSizeMm; // displayed mm per object mm (unitless)
}

export function computeProjectionDiagonalMm(sensorWidthMm: number, sensorHeightMm: number, couplerMag: number): number {
	const c = Math.max(0.01, couplerMag);
	const w = sensorWidthMm / c;
	const h = sensorHeightMm / c;
	return Math.sqrt(w * w + h * h);
}

export function computeAll(input: SystemInput): SystemOutput {
	const { sensor, objective, wavelengthUm, display } = input;
	// Determine/derive sensor physical size
	const derivedWidthMm = widthMmFromPixels(sensor.widthPx, sensor.pixelPitchUm);
	const derivedHeightMm = widthMmFromPixels(sensor.heightPx, sensor.pixelPitchUm);
	const widthMm = (derivedWidthMm ?? sensor.widthMm ?? NaN);
	const heightMm = (derivedHeightMm ?? sensor.heightMm ?? NaN);
	const sensorDiagonalMm = computeSensorDiagonal(widthMm, heightMm);
	// Determine pixel size
	let pixelSizeUm = (sensor.pixelPitchUm && sensor.pixelPitchUm > 0)
		? sensor.pixelPitchUm
		: computePixelPitchUmFromWidth(widthMm, sensor.widthPx);
	const totalMagnification = computeTotalMagnification(objective.objectiveMagnification, objective.couplerMagnification);
	const rayleighResolutionUm = computeRayleighResolutionUm(wavelengthUm, objective.numericalAperture);
	const objectPixelSizeUm = computeObjectPixelSizeUm(pixelSizeUm, totalMagnification);
	const sensorLimitedResolutionUm = computeSensorLimitedResolutionUm(objectPixelSizeUm);
	const limitingResolutionUm = Math.max(rayleighResolutionUm, sensorLimitedResolutionUm);
	const samplingStatus = computeSamplingStatus(objectPixelSizeUm, rayleighResolutionUm);
	const fov = computeObjectFovMm(widthMm, heightMm, totalMagnification);
	const requiredPixelSizeUmForNyquist = totalMagnification * (rayleighResolutionUm / 2);
	const optimumArrayWidthPx = Math.round((widthMm * 1000) / requiredPixelSizeUmForNyquist);
	const optimumArrayHeightPx = Math.round((heightMm * 1000) / requiredPixelSizeUmForNyquist);
	const displayMagnification = computeDisplayMagnification(objectPixelSizeUm, display);
	const projectionDiagonalMm = computeProjectionDiagonalMm(widthMm, heightMm, objective.couplerMagnification);
	const coverageRatio = objective.fieldNumberMm > 0 ? (projectionDiagonalMm / objective.fieldNumberMm) * 100 : NaN;
	let coverageStatus: 'too_small' | 'ok' | 'too_large' = 'ok';
	if (isFinite(coverageRatio)) {
		if (coverageRatio > 90) coverageStatus = 'too_small';
		else if (coverageRatio < 50) coverageStatus = 'too_large';
		else coverageStatus = 'ok';
	}

	return {
		sensorWidthMm: roundNice(widthMm, 3),
		sensorHeightMm: roundNice(heightMm, 3),
		sensorDiagonalMm: roundNice(sensorDiagonalMm, 3),
		pixelSizeUm: roundNice(pixelSizeUm, 3),
		totalMagnification: roundNice(totalMagnification, 2),
		rayleighResolutionUm: roundNice(rayleighResolutionUm, 3),
		objectPixelSizeUm: roundNice(objectPixelSizeUm, 3),
		sensorLimitedResolutionUm: roundNice(sensorLimitedResolutionUm, 3),
		limitingResolutionUm: roundNice(limitingResolutionUm, 3),
		samplingStatus,
		objectFovWidthMm: roundNice(fov.width, 3),
		objectFovHeightMm: roundNice(fov.height, 3),
		imagePlaneFnMm: roundNice(objective.fieldNumberMm, 3),
		projectionDiagonalMm: roundNice(projectionDiagonalMm, 3),
		coverageRatioPct: roundNice(coverageRatio, 1),
		coverageStatus,
		requiredPixelSizeUmForNyquist: roundNice(requiredPixelSizeUmForNyquist, 3),
		optimumArrayWidthPx,
		optimumArrayHeightPx,
		displayMagnification: displayMagnification ? roundNice(displayMagnification, 2) : undefined
	};
} 