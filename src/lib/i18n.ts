import { writable, get, derived } from 'svelte/store';

export type Locale = 'zh' | 'en' | 'de';
export const locale = writable<Locale>('zh');
export const currentLocale = derived(locale, v => v);

export const LANG_NAMES: Record<Locale, string> = {
	zh: '中文',
	en: 'English',
	de: 'Deutsch'
};

const LOCALE_KEY = 'microscope_calc_locale';
export function initLocale() {
	if (typeof window === 'undefined') return;
	const saved = localStorage.getItem(LOCALE_KEY) as Locale | null;
	if (saved === 'zh' || saved === 'en' || saved === 'de') {
		locale.set(saved);
	}
	locale.subscribe(v => {
		try { localStorage.setItem(LOCALE_KEY, v); } catch {}
		if (typeof document !== 'undefined') {
			document.documentElement.lang = v;
		}
	});
}

// Translation dictionaries
const dict: Record<Locale, Record<string, string>> = {
	zh: {
		'titles.parameters': '参数设置',
		'titles.visualization': '示意与对比',
		'titles.results': '计算结果',

		'labels.language': '界面语言',
		'labels.theme': '主题',
		'labels.cameraModel': '摄像头类型',
		'labels.pixelPitch': '像素尺寸 p_sen (μm)',
		'labels.objectiveMag': '物镜倍率 M_obj',
		'labels.NA': 'NA',
		'labels.fieldNumber': '视场数 FN (mm)',
		'labels.couplerMag': 'C接口适配器倍率 M_C',
		'labels.wavelength': '波长 λ (μm)',
		'labels.display': '显示器 (100% 缩放估算)',
		'labels.diagonalInch': '对角 D_disp (英寸)',
		'labels.displayRes': '分辨率宽×高 R_disp',
		'labels.sample': '显微样本',
		'samples.hatch': '斜线阴影',
		'groups.sensor': '传感器',
		'groups.sampling': '采样与分辨率',
		'groups.opticsFov': '光学与视场',
		'labels.cameraPixelsWidth': '摄像头像素（宽）(px)',
		'labels.cameraPixelsHeight': '摄像头像素（高）(px)',
		'labels.cameraPixels': '摄像头',
		'labels.camera': '摄像头',
		'labels.cameraPixelsTitle': '摄像头像素',
		'units.px': 'px',
		'labels.systemParams': '系统参数',
		'tips.cameraPixelsWidth': '传感器横向像素数量（px）。与像素尺寸一起决定传感器物理宽度。',
		'tips.cameraPixelsHeight': '传感器纵向像素数量（px）。与像素尺寸一起决定传感器物理高度。',

		'cards.opticalResolution': '光学分辨率 (Rayleigh) r_R',
		'cards.sampling': '采样评估',
		'cards.totalMag': '总放大率 M_total',
		'cards.digitalResolution': '数码分辨率',
		'cards.objectPixel': '物方像素尺寸 p_obj',
		'cards.sensorLimited': '传感器限制分辨率 r_N',
		'cards.limitingResolution': '限制分辨率 (取大者)',
		'cards.requiredPixel': '所需像素尺寸(奈奎斯特) p_req',
		'cards.optimumArray': '最佳阵列大小(估算)',
		'cards.objectFov': '物方视场 FOV_obj',
		'cards.displayMag': '显示放大率(100%缩放)',
		'cards.sensorDiagonal': '传感器对角线 D_sen',
		'cards.projectionDiagonal': '传感器投影对角线 D_proj',
		'cards.coverage': '覆盖比例',
		'cards.coverageEval': '接口匹配评估',
		'coverage.ok': '接口合适',
		'coverage.too_small': '接口过小',
		'coverage.too_large': '接口过大',
		'misc.projectionDiagonalLabel': '投影对角线 = {d} mm',
		'tips.coverageEval': '根据覆盖比例评估接口匹配：>90% 判定接口过小；<50% 判定接口过大；否则判定接口合适。',

		'misc.fnLabel': 'FN = {value} mm',
		'misc.projectionLabel': '传感器投影 = {w} × {h} mm',
		'misc.couplerLabel': 'C接口 = {value} ×',

		'status.optimal': '合适',
		'status.undersampled': '欠采样',
		'status.oversampled': '过采样',

		'tips.cameraModel': '选择预设以自动填充摄像头像素、像素尺寸与适配器倍率。',
		'tips.cameraPixels': '摄像头像素分辨率，配合像素尺寸推导传感器物理尺寸。',
		'tips.sensorPixel': '传感器像素尺寸（μm）。与像素分辨率一起决定物理尺寸与采样能力。',
		'tips.objectiveMag': '物镜标称放大倍率（4×/10×/20×/40×/100× 等）。',
		'tips.NA': '物镜数值孔径 NA；NA 越大，分辨率越高、景深越浅。',
		'tips.fieldNumber': '中间像面可用视场直径（mm）。',
		'tips.couplerMag': 'C 接口适配器的倍率（0.35×/0.5×/0.63×/1.0×）。',
		'tips.wavelength': '用于分辨率计算的单色波长 λ，默认绿色 0.55 μm。',
		'tips.display': '用于估算 100% 缩放时的屏幕放大率，不代表成像质量。',
		'tips.diagonalInch': '显示器对角线尺寸（英寸）。',
		'tips.displayRes': '显示器像素分辨率（宽×高）。',
		'tips.sample': '选择示意背景，便于直观比较传感器投影覆盖。',
		'tips.opticalResolution': 'Rayleigh 准则：0.61×λ/NA，代表光学极限分辨率。',
		'tips.sampling': '将物方像素尺寸与 Rayleigh/2 对比评估采样是否合适。',
		'tips.objectPixel': '物方像素尺寸 p_obj = p_sen / M_total。',
		'tips.sensorLimited': '由采样限制的最小可分辨细节 r_N = 2×p_obj。',
		'tips.limitingResolution': '系统限制分辨率 = max(r_R, r_N)。',
		'tips.optimumArray': '满足奈奎斯特所需的最佳像素数组大小（估算）。',
		'tips.objectFov': '物方视场 = 传感器尺寸 / M_total。',
		'tips.totalMag': '总放大率 = 物镜倍率 × C接口适配器倍率。',
		'tips.sensorDiagonal': '由像素数 × 像素尺寸推导得到的传感器对角线。',
		'tips.projectionDiagonal': '中间像面上传感器投影的对角线长度。',
		'tips.coverage': '覆盖比例 = 投影对角线 / 视场数 × 100%。',
		'tips.displayMag': '在 100% 缩放时屏幕上的放大倍率，仅作查看尺度参考。'
	},
	en: {
		'titles.parameters': 'Parameters',
		'titles.visualization': 'Visualization',
		'titles.results': 'Results',

		'labels.language': 'Language',
		'labels.theme': 'Theme',
		'labels.cameraModel': 'Camera Model',
		'labels.pixelPitch': 'Pixel pitch p_sen (μm)',
		'labels.objectiveMag': 'Objective Magnification M_obj',
		'labels.NA': 'NA',
		'labels.fieldNumber': 'Field Number FN (mm)',
		'labels.couplerMag': 'C-mount adapter M_C',
		'labels.wavelength': 'Wavelength λ (μm)',
		'labels.display': 'Display (100% zoom estimation)',
		'labels.diagonalInch': 'Diagonal D_disp (inch)',
		'labels.displayRes': 'Resolution W×H R_disp',
		'labels.sample': 'Microscope Sample',
		'samples.hatch': 'Hatched pattern',
		'groups.sensor': 'Sensor',
		'groups.sampling': 'Sampling & Resolution',
		'groups.opticsFov': 'Optics & FOV',
		'labels.cameraPixelsWidth': 'Camera pixels (width) (px)',
		'labels.cameraPixelsHeight': 'Camera pixels (height) (px)',
		'labels.cameraPixels': 'Camera',
		'labels.camera': 'Camera',
		'labels.cameraPixelsTitle': 'Camera pixels',
		'units.px': 'px',
		'labels.systemParams': 'System Parameters',
		'tips.cameraPixelsWidth': 'Horizontal pixel count of the sensor (px). With pixel pitch gives physical width.',
		'tips.cameraPixelsHeight': 'Vertical pixel count of the sensor (px). With pixel pitch gives physical height.',

		'cards.opticalResolution': 'Optical Resolution (Rayleigh) r_R',
		'cards.sampling': 'Sampling Assessment',
		'cards.totalMag': 'Total Magnification M_total',
		'cards.digitalResolution': 'Digital Resolution',
		'cards.objectPixel': 'Object-side Pixel Size p_obj',
		'cards.sensorLimited': 'Sensor-limited Resolution r_N',
		'cards.limitingResolution': 'Limiting Resolution (max)',
		'cards.requiredPixel': 'Required Pixel (Nyquist) p_req',
		'cards.optimumArray': 'Optimum Array Size (est.)',
		'cards.objectFov': 'Object-side FOV',
		'cards.displayMag': 'Display Magnification (100%)',
		'cards.sensorDiagonal': 'Sensor diagonal D_sen',
		'cards.projectionDiagonal': 'Projection diagonal D_proj',
		'cards.coverage': 'Coverage Ratio',
		'cards.coverageEval': 'C-mount Match',
		'coverage.ok': 'OK',
		'coverage.too_small': 'C-mount too small',
		'coverage.too_large': 'C-mount too large',
		'misc.projectionDiagonalLabel': 'Proj. diagonal = {d} mm',
		'tips.coverageEval': 'Evaluate C-mount match by coverage: >90% → too small; <50% → too large; otherwise OK.',

		'misc.fnLabel': 'FN = {value} mm',
		'misc.projectionLabel': 'Sensor projection = {w} × {h} mm',
		'misc.couplerLabel': 'C-mount = {value}×',

		'status.optimal': 'optimal',
		'status.undersampled': 'undersampled',
		'status.oversampled': 'oversampled',

		'tips.cameraModel': 'Choose a preset to fill camera pixels, pixel size and adapter.',
		'tips.cameraPixels': 'Sensor pixel resolution; combines with pixel pitch to derive physical size.',
		'tips.sensorPixel': 'Sensor pixel pitch in micrometers. With pixel count determines physical size and sampling.',
		'tips.objectiveMag': 'Nominal objective magnification (4×/10×/20×/40×/100× etc.).',
		'tips.NA': 'Numerical Aperture; higher NA increases resolution, reduces depth of field.',
		'tips.fieldNumber': 'Usable field diameter at intermediate image plane (mm).',
		'tips.couplerMag': 'C-mount adapter magnification (0.35×/0.5×/0.63×/1.0×).',
		'tips.wavelength': 'Monochromatic wavelength λ used for resolution; default 0.55 μm (green).',
		'tips.display': 'For estimating on-screen magnification at 100% zoom only.',
		'tips.diagonalInch': 'Display diagonal in inches.',
		'tips.displayRes': 'Display pixel resolution (width × height).',
		'tips.sample': 'Choose a background sample for visual comparison.',
		'tips.opticalResolution': 'Rayleigh criterion: 0.61×λ/NA.',
		'tips.sampling': 'Compare p_obj to Rayleigh/2 (Nyquist) to rate sampling.',
		'tips.objectPixel': 'Object-side pixel size p_obj = p_sen / M_total.',
		'tips.sensorLimited': 'Nyquist-limited smallest feature r_N = 2×p_obj.',
		'tips.limitingResolution': 'Limiting resolution = max(r_R, r_N).',
		'tips.optimumArray': 'Best pixel array size to meet Nyquist with current size.',
		'tips.objectFov': 'Object-side FOV = sensor size / M_total.',
		'tips.totalMag': 'Total magnification = objective × C-mount adapter.',
		'tips.sensorDiagonal': 'Derived from pixels × pixel pitch.',
		'tips.projectionDiagonal': 'Diagonal of sensor projection in the intermediate plane.',
		'tips.coverage': 'Coverage = projection diagonal / FN × 100%.',
		'tips.displayMag': 'On-screen magnification at 100% zoom (viewing-only metric).'
	},
	de: {
		'titles.parameters': 'Parameter',
		'titles.visualization': 'Visualisierung',
		'titles.results': 'Ergebnisse',

		'labels.language': 'Sprache',
		'labels.theme': 'Thema',
		'labels.cameraModel': 'Kameratyp',
		'labels.pixelPitch': 'Pixelgröße p_sen (μm)',
		'labels.objectiveMag': 'Objektivvergrößerung M_obj',
		'labels.NA': 'NA',
		'labels.fieldNumber': 'Sehfelddurchmesser FN (mm)',
		'labels.couplerMag': 'C-Mount-Adapter M_C',
		'labels.wavelength': 'Wellenlänge λ (μm)',
		'labels.display': 'Display (100%-Zoom-Schätzung)',
		'labels.diagonalInch': 'Diagonale D_disp (Zoll)',
		'labels.displayRes': 'Auflösung B×H R_disp',
		'labels.sample': 'Mikroskopisches Präparat',
		'samples.hatch': 'Schraffur',
		'groups.sensor': 'Sensor',
		'groups.sampling': 'Abtastung & Auflösung',
		'groups.opticsFov': 'Optik & Sichtfeld',
		'labels.cameraPixelsWidth': 'Kamerapixel (Breite) (px)',
		'labels.cameraPixelsHeight': 'Kamerapixel (Höhe) (px)',
		'labels.cameraPixels': 'Kamera',
		'labels.camera': 'Kamera',
		'labels.cameraPixelsTitle': 'Kamerapixel',
		'units.px': 'px',
		'labels.systemParams': 'Systemparameter',
		'tips.cameraPixelsWidth': 'Horizontale Pixelanzahl des Sensors (px). Mit Pixelgröße ergibt sich die physikalische Breite.',
		'tips.cameraPixelsHeight': 'Vertikale Pixelanzahl des Sensors (px). Mit Pixelgröße ergibt sich die physikalische Höhe.',

		'cards.opticalResolution': 'Optische Auflösung (Rayleigh) r_R',
		'cards.sampling': 'Abtastbewertung',
		'cards.totalMag': 'Gesamtvergrößerung M_total',
		'cards.digitalResolution': 'Digitale Auflösung',
		'cards.objectPixel': 'Pixelgröße objektseitig p_obj',
		'cards.sensorLimited': 'Sensorbegrenzte Auflösung r_N',
		'cards.limitingResolution': 'Begrenzende Auflösung (max)',
		'cards.requiredPixel': 'Erforderliche Pixel (Nyquist) p_req',
		'cards.optimumArray': 'Optimale Arraygröße (Schätzung)',
		'cards.objectFov': 'Sichtfeld objektseitig',
		'cards.displayMag': 'Bildschirmvergrößerung (100%)',
		'cards.sensorDiagonal': 'Sensor-Diagonale D_sen',
		'cards.projectionDiagonal': 'Projektions-Diagonale D_proj',
		'cards.coverage': 'Abdeckungsgrad',
		'cards.coverageEval': 'Adapter-Passung',
		'coverage.ok': 'Passend',
		'coverage.too_small': 'Adapter zu klein',
		'coverage.too_large': 'Adapter zu groß',
		'misc.projectionDiagonalLabel': 'Proj.-Diagonale = {d} mm',
		'tips.coverageEval': 'Adapter-Passung anhand Abdeckungsgrad: >90% → zu klein; <50% → zu groß; sonst passend.',

		'misc.fnLabel': 'FN = {value} mm',
		'misc.projectionLabel': 'Sensorprojektion = {w} × {h} mm',
		'misc.couplerLabel': 'C‑Mount = {value}×',

		'status.optimal': 'optimal',
		'status.undersampled': 'Unterabtastung',
		'status.oversampled': 'Überabtastung',

		'tips.cameraModel': 'Wählen Sie ein Preset, um Pixel, Pixelgröße und Adapter auszufüllen.',
		'tips.cameraPixels': 'Sensorauflösung in Pixeln; zusammen mit der Pixelgröße ergibt sich die physikalische Größe.',
		'tips.sensorPixel': 'Sensorpixelgröße (μm). Mit Pixelanzahl ergibt sich die physikalische Größe und das Sampling.',
		'tips.objectiveMag': 'Nennvergrößerung des Objektivs (4×/10×/20×/40×/100× etc.).',
		'tips.NA': 'Numerische Apertur; größere NA erhöht die Auflösung und verringert die Schärfentiefe.',
		'tips.fieldNumber': 'Nutzbarer Sehfelddurchmesser in der Zwischenbildebene (mm).',
		'tips.couplerMag': 'C-Mount-Adaptervergrößerung (0,35×/0,5×/0,63×/0,8×/1,0×).',
		'tips.wavelength': 'Monochromatische Wellenlänge λ; Standard 0,55 μm (grün).',
		'tips.display': 'Schätzung der Bildschirmvergrößerung bei 100% Zoom.',
		'tips.diagonalInch': 'Bildschirmdiagonale in Zoll.',
		'tips.displayRes': 'Bildschirmauflösung (Breite × Höhe).',
		'tips.sample': 'Hintergrund zur visuellen FOV-Beurteilung wählen.',
		'tips.opticalResolution': 'Rayleigh-Kriterium: 0,61×λ/NA.',
		'tips.sampling': 'Vergleich p_obj mit Rayleigh/2 (Nyquist) zur Beurteilung der Abtastung.',
		'tips.objectPixel': 'Objektseitige Pixelgröße p_obj = p_sen / M_total.',
		'tips.sensorLimited': 'Nyquist-begrenztes Detail r_N = 2×p_obj.',
		'tips.limitingResolution': 'Begrenzende Auflösung = max(r_R, r_N).',
		'tips.optimumArray': 'Beste Pixelanzahl, um Nyquist zu erfüllen.',
		'tips.objectFov': 'Objektseitiges Sichtfeld = Sensorgröße / M_total.',
		'tips.totalMag': 'Gesamtvergrößerung = Objektiv × C-Mount-Adapter.',
		'tips.sensorDiagonal': 'Abgeleitet aus Pixelanzahl × Pixelgröße.',
		'tips.projectionDiagonal': 'Diagonale der Sensorprojektion in der Zwischenbildebene.',
		'tips.coverage': 'Abdeckungsgrad = Projektionsdiagonale / FN × 100%.',
		'tips.displayMag': 'Bildschirmvergrößerung bei 100% Zoom (nur Betrachtungsmaß).'
	}
};

export function t(key: string, params?: Record<string, string | number>): string {
	const l = get(locale);
	const table = dict[l] || dict.zh;
	let value = table[key] || dict.en[key] || key;
	if (params) {
		for (const k of Object.keys(params)) {
			value = value.replace(`{${k}}`, String(params[k]));
		}
	}
	return value;
}

export function tL(l: Locale, key: string, params?: Record<string, string | number>): string {
	const table = dict[l] || dict.zh;
	let value = table[key] || dict.en[key] || key;
	if (params) {
		for (const k of Object.keys(params)) {
			value = value.replace(`{${k}}`, String(params[k]));
		}
	}
	return value;
} 