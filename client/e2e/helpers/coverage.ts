import { chromium, type Coverage, type BrowserContext } from '@playwright/test'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'

let context: BrowserContext
let coverageData: Coverage[] = []

export async function startCoverage(ctx: BrowserContext) {
  context = ctx
  coverageData = []

  const pages = context.pages()
  for (const page of pages) {
    const client = await page.context().newCDPSession(page)
    await client.send('Debugger.enable')
    await client.send('Profiler.enable')
    await client.send('Profiler.startPreciseCoverage', {
      callCount: true,
      detailed: true,
    })
  }
}

export async function collectCoverage() {
  const pages = context.pages()
  for (const page of pages) {
    try {
      const client = await page.context().newCDPSession(page)
      const { result } = await client.send('Profiler.takePreciseCoverage')
      coverageData.push(...result)
    } catch {
      // ページが閉じられている場合はスキップ
    }
  }
}

export async function saveCoverage() {
  if (coverageData.length === 0) return

  const coverageDir = 'coverage/e2e'
  if (!existsSync(coverageDir)) {
    mkdirSync(coverageDir, { recursive: true })
  }

  const coveragePath = join(coverageDir, `coverage-${Date.now()}.json`)

  // V8形式をIstanbul形式に変換
  const istanbulData = convertToIstanbul(coverageData)
  writeFileSync(coveragePath, JSON.stringify(istanbulData, null, 2))

  console.log(`Coverage saved to ${coveragePath}`)
}

function convertToIstanbul(coverage: Coverage[]): Record<string, unknown> {
  const istanbul: Record<string, unknown> = {}

  for (const entry of coverage) {
    // src/以下のファイルのみ対象
    if (!entry.url.includes('/src/')) continue

    const id = entry.url.replace(/[^a-zA-Z0-9]/g, '_')

    const statementMap: Record<number, { start: { line: number; column: number }; end: { line: number; column: number } }> = {}
    const s: Record<number, number> = {}

    let stmtId = 1
    for (const range of entry.ranges) {
      statementMap[stmtId] = {
        start: { line: 1, column: range.start },
        end: { line: 1, column: range.end },
      }
      s[stmtId] = 1
      stmtId++
    }

    istanbul[id] = {
      path: entry.url,
      statementMap,
      fnMap: {},
      branchMap: {},
      s,
      f: {},
      b: {},
    }
  }

  return istanbul
}
