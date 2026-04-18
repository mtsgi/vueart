import type { CanvasDocument } from '@/types/document'

/**
 * CanvasDocument を .vad ファイル（JSON形式）としてダウンロードする。
 * doc は getSnapshot() で取得したプレーンオブジェクトを渡すこと（Proxy非対応）。
 */
export function saveAsVad(doc: CanvasDocument): void {
  const json = JSON.stringify(doc, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  // <a> タグによるブラウザダウンロード
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${doc.name}.vad`
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}

/**
 * ファイルダイアログを開き .vad ファイルを読み込んで CanvasDocument を返す。
 * ユーザーがキャンセルした場合は Promise がペンディングのまま残る（then で利用することを想定）。
 */
export function loadVadFile(): Promise<CanvasDocument> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.vad,application/json'

    input.addEventListener('change', () => {
      const file = input.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result as string) as Record<string, unknown>
          // 最低限の構造チェック
          if (!parsed.id || !parsed.name || !Array.isArray(parsed.objects)) {
            reject(new Error('不正なファイル形式です (.vad ファイルを選択してください)'))
            return
          }
          resolve(parsed as unknown as CanvasDocument)
        } catch {
          reject(new Error('ファイルの解析に失敗しました'))
        }
      }
      reader.onerror = () => reject(new Error('ファイルの読み込みに失敗しました'))
      reader.readAsText(file)
    })

    input.click()
  })
}
