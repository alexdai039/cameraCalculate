declare module '*.svelte' {
	const component: any;
	export default component;
}

declare module 'svelte' {
	export type ComponentType = any;
}

declare module 'vite/client' {} 