import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import esbuild from 'esbuild'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Read package.json for metadata
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'))

// Create banner with metadata
const banner = `/**
 * ${pkg.displayName} (${pkg.name})
 *
 * ${pkg.description}
 *
 * @version ${pkg.version}
 * @license ${pkg.license}
 * @author ${pkg.author.name} <${pkg.author.email}>
 * @pkg ${pkg.homepage}
 */`

// Parse CLI arguments
const production = process.argv.includes('--production')
const watch = process.argv.includes('--watch')

/**
 * esbuild problem matcher plugin for watch mode.
 * Logs build start/end events and formats errors for VS Code's problem matcher.
 *
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
	name: 'esbuild-problem-matcher',

	setup(build) {
		build.onStart(() => {
			console.log('[watch] build started')
		})
		build.onEnd((result) => {
			if (result.errors.length > 0) {
				result.errors.forEach(({ text, location }) => {
					console.error(`✘ [ERROR] ${text}`)
					if (location) {
						console.error(`    ${location.file}:${location.line}:${location.column}:`)
					}
				})
			}
			console.log('[watch] build finished')
		})
	},
}

async function main() {
	console.log('  Running esbuild...')
	console.log('')
	console.log(banner)
	console.log('')

	/** @type {import('esbuild').BuildOptions} */
	const sharedOptions = {
		bundle: true,
		format: 'cjs',
		minify: production,
		sourcemap: !production,
		sourcesContent: false,
		platform: 'node',
		external: ['vscode'],
		logLevel: 'silent',
		plugins: watch ? [esbuildProblemMatcherPlugin] : [],
		metafile: true,
	}

	// Build main extension
	const ctx = await esbuild.context({
		...sharedOptions,
		entryPoints: ['src/extension.ts'],
		outfile: 'dist/extension.js',
		banner: {
			js: banner,
		},
	})

	// Build test files (only in non-production)
	const testCtx = !production
		? await esbuild.context({
				...sharedOptions,
				entryPoints: ['src/test/*.test.ts'],
				outdir: 'dist/test',
			})
		: null

	if (watch) {
		await ctx.watch()
		if (testCtx) await testCtx.watch()
	} else {
		const result = await ctx.rebuild()
		await ctx.dispose()

		if (testCtx) {
			await testCtx.rebuild()
			await testCtx.dispose()
		}

		// Print build information
		if (result.metafile) {
			const outputs = Object.entries(result.metafile.outputs)
			for (const [file, info] of outputs) {
				const size = (info.bytes / 1024).toFixed(1)
				console.log(`  ${file}  ${size}kb`)
			}
		}

		console.log('')
		console.log(`⚡ Done`)
	}
}

main().catch((e) => {
	console.error(e)
	process.exit(1)
})
