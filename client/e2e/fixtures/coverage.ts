import { test as base, expect } from '@playwright/test'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'

// V8カバレッジデータの型
interface CoverageEntry {
  url: string
  ranges: Array<{ start: number; end: number }>
  text: string
}

// V8カバレッジをIstanbul形式に変換
function convertToIstanbul(coverage: CoverageEntry[]): Record<string, unknown> {
  const istanbul: Record<string, unknown> = {}

  for (const entry of coverage) {
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

// PlaywrightでV8カバレッジを収集するfixture
export const test = base.extend<{}>
  // テスト開始前にカバレッジ収集を開始
  , {
    page: async ({ page }, use) => {
      // CDPセッションを取得
      const client = await page.context().newCDPSession(page)

      // V8カバレッジ収集を開始
      await client.send('Debugger.enable')
      await client.send('Profiler.enable')
      await client.send('Profiler.startPreciseCoverage', {
        callCount: true,
        detailed: true,
      })

      await use(page)

      // カバレッジデータを収集して保存
      const { result } = await client.send('Profiler.takePreciseCoverage')

      // ブラウザの実行環境でのみ動作するフィルタリング
      const filteredResult = result.filter((entry: CoverageEntry) =>
        entry.url.includes('localhost:5173') ||
        entry.url.includes('/src/')
      )

      if (filteredResult.length > 0) {
        const coverageDir = 'coverage/e2e'

        if (!existsSync(coverageDir)) {
          mkdirSync(coverageDir, { recursive: true })
        }

        const coveragePath = join(
          coverageDir,
          `coverage-${Date.now()}.json`
        )

        // Istanbul形式に変換して保存
        const istanbulData = convertToIstanbul(filteredResult)
        writeFileSync(coveragePath, JSON.stringify(istanbulData, null, 2))
      }

      // プロファイラを停止
      await client.send('Profiler.stopPreciseCoverage')
      await client.send('Profiler.disable')
      await client.send('Debugger.disable')
    },
  }
)

export { expect }
