const esbuild = require("esbuild")
const fs = require("node:fs")
const path = require("node:path")

// Read package.json for metadata
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, "package.json"), "utf8"))

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
const production = process.argv.includes("--production")
const watch = process.argv.includes("--watch")

/**
 * esbuild problem matcher plugin for watch mode.
 * Logs build start/end events and formats errors for VS Code's problem matcher.
 *
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
	name: "esbuild-problem-matcher",

	setup(build) {
		build.onStart(() => {
			console.log("[watch] build started")
		})
		build.onEnd((result) => {
			if (result.errors.length > 0) {
				result.errors.forEach(({ text, location }) => {
					console.error(`✘ [ERROR] ${text}`)
					if (location) {
						console.error(
							`    ${location.file}:${location.line}:${location.column}:`,
						)
					}
				})
			}
			console.log("[watch] build finished")
		})
	},
}

async function main() {
	console.log("  Running esbuild...")
	console.log("")
	console.log(banner)
	console.log("")

	const ctx = await esbuild.context({
		entryPoints: ["src/extension.ts"],
		bundle: true,
		format: "cjs",
		minify: production,
		sourcemap: !production,
		sourcesContent: false,
		platform: "node",
		outfile: "dist/extension.js",
		external: ["vscode"],
		logLevel: "silent",
		plugins: watch ? [esbuildProblemMatcherPlugin] : [],
		banner: {
			js: banner,
		},
		metafile: true,
	})

	if (watch) {
		await ctx.watch()
	} else {
		const result = await ctx.rebuild()
		await ctx.dispose()

		// Print build information
		if (result.metafile) {
			const outputs = Object.entries(result.metafile.outputs)
			for (const [file, info] of outputs) {
				const size = (info.bytes / 1024).toFixed(1)
				console.log(`  ${file}  ${size}kb`)
			}
		}

		console.log("")
		console.log(`⚡ Done`)
	}
}

main().catch((e) => {
	console.error(e)
	process.exit(1)
})
