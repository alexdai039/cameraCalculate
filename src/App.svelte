<script lang="ts">
	import { SENSOR_PRESETS } from './data/sensors';
	import { computeAll, type SystemInput } from './lib/calculations';
	import { t, locale, LANG_NAMES, type Locale, currentLocale } from './lib/i18n';
	import Tooltip from './components/Tooltip.svelte';
	import { SAMPLES } from './data/samples';
	import { CAMERA_PRESETS } from './data/cameras';

	// theme
	let theme: 'dark' | 'light' = 'dark';
	function toggleTheme() {
		theme = theme === 'dark' ? 'light' : 'dark';
		document.documentElement.dataset.theme = theme;
		localStorage.setItem('microscope_calc_theme', theme);
	}
	if (typeof window !== 'undefined') {
		const savedTheme = localStorage.getItem('microscope_calc_theme') as 'dark' | 'light' | null;
		if (savedTheme === 'dark' || savedTheme === 'light') {
			theme = savedTheme;
			document.documentElement.dataset.theme = theme;
		}
	}

	// common option lists
	const C_ADAPTER_OPTIONS = [
		{ label: 'P90-C 1/3" 0.35x', value: 0.35 },
		{ label: 'P90-C 1/2" 0.5x', value: 0.5 },
		{ label: 'P90-C 2/3" 0.65x', value: 0.65 },
		{ label: '60N C 2/3" 0.5x', value: 0.5 },
		{ label: '60N C 2/3" 0.63x', value: 0.63 },
		{ label: '60N C 1" 0.8x', value: 0.8 },
		{ label: '60N C 1" 1.0x', value: 1.0 }
	];
	const FN_OPTIONS = [20, 22, 23, 25];
	const OBJECTIVE_OPTIONS = [2, 4, 5, 10, 20, 40, 50, 60, 63, 100];
	const DEFAULT_NA: Record<number, number> = { 2: 0.06, 4: 0.10, 5: 0.12, 10: 0.25, 20: 0.4, 40: 0.65, 50: 0.8, 60: 0.85, 63: 0.9, 100: 1.25 };

	// state
	let cameraWidthPx = 1920;
	let cameraHeightPx = 1080;
	let pixelPitchUm = 3.45; // input
	let isColor = false;

	let objectiveMagnification = 10; // default 10x
	let numericalAperture = DEFAULT_NA[objectiveMagnification] ?? 0.25;
	let fieldNumberMm = 23; // default 23
	let couplerMagnification = 0.69;

	let wavelengthUm = 0.55; // 550 nm

	let displayDiagonalInch = 21.0; // default 21"
	let displayWidthPx = 1920;
	let displayHeightPx = 1080;

	// camera model presets
	let selectedCameraIdx: number = -1;
	function applyCameraPreset(idx: number) {
		selectedCameraIdx = idx;
		const p = CAMERA_PRESETS[idx];
		if (!p) return;
		cameraWidthPx = p.widthPx;
		cameraHeightPx = p.heightPx;
		pixelPitchUm = p.pixelPitchUm;
		couplerMagnification = p.couplerMag;
	}

	// sample selection
	let selectedSampleKey: string = SAMPLES[0]?.key ?? '';
	const baseUrl = import.meta.env.BASE_URL || '/';
	$: selectedSample = SAMPLES.find(s => s.key === selectedSampleKey);
	$: sampleUrl = (selectedSample && selectedSample.filename) ? (baseUrl + selectedSample.filename) : '';

	let input: SystemInput;

	function switchLang(e: Event) {
		const value = (e.target as HTMLSelectElement).value as Locale;
		locale.set(value);
	}

	function onObjectiveSelect(e: Event) {
		const mag = Number((e.target as HTMLSelectElement).value);
		objectiveMagnification = mag;
		numericalAperture = DEFAULT_NA[mag] ?? numericalAperture;
	}

	function onCameraPresetChange(e: Event) {
		const sel = e.currentTarget as HTMLSelectElement;
		applyCameraPreset(Number(sel.value));
	}

	// recompute uses out.sensorWidthMm etc for visualization
	$: rectWidthInPlane = out ? out.sensorWidthMm / Math.max(0.01, couplerMagnification) : 0;
	$: rectHeightInPlane = out ? out.sensorHeightMm / Math.max(0.01, couplerMagnification) : 0;
	$: rectDiagonalInPlane = Math.sqrt(rectWidthInPlane*rectWidthInPlane + rectHeightInPlane*rectHeightInPlane);

	$: input = {
		sensor: { widthPx: cameraWidthPx, heightPx: cameraHeightPx, pixelPitchUm: pixelPitchUm, isColor },
		objective: { objectiveMagnification, numericalAperture, fieldNumberMm, couplerMagnification },
		wavelengthUm,
		display: { diagonalInch: displayDiagonalInch, widthPx: displayWidthPx, heightPx: displayHeightPx }
	} satisfies SystemInput;

	let out = computeAll({
		sensor: { widthPx: cameraWidthPx, heightPx: cameraHeightPx, pixelPitchUm: pixelPitchUm, isColor },
		objective: { objectiveMagnification, numericalAperture, fieldNumberMm, couplerMagnification },
		wavelengthUm,
		display: { diagonalInch: displayDiagonalInch, widthPx: displayWidthPx, heightPx: displayHeightPx }
	});
	$: out = computeAll(input);

	function samplingBadgeClassText() {
		const key = `status.${out.samplingStatus}`;
		return $t(key);
	}
	function samplingBadgeClassColor() {
		return out.samplingStatus === 'optimal' ? 'badge ok' : 'badge err';
	}

	function coverageColor() {
		if (out.coverageStatus === 'ok') return 'badge ok';
		return 'badge err';
	}

	// Visualization parameters
	$: fnDiameter = fieldNumberMm;
	$: scale = 200 / fnDiameter; // svg units per mm

	function isLightTheme() {
		return typeof document !== 'undefined' && document.documentElement.dataset.theme === 'light';
	}
