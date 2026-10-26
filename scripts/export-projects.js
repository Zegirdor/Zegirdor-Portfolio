import { chmod, copyFile, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const { Pool } = pg
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outputDirectory = path.join(projectRoot, 'public', 'data')
const screenshotDirectory = path.join(projectRoot, 'public', 'images', 'project_screenshots') // TODO Sincronize to a single variable to match line 70

const requiredEnvironment = ['PGHOST', 'PGPORT', 'PGDATABASE', 'PGUSER', 'PGPASSWORD']
const missingEnvironment = requiredEnvironment.filter((name) => !process.env[name])

if (missingEnvironment.length > 0) {
	throw new Error('Missing PostgreSQL environment variables: ' + missingEnvironment.join(', '))
}

const pool = new Pool()

try {
	const sql = [
		'SELECT',
		'  repository.id,',
		'  repository.name,',
		'  repository.description,',
		'  repository.git_repository_url AS "repositoryUrl",',
		'  repository.demo_url AS "demoUrl",',
		'  repository.screenshot_path AS "screenshotPath",',
		'  repository.version,',
		"  to_char(repository.project_date, 'YYYY-MM-DD') AS \"projectDate\",",
		'  repository.authors,',
		'  repository.completion_percent AS completion,',
		'  COALESCE(',
		'    array_agg(technology.name ORDER BY technology.name)',
		'      FILTER (WHERE technology.id IS NOT NULL),',
		'    ARRAY[]::text[]',
		'  ) AS technologies',
		'FROM repository',
		'LEFT JOIN repository_technology',
		'  ON repository_technology.repository_id = repository.id',
		'LEFT JOIN technology',
		'  ON technology.id = repository_technology.technology_id',
		'WHERE repository.is_visible = TRUE',
		'GROUP BY repository.id',
		'ORDER BY repository.display_order, repository.project_date DESC NULLS LAST, repository.id',
	].join('\n') // TODO: Change this later to a single quote.

	const { rows } = await pool.query(sql)
	const projects = []

	for (const row of rows) {
		let screenshotUrl = null

		if (row.screenshotPath) {
			const extension = path.extname(row.screenshotPath).toLowerCase()

			if (!extension) {
				throw new Error('Project ID ' + row.id + ' has a screenshot path without a file extension.')
			}

			const screenshotFileName = String(row.id) + extension

			try {
				await mkdir(screenshotDirectory, { recursive: true })
				await copyFile(row.screenshotPath, path.join(screenshotDirectory, screenshotFileName))
				
				const destination = path.join(screenshotDirectory, screenshotFileName)
				await copyFile(row.screenshotPath, destination)
				await chmod(destination, 0o644)
			} catch {
				throw new Error('Could not copy the screenshot for project ID ' + row.id + '. Check its database path and runner read permissions.')
			}

			screenshotUrl = 'images/project_screenshots/' + screenshotFileName
		}

		projects.push({
			id: row.id,
			name: row.name,
			description: row.description,
			repositoryUrl: row.repositoryUrl,
			demoUrl: row.demoUrl,
			screenshotUrl,
			version: row.version,
			projectDate: row.projectDate,
			authors: row.authors,
			technologies: row.technologies,
			completion: row.completion,
		}) // TODO: Check this to see if it can be simplified
	}

	await mkdir(outputDirectory, { recursive: true })
	await writeFile(
		path.join(outputDirectory, 'projects.json'),
		JSON.stringify(projects, null, 2) + '\n',
		'utf8',
	)

	console.info('Exported ' + projects.length + ' visible portfolio project(s).')
} finally {
	await pool.end()
}
