import { access, readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { allPublicPages } from '../docs/.vitepress/site-map.mjs'

const markdownLink = /!?\[[^\]]*\]\(([^)]+)\)/g
const allowedDocsDirs = new Set(['.vitepress', 'public', 'superpowers', 'zh'])

const exists = async file => access(file).then(() => true, () => false)

async function walkMarkdown(dir) {
  if (!(await exists(dir))) return []
  const entries = await readdir(dir, { withFileTypes: true })
  const nested = await Promise.all(entries.map(entry => {
    const target = path.join(dir, entry.name)
    if (entry.isDirectory()) return walkMarkdown(target)
    return entry.isFile() && entry.name.endsWith('.md') ? [target] : []
  }))
  return nested.flat()
}

function stripCodeFences(source) {
  return source.replace(/```[\s\S]*?```/g, '').replace(/~~~[\s\S]*?~~~/g, '')
}

function slugifyHeading(heading) {
  return heading
    .replace(/\s*\{#[^}]+\}\s*$/, '')
    .replace(/<[^>]+>/g, '')
    .replace(/[`*_~]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function collectAnchors(source) {
  const anchors = new Set()
  const counts = new Map()
  for (const match of stripCodeFences(source).matchAll(/^#{1,6}\s+(.+?)\s*#*$/gm)) {
    const explicit = match[1].match(/\s*\{#([^}]+)\}\s*$/)?.[1]
    const base = explicit || slugifyHeading(match[1])
    const count = counts.get(base) || 0
    anchors.add(count === 0 ? base : `${base}-${count}`)
    counts.set(base, count + 1)
  }
  return anchors
}

function linkToFile(root, sourceFile, rawTarget) {
  const [target, fragment = ''] = rawTarget.split('#', 2)
  const normalizedFragment = decodeURIComponent(fragment).trim().toLowerCase()
  if (/^(?:https?:|mailto:|tel:)/.test(target)) return null
  if (!target) return { file: sourceFile, fragment: normalizedFragment }
  const decoded = decodeURI(target)
  if (decoded.startsWith('/downloads/')) {
    return { file: path.join(root, 'docs/public', decoded.slice(1)), fragment: '' }
  }
  if (decoded.startsWith('/zh/')) {
    const relative = decoded.replace(/^\/zh\//, '')
    return {
      file: path.join(root, 'docs/zh', relative.endsWith('.md') ? relative : `${relative}.md`),
      fragment: normalizedFragment
    }
  }
  const resolved = path.resolve(path.dirname(sourceFile), decoded)
  return {
    file: path.extname(resolved) ? resolved : `${resolved}.md`,
    fragment: normalizedFragment
  }
}

export async function validateMarkdownLinks(root, ignoredMissingFiles = new Set()) {
  const errors = []
  const docsRoot = path.join(root, 'docs/zh')
  for (const file of await walkMarkdown(docsRoot)) {
    const source = stripCodeFences(await readFile(file, 'utf8'))
    for (const match of source.matchAll(markdownLink)) {
      const target = linkToFile(root, file, match[1].trim())
      if (!target) continue
      if (!(await exists(target.file))) {
        if (ignoredMissingFiles.has(path.resolve(target.file))) continue
        errors.push(`${path.relative(root, file)} -> ${match[1].trim()}`)
        continue
      }
      if (target.fragment && target.file.endsWith('.md')) {
        const targetSource = await readFile(target.file, 'utf8')
        if (!collectAnchors(targetSource).has(target.fragment)) {
          errors.push(`${path.relative(root, file)} -> ${match[1].trim()}`)
        }
      }
    }
  }
  return errors
}

export async function validateLanguageDirs(root) {
  const docsRoot = path.join(root, 'docs')
  if (!(await exists(docsRoot))) return ['缺少 docs 目录']
  const entries = await readdir(docsRoot, { withFileTypes: true })
  return entries
    .filter(entry => entry.isDirectory() && !allowedDocsDirs.has(entry.name))
    .map(entry => `发现未批准的语言目录: docs/${entry.name}`)
}

async function validateRequiredPages(root) {
  const errors = []
  const missingFiles = new Set()
  for (const { link } of allPublicPages) {
    const relative = link === '/zh/' ? 'index' : link.replace(/^\/zh\//, '')
    const file = path.join(root, 'docs/zh', `${relative}.md`)
    if (!(await exists(file))) {
      errors.push(`导航目标不存在: ${link}`)
      missingFiles.add(path.resolve(file))
    }
  }
  for (const required of [
    'docs/index.md',
    'docs/zh/about/companion-pdf.md',
    'docs/public/logo.svg',
    'docs/public/downloads/sop-to-agent-application.pdf'
  ]) {
    const file = path.join(root, required)
    if (!(await exists(file))) {
      errors.push(`缺少站点资源: ${required}`)
      missingFiles.add(path.resolve(file))
    }
  }
  return { errors, missingFiles }
}

async function validateNoRootCopies(root) {
  const entries = await readdir(root, { withFileTypes: true })
  return entries
    .filter(entry => entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'README.md')
    .map(entry => `根目录残留正文: ${entry.name}`)
}

export async function validateSite(root) {
  const required = await validateRequiredPages(root)
  return [
    ...required.errors,
    ...await validateLanguageDirs(root),
    ...await validateNoRootCopies(root),
    ...await validateMarkdownLinks(root, required.missingFiles)
  ]
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : ''
if (invokedPath === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
  const errors = await validateSite(root)
  if (errors.length) {
    console.error(errors.map(error => `- ${error}`).join('\n'))
    process.exitCode = 1
  } else {
    console.log('site check passed')
  }
}
