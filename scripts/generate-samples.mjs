import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const publicDir = path.join(root, 'public', 'samples');
const outFile = path.join(root, 'src', 'data', 'samples.ts');

async function main() {
	let files = [];
	try {
		const entries = await fs.readdir(publicDir, { withFileTypes: true });
		files = entries
			.filter(e => e.isFile())
			.map(e => e.name)
			.filter(n => /\.(jpg|jpeg)$/i.test(n))
			.sort((a, b) => a.localeCompare(b, 'en'));
	} catch (err) {
		console.error('Failed to read samples directory:', err);
	}

	await fs.mkdir(path.dirname(outFile), { recursive: true });

	const items = files.map(name => `\t{ key: ${JSON.stringify(name)}, label: ${JSON.stringify(name)}, filename: ${JSON.stringify('samples/' + name)} }`).join(',\n');
	const content = `export type Sample = { key: string; label: string; filename?: string };

export const SAMPLES: Sample[] = [
\t{ key: 'hatch', label: 'samples.hatch' },
${items}${items ? '\n' : ''}];
`;
	await fs.writeFile(outFile, content, 'utf8');
	console.log(`Generated ${path.relative(root, outFile)} with ${files.length} sample(s).`);
}

main().catch(err => {
	console.error(err);
	process.exit(1);
}); 