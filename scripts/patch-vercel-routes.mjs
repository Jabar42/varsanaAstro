import { readFileSync, writeFileSync } from 'node:fs';

const configPath = '.vercel/output/config.json';

const config = JSON.parse(readFileSync(configPath, 'utf-8'));

const catchAllIndex = config.routes.findIndex((r) => r.src === '^/.*$');

if (catchAllIndex !== -1 && config.routes[catchAllIndex].status === 404) {
	delete config.routes[catchAllIndex].status;
	console.log('Patched Vercel catch-all route: removed forced 404 status for i18n compatibility.');
}

writeFileSync(configPath, JSON.stringify(config, null, '\t') + '\n');
