<script lang="ts">
	import { onDestroy } from 'svelte';
	let open = false;
	let hideTimer: any;
	let mouseX = 0;
	let mouseY = 0;
	let panelEl: HTMLDivElement | null = null;

	function onMove(e: MouseEvent) {
		mouseX = e.clientX;
		mouseY = e.clientY;
		if (panelEl) positionPanel();
	}
	function show() {
		clearTimeout(hideTimer);
		open = true;
		document.addEventListener('mousemove', onMove);
	}
	function hide() {
		hideTimer = setTimeout(() => {
			open = false;
			document.removeEventListener('mousemove', onMove);
		}, 120);
	}
	function positionPanel() {
		if (!panelEl) return;
		const margin = 12;
		const vw = window.innerWidth;
		const vh = window.innerHeight;
		const rect = panelEl.getBoundingClientRect();
		let left = mouseX + margin;
		let top = mouseY + margin;
		if (left + rect.width > vw - margin) left = Math.max(margin, vw - rect.width - margin);
		if (top + rect.height > vh - margin) top = Math.max(margin, vh - rect.height - margin);
		panelEl.style.left = left + 'px';
		panelEl.style.top = top + 'px';
	}
	onDestroy(() => {
		clearTimeout(hideTimer);
		document.removeEventListener('mousemove', onMove);
	});
</script>

<div class="tip-root" on:mouseenter={show} on:mouseleave={hide}>
	<slot name="trigger"></slot>
	{#if open}
		<div class="tip-panel" bind:this={panelEl} on:introend={positionPanel} role="tooltip" aria-live="polite">
			<slot></slot>
		</div>
	{/if}
</div>

<style>
	.tip-root { position: relative; display: inline-flex; align-items: center; }
	.tip-panel {
		position: fixed;
		background: #0c0f16;
		border: 1px solid #223042;
		color: #e6e9ef;
		border-radius: 10px;
		padding: 10px 12px;
		min-width: 220px;
		max-width: 340px;
		box-shadow: 0 10px 30px rgba(0,0,0,0.35);
		z-index: 1000;
		font-size: 12px;
		line-height: 1.45;
		pointer-events: none;
	}
	.tip-panel :global(h4) { margin: 0 0 6px; font-size: 12px; color: #9aa3b2; font-weight: 600; }
</style> 