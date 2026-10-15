// @ts-check
'use strict'

const fs = require('fs')
const path = require('path')

// gray-matter lives in the workspace root node_modules
let matter
try {
  matter = require('gray-matter')
} catch {
  matter = require(path.resolve(__dirname, '../../../node_modules/gray-matter'))
}

/** Average words-per-minute for technical reading */
const WPM = 200

/**
 * Strip MDX/JSX tags, import lines, frontmatter artefacts, and HTML comments
 * from content so word count is representative of prose.
 */
function extractProse(content) {
  return content
    .replace(/^---[\s\S]*?---/, '') // frontmatter (just in case)
    .replace(/^import\s.+$/gm, '') // import lines
    .replace(/export\s+(const|function|default)[^}]*\{[\s\S]*?\n\}/gm, '') // export blocks
    .replace(/<[^>]+>/g, ' ') // JSX/HTML tags
    .replace(/\{[^}]+\}/g, ' ') // JSX expressions
    .replace(/```[\s\S]*?```/g, ' CODE ') // code blocks → single word
    .replace(/`[^`]+`/g, ' ') // inline code
    .replace(/\s+/g, ' ')
    .trim()
}

function estimateReadTime(content) {
  const prose = extractProse(content)
  const words = prose.split(/\s+/).filter(Boolean).length
  const minutes = Math.ceil(words / WPM)
  return `${Math.max(1, minutes)} min`
}

function getTutorialFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const filePath = path.join(dir, entry.name)
    if (entry.isDirectory()) return getTutorialFiles(filePath)
    return /\.(md|mdx)$/.test(entry.name) ? [filePath] : []
  })
}

/**
 * @param {string} siteDir
 * @param {{ dir: string, routeBasePath: string }} version
 * @returns {Array<{id: string, title: string, description: string, href: string, tags: string[], time: string}>}
 */
function loadTutorials(siteDir, version) {
  const docsDir = path.join(siteDir, version.dir)
  const tutorialsDir = path.join(docsDir, 'learn', 'tutorials')
  const tutorialFiles = getTutorialFiles(tutorialsDir)
  const base = version.routeBasePath.replace(/\/+$/, '')

  const tutorials = []

  for (const filePath of tutorialFiles) {
    if (path.basename(filePath) === 'index.mdx') continue

    const raw = fs.readFileSync(filePath, 'utf8')
    const { data: fm, content } = matter(raw)

    const slug = path.basename(filePath).replace(/\.(md|mdx)$/, '')

    tutorials.push({
      id: slug,
      title: fm.title || slug,
      description: fm.description || '',
      // Docs routes mirror the disk layout (trailing slash per siteConfig.trailingSlash).
      href: `${base}/${path.relative(docsDir, filePath).split(path.sep).join('/').replace(/\.(md|mdx)$/, '')}/`,
      tags: Array.isArray(fm.tags) ? fm.tags : [],
      time: estimateReadTime(content),
      sidebar_position: fm.sidebar_position ?? 999
    })
  }

  // Sort by sidebar_position so order matches the sidebar
  tutorials.sort((a, b) => a.sidebar_position - b.sidebar_position)

  return tutorials
}

/**
 * @param {import('@docusaurus/types').LoadContext} context
 * @param {{ versions: Array<{ version: string, dir: string, routeBasePath: string }> }} options
 * @returns {import('@docusaurus/types').Plugin<Record<string, ReturnType<typeof loadTutorials>>>}
 */
module.exports = function tutorialsDataPlugin(context, options) {
  return {
    name: 'tutorials-data',
    async loadContent() {
      /** @type {Record<string, ReturnType<typeof loadTutorials>>} */
      const byVersion = {}
      for (const version of options.versions) byVersion[version.version] = loadTutorials(context.siteDir, version)
      return byVersion
    },
    async contentLoaded({ content, actions }) {
      const { setGlobalData } = actions
      setGlobalData(content)
    }
  }
}