</script>

<!-- Parameters: header with language/theme, plus camera model preset selector -->
<div class="app-shell">
	<div class="sidebar-left">
		<div class="header" style="display:flex;gap:8px;align-items:center;justify-content:space-between;">
			<div>{$t('titles.parameters')}</div>
			<div style="display:flex;gap:6px;align-items:center;">
				<label class="label" for="lang-select">{$t('labels.language')}</label>
				<select id="lang-select" class="input" on:change={switchLang} bind:value={$currentLocale}>
					<option value="zh">{LANG_NAMES.zh}</option>
					<option value="en">{LANG_NAMES.en}</option>
					<option value="de">{LANG_NAMES.de}</option>
				</select>
				<button class="input" style="width:auto;padding:6px 10px;cursor:pointer;" on:click={toggleTheme}>{$t('labels.theme')}: {theme}</button>
			</div>
		</div>
		<section>
			<div class="label">{$t('labels.camera')}</div>
			<Tooltip><span slot="trigger" class="label">{$t('labels.cameraModel')}</span><div><h4>{$t('labels.cameraModel')}</h4>{$t('tips.cameraModel')}</div></Tooltip>
			<select class="input" on:change={onCameraPresetChange}>
				<option value="-1">—</option>
				{#each CAMERA_PRESETS as c, i}
					<option value={i}>{c.name}</option>
				{/each}
			</select>
		</section>
		<section>
			
			<div class="row">
				<div>
					<Tooltip><span slot="trigger" class="label">{$t('labels.cameraPixelsWidth')}</span><div><h4>{$t('labels.cameraPixelsWidth')}</h4>{$t('tips.cameraPixelsWidth')}</div></Tooltip>
					<input class="input" type="number" step="1" bind:value={cameraWidthPx} placeholder="{$t('labels.cameraPixelsWidth')}">
				</div>
				<div>
					<Tooltip><span slot="trigger" class="label">{$t('labels.cameraPixelsHeight')}</span><div><h4>{$t('labels.cameraPixelsHeight')}</h4>{$t('tips.cameraPixelsHeight')}</div></Tooltip>
					<input class="input" type="number" step="1" bind:value={cameraHeightPx} placeholder="{$t('labels.cameraPixelsHeight')}">
				</div>
			</div>
			<div class="row" style="margin-top:8px;">
				<div>
					<Tooltip><span slot="trigger" class="label">{$t('labels.pixelPitch')}</span><div><h4>{$t('labels.pixelPitch')}</h4>{$t('tips.sensorPixel')}</div></Tooltip>
					<input class="input" type="number" step="0.01" bind:value={pixelPitchUm}>
				</div>
				<div></div>
			</div>
		</section>
		<section>
			<div class="label">{$t('labels.systemParams')}</div>
			<div class="row">
				<div>
					<Tooltip><span slot="trigger" class="label">{$t('labels.objectiveMag')}</span><div><h4>{$t('labels.objectiveMag')}</h4>{$t('tips.objectiveMag')}</div></Tooltip>
					<div class="row">
						<select class="input" on:change={onObjectiveSelect} bind:value={objectiveMagnification}>
							{#each OBJECTIVE_OPTIONS as m}
								<option value={m}>{m}×</option>
							{/each}
						</select>
						<input class="input" type="number" step="0.1" bind:value={objectiveMagnification}>
					</div>
				</div>
				<div>
					<Tooltip><span slot="trigger" class="label">{$t('labels.NA')}</span><div><h4>{$t('labels.NA')}</h4>{$t('tips.NA')}</div></Tooltip>
					<input class="input" type="number" step="0.001" bind:value={numericalAperture}>
				</div>
			</div>
			<div class="row" style="margin-top:8px;">
				<div>
					<Tooltip><span slot="trigger" class="label">{$t('labels.fieldNumber')}</span><div><h4>{$t('labels.fieldNumber')}</h4>{$t('tips.fieldNumber')}</div></Tooltip>
					<div class="row">
						<select class="input" bind:value={fieldNumberMm}>
							{#each FN_OPTIONS as f}
								<option value={f}>{f}</option>
							{/each}
						</select>
						<input class="input" type="number" step="0.1" bind:value={fieldNumberMm}>
					</div>
				</div>
				<div>
					<Tooltip><span slot="trigger" class="label">{$t('labels.couplerMag')}</span><div><h4>{$t('labels.couplerMag')}</h4>{$t('tips.couplerMag')}</div></Tooltip>
					<div class="row">
						<select class="input" bind:value={couplerMagnification}>
							{#each C_ADAPTER_OPTIONS as opt}
								<option value={opt.value}>{opt.label}</option>
							{/each}
						</select>
						<input class="input" type="number" step="0.01" bind:value={couplerMagnification}>
					</div>
				</div>
			</div>
		</section>
		<section>
			<Tooltip><span slot="trigger" class="label">{$t('labels.wavelength')}</span><div><h4>{$t('labels.wavelength')}</h4>{$t('tips.wavelength')}</div></Tooltip>
			<input class="input" type="number" min="0.4" max="0.7" step="0.01" bind:value={wavelengthUm}>
		</section>
		<section>
			<Tooltip><span slot="trigger" class="label">{$t('labels.display')}</span><div><h4>{$t('labels.display')}</h4>{$t('tips.display')}</div></Tooltip>
			<div class="row">
				<div>
					<Tooltip><span slot="trigger" class="label">{$t('labels.diagonalInch')}</span><div><h4>{$t('labels.diagonalInch')}</h4>{$t('tips.diagonalInch')}</div></Tooltip>
					<input class="input" type="number" step="0.1" bind:value={displayDiagonalInch}>
				</div>
				<div>
					<Tooltip><span slot="trigger" class="label">{$t('labels.displayRes')}</span><div><h4>{$t('labels.displayRes')}</h4>{$t('tips.displayRes')}</div></Tooltip>
					<div class="row">
						<input class="input" type="number" step="1" bind:value={displayWidthPx}>
						<input class="input" type="number" step="1" bind:value={displayHeightPx}>
					</div>
				</div>
			</div>
		</section>
	</div>

	<!-- Center: Visualization -->
	<div class="center">
		<div class="header">{$t('titles.visualization')}</div>
		<div class="row" style="margin-bottom:4px;">
			<div>
				<Tooltip><span slot="trigger" class="label">{$t('labels.sample')}</span><div><h4>{$t('labels.sample')}</h4>{$t('tips.sample')}</div></Tooltip>
				<select class="input" bind:value={selectedSampleKey}>
					{#each SAMPLES as s}
						<option value={s.key}>{s.label === 'samples.hatch' ? $t(s.label) : s.label}</option>
					{/each}
				</select>
			</div>
		</div>

		<div class="figure">
			<svg viewBox="0 0 240 240" width="480" height="480" aria-label="FN">
				<defs>
					<clipPath id="fovClip">
						<circle cx="120" cy="120" r="{(fnDiameter/2)*scale}" />
					</clipPath>
					<pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse">
						<path d="M0,6 l6,-6 M-1,1 l2,-2 M5,7 l2,-2" stroke="#2a3140" stroke-width="1"/>
					</pattern>
				</defs>
				{#if sampleUrl}
					<image href={sampleUrl} x="0" y="0" width="240" height="240" preserveAspectRatio="xMidYMid slice" clip-path="url(#fovClip)" />
				{:else}
					<circle cx="120" cy="120" r="{(fnDiameter/2)*scale}" fill="url(#hatch)" />
				{/if}
				<circle class="viz-circle" cx="120" cy="120" r="{(fnDiameter/2)*scale}" fill="none" stroke-width="2" />
				<rect class="viz-rect" x="{120 - (rectWidthInPlane*scale)/2}"
					y="{120 - (rectHeightInPlane*scale)/2}"
					width="{rectWidthInPlane*scale}"
					height="{rectHeightInPlane*scale}"
					stroke-width="2" />
				<!-- diagonal -->
				<line class="viz-diag" x1="{120 - (rectWidthInPlane*scale)/2}" y1="{120 - (rectHeightInPlane*scale)/2}"
					x2="{120 + (rectWidthInPlane*scale)/2}" y2="{120 + (rectHeightInPlane*scale)/2}"
					stroke-width="2" />
				<text class="viz-labels" x="140" y="120" text-anchor="middle" font-size="6">D = {rectDiagonalInPlane.toFixed(2)} mm</text>
				<!-- top-left stacked labels -->
				<g class="viz-labels" font-size="6" text-anchor="start">
					<text x="0" y="8">{$t('misc.fnLabel', { value: fieldNumberMm })}</text>
					<text x="0" y="20">{$t('misc.projectionLabel', { w: rectWidthInPlane.toFixed(2), h: rectHeightInPlane.toFixed(2) })}</text>
					<text x="0" y="32">{$t('misc.projectionDiagonalLabel', { d: rectDiagonalInPlane.toFixed(2) })}</text>
					<text x="0" y="44">{$t('misc.couplerLabel', { value: couplerMagnification })}</text>
				</g>
				<!-- top-right stacked labels -->
				<g class="viz-labels" font-size="6" text-anchor="end">
					<text x="240" y="8">{$t('misc.cameraResLabel', { w: cameraWidthPx, h: cameraHeightPx })}</text>
					<text x="240" y="20">{$t('misc.pixelPitchLabel', { value: pixelPitchUm })}</text>
				</g>
			</svg>
		</div>

		<div style="color:#8ea1b8;font-size:12px;margin-top:6px;display:flex;gap:16px;align-items:center;">
			<div>{$t('misc.fnLabel', { value: fieldNumberMm })}</div>
			<div>{$t('misc.projectionLabel', { w: rectWidthInPlane.toFixed(2), h: rectHeightInPlane.toFixed(2) })}</div>
		</div>
	</div>

	<!-- Right: Results -->
	<div class="sidebar-right">
		<div class="header">{$t('titles.results')}</div>
		<div class="group-title">{$t('groups.sensor')}</div>
		<div class="grid-3">
			<Tooltip><span slot="trigger" class="card"><h3>{$t('cards.sensorDiagonal')}</h3><div class="value">{out.sensorDiagonalMm}<span class="unit"> mm</span></div><div class="label">{out.sensorWidthMm} × {out.sensorHeightMm} mm</div></span><div><h4>{$t('cards.sensorDiagonal')}</h4>{$t('tips.sensorDiagonal')}</div></Tooltip>
			<Tooltip><span slot="trigger" class="card"><h3>{$t('cards.projectionDiagonal')}</h3><div class="value">{out.projectionDiagonalMm}<span class="unit"> mm</span></div></span><div><h4>{$t('cards.projectionDiagonal')}</h4>{$t('tips.projectionDiagonal')}</div></Tooltip>
			<Tooltip><span slot="trigger" class="card"><h3>{$t('cards.coverage')}</h3><div class="value">{out.coverageRatioPct}<span class="unit"> %</span></div></span><div><h4>{$t('cards.coverage')}</h4>{$t('tips.coverage')}</div></Tooltip>
			<Tooltip><span slot="trigger" class="card"><h3>{$t('cards.coverageEval')}</h3><div class={out.coverageStatus === 'ok' ? 'badge ok' : 'badge err'}>{$t(`coverage.${out.coverageStatus}`)}</div></span><div><h4>{$t('cards.coverageEval')}</h4>{$t('tips.coverageEval')}</div></Tooltip>
		</div>

		<div class="group-title">{$t('groups.sampling')}</div>
		<div class="grid-3">
			<Tooltip><span slot="trigger" class="card"><h3>{$t('cards.opticalResolution')}</h3><div class="value">{out.rayleighResolutionUm}<span class="unit"> μm</span></div></span><div><h4>{$t('cards.opticalResolution')}</h4>{$t('tips.opticalResolution')}</div></Tooltip>
			<Tooltip><span slot="trigger" class="card"><h3>{$t('cards.digitalResolution')}</h3><div class="value">{out.objectPixelSizeUm}<span class="unit"> μm/px</span></div></span><div><h4>{$t('cards.objectPixel')}</h4>{$t('tips.objectPixel')}</div></Tooltip>
			<Tooltip><span slot="trigger" class="card"><h3>{$t('cards.sampling')}</h3><div class={out.samplingStatus === 'optimal' ? 'badge ok' : 'badge err'}>{$t(`status.${out.samplingStatus}`)}</div></span><div><h4>{$t('cards.sampling')}</h4>{$t('tips.sampling')}</div></Tooltip>
		</div>

		<div class="group-title">{$t('groups.opticsFov')}</div>
		<div class="grid-3">
			<Tooltip><span slot="trigger" class="card"><h3>{$t('cards.totalMag')}</h3><div class="value">{out.totalMagnification}×</div></span><div><h4>{$t('cards.totalMag')}</h4>{$t('tips.totalMag')}</div></Tooltip>
			<Tooltip><span slot="trigger" class="card"><h3>{$t('cards.objectFov')}</h3><div class="value">{out.objectFovWidthMm} × {out.objectFovHeightMm}<span class="unit"> mm</span></div></span><div><h4>{$t('cards.objectFov')}</h4>{$t('tips.objectFov')}</div></Tooltip>
			<Tooltip><span slot="trigger" class="card"><h3>{$t('cards.optimumArray')}</h3><div class="value">{out.optimumArrayWidthPx} × {out.optimumArrayHeightPx}<span class="unit"> px</span></div></span><div><h4>{$t('cards.optimumArray')}</h4>{$t('tips.optimumArray')}</div></Tooltip>
			<Tooltip><span slot="trigger" class="card"><h3>{$t('cards.displayMag')}</h3><div class="value">{out.displayMagnification ?? '—'}{#if out.displayMagnification}<span class="unit">×</span>{/if}</div></span><div><h4>{$t('cards.displayMag')}</h4>{$t('tips.displayMag')}</div></Tooltip>
		</div>
	</div>
</div>

<style>
	/* overrides for small widths */
	@media (max-width: 900px) {
		.app-shell { grid-template-columns: 1fr; padding: 8px; }
	}
	/* Visualization-specific theme adherence */
	.figure svg text { paint-order: stroke; stroke: transparent; stroke-width: 0; }
</style> 