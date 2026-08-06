import { execSync } from 'node:child_process'
const TYPE_MAP = {
  feat: 'feature',
  fix: 'fix',
  refactor: 'refactor',
  perf: 'refactor',
}
function loadGitChangelog(limit = 20) {
  try {
    const raw = execSync(`git log -n ${limit * 3} --pretty=format:%h%x09%ad%x09%s --date=short`, {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
    const items = []
    for (const line of raw.split('\n')) {
      if (!line.trim()) continue
      const [hash, date, ...rest] = line.split('	')
      const subject = rest.join('	').trim()
      const match = /^(feat|fix|refactor|perf)(?:\([^)]*\))?!?:\s*(.+)$/i.exec(subject)
      if (!match || !hash || !date) continue
      const type = TYPE_MAP[match[1].toLowerCase()]
      if (!type) continue
      items.push({
        hash,
        date,
        type,
        text: match[2].trim(),
      })
      if (items.length >= limit) break
    }
    return items
  } catch {
    return []
  }
}
function gitChangelogPlugin(limit = 20) {
  const virtualId = 'virtual:git-changelog'
  const resolvedId = `\0${virtualId}`
  return {
    name: 'git-changelog',
    resolveId(id) {
      if (id === virtualId) return resolvedId
    },
    load(id) {
      if (id !== resolvedId) return
      const items = loadGitChangelog(limit)
      return `export const gitChangelog = ${JSON.stringify(items, null, 2)}
export default gitChangelog
`
    },
  }
}
export { gitChangelogPlugin, loadGitChangelog }
