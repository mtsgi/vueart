import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { IconProp } from '@fortawesome/fontawesome-svg-core'
import type { CanvasObject, GroupObject, RectObject, TextObject, EllipseObject } from '@/types/objects'
import { generateId } from '@/utils/idGenerator'
import { loadImageFile } from '@/utils/fileIo'
import { useHistoryStore } from './useHistoryStore'

// ============================================================
// 型定義
// ============================================================

/** アセットの種別 */
export type AssetType = 'shape' | 'filter' | 'preset' | 'image'

/** アセット定義 */
export interface AssetDefinition {
  id: string
  label: string
  description: string
  icon: IconProp
  type: AssetType
  /** shape: CanvasObject のテンプレート（id は追加時に上書き） */
  objectTemplate?: Partial<CanvasObject>
  /** preset: GroupObject の children テンプレート（id はすべて追加時に再生成） */
  presetChildren?: CanvasObject[]
  /** filter: 選択中オブジェクトに適用する filterId */
  filterId?: string
}

/** アセットフォルダ */
export interface AssetFolder {
  id: string
  label: string
  open: boolean
  items: AssetDefinition[]
}

// ============================================================
// プリセット children テンプレート定義
// ============================================================

/** ID 再生成ヘルパー（プリセット children に使用） */
function withNewId<T extends CanvasObject>(obj: T): T {
  return { ...obj, id: '__placeholder__' } as T
}

const PRESET_WIN98_BUTTON: CanvasObject[] = [
  withNewId<RectObject>({
    id: '', type: 'rect', x: 0, y: 0, width: 80, height: 26,
    fill: '#c0c0c0', stroke: '#ffffff', strokeWidth: 2,
    rx: 0, ry: 0, rotation: 0, opacity: 1, visible: true, locked: false,
    filterId: 'filter-emboss-button', label: 'ボタン背景',
  }),
  withNewId<TextObject>({
    id: '', type: 'text', x: 8, y: 3, width: 64, height: 20,
    text: 'Button', fontSize: 13, fontFamily: 'sans-serif',
    fontWeight: 'normal', fill: '#000000', textAnchor: 'start',
    rotation: 0, opacity: 1, visible: true, locked: false, filterId: null, label: 'ボタンテキスト',
  }),
]

const PRESET_SHADOW_BOX: CanvasObject[] = [
  withNewId<RectObject>({
    id: '', type: 'rect', x: 0, y: 0, width: 120, height: 80,
    fill: '#1a1a2e', stroke: '#4a9eff', strokeWidth: 1,
    rx: 6, ry: 6, rotation: 0, opacity: 1, visible: true, locked: false,
    filterId: 'filter-drop-shadow', label: 'シャドウボックス',
  }),
  withNewId<TextObject>({
    id: '', type: 'text', x: 10, y: 28, width: 100, height: 24,
    text: 'Label', fontSize: 16, fontFamily: 'sans-serif',
    fontWeight: 'bold', fill: '#4a9eff', textAnchor: 'start',
    rotation: 0, opacity: 1, visible: true, locked: false, filterId: null, label: 'ラベル',
  }),
]

const PRESET_BEVEL_BADGE: CanvasObject[] = [
  withNewId<EllipseObject>({
    id: '', type: 'ellipse', x: 0, y: 0, width: 80, height: 80,
    fill: '#4a9eff', stroke: '#2255aa', strokeWidth: 2,
    rotation: 0, opacity: 1, visible: true, locked: false,
    filterId: 'filter-bevel-emboss', label: 'バッジ背景',
  }),
  withNewId<TextObject>({
    id: '', type: 'text', x: 8, y: 28, width: 64, height: 24,
    text: 'NEW', fontSize: 18, fontFamily: 'sans-serif',
    fontWeight: 'bold', fill: '#ffffff', textAnchor: 'middle',
    rotation: 0, opacity: 1, visible: true, locked: false, filterId: null, label: 'バッジテキスト',
  }),
]

const PRESET_INNER_GLOW_BOX: CanvasObject[] = [
  withNewId<RectObject>({
    id: '', type: 'rect', x: 0, y: 0, width: 100, height: 60,
    fill: '#0a0a1a', stroke: '#4a9eff', strokeWidth: 1,
    rx: 4, ry: 4, rotation: 0, opacity: 1, visible: true, locked: false,
    filterId: 'filter-inner-glow', label: 'グロウボックス',
  }),
]

// ============================================================
// ビルトインアセットフォルダ定義
// ============================================================

function createBuiltinFolders(): AssetFolder[] {
  return [
    {
      id: 'shapes',
      label: '基本図形',
      open: true,
      items: [
        {
          id: 'builtin-rect',
          label: '矩形',
          description: '矩形（角丸対応）',
          icon: ['far', 'square'] as IconProp,
          type: 'shape',
          objectTemplate: {
            type: 'rect', width: 100, height: 50,
            fill: '#4a9eff', stroke: '#2255aa', strokeWidth: 1, rx: 4, ry: 4, label: '矩形',
          } as Partial<CanvasObject>,
        },
        {
          id: 'builtin-ellipse',
          label: '楕円',
          description: '楕円・円',
          icon: ['far', 'circle'] as IconProp,
          type: 'shape',
          objectTemplate: {
            type: 'ellipse', width: 100, height: 60,
            fill: '#ff9944', stroke: '#cc6600', strokeWidth: 1, label: '楕円',
          } as Partial<CanvasObject>,
        },
        {
          id: 'builtin-text',
          label: 'テキスト',
          description: 'テキストオブジェクト',
          icon: 'font' as IconProp,
          type: 'shape',
          objectTemplate: {
            type: 'text', width: 160, height: 32,
            text: 'テキスト', fontSize: 24, fontFamily: 'sans-serif',
            fontWeight: 'bold', fill: '#ffffff', textAnchor: 'start', label: 'テキスト',
          } as Partial<CanvasObject>,
        },
      ],
    },
    {
      id: 'filters',
      label: 'SVGフィルタ素材',
      open: false,
      items: [
        {
          id: 'filter-bevel-emboss',
          label: 'ベベル&エンボス',
          description: '選択中オブジェクトに立体ボタン風効果を適用',
          icon: 'gem' as IconProp,
          type: 'filter',
          filterId: 'filter-bevel-emboss',
        },
        {
          id: 'filter-drop-shadow',
          label: 'ドロップシャドウ',
          description: '選択中オブジェクトに影効果を適用',
          icon: 'clone' as IconProp,
          type: 'filter',
          filterId: 'filter-drop-shadow',
        },
        {
          id: 'filter-inner-glow',
          label: 'インナーグロウ',
          description: '選択中オブジェクトに内側発光を適用',
          icon: 'circle-dot' as IconProp,
          type: 'filter',
          filterId: 'filter-inner-glow',
        },
        {
          id: 'filter-emboss-button',
          label: 'エンボスボタン',
          description: '選択中オブジェクトに凸型ボタン効果を適用',
          icon: 'stamp' as IconProp,
          type: 'filter',
          filterId: 'filter-emboss-button',
        },
      ],
    },
    {
      id: 'presets',
      label: 'プリセット素材',
      open: false,
      items: [
        {
          id: 'preset-win98-button',
          label: 'Win98 ボタン',
          description: 'クラシックなエンボスボタン（矩形 + テキスト）',
          icon: 'stamp' as IconProp,
          type: 'preset',
          presetChildren: PRESET_WIN98_BUTTON,
        },
        {
          id: 'preset-shadow-box',
          label: 'シャドウボックス',
          description: 'ドロップシャドウ付きダークパネル',
          icon: 'clone' as IconProp,
          type: 'preset',
          presetChildren: PRESET_SHADOW_BOX,
        },
        {
          id: 'preset-bevel-badge',
          label: 'ベベルバッジ',
          description: '立体感のある円バッジ',
          icon: 'certificate' as IconProp,
          type: 'preset',
          presetChildren: PRESET_BEVEL_BADGE,
        },
        {
          id: 'preset-inner-glow-box',
          label: 'グロウボックス',
          description: 'インナーグロウ付きダークボックス',
          icon: 'circle-dot' as IconProp,
          type: 'preset',
          presetChildren: PRESET_INNER_GLOW_BOX,
        },
      ],
    },
    {
      id: 'images',
      label: '画像',
      open: false,
      items: [
        {
          id: 'load-image',
          label: '画像を読み込む…',
          description: 'ローカルファイルから画像を読み込んでキャンバスに追加',
          icon: 'image' as IconProp,
          type: 'image',
        },
      ],
    },
  ]
}

// ============================================================
// localStorage キー
// ============================================================

const LS_KEY = 'vueart-custom-assets'

// ============================================================
// ストア定義
// ============================================================

export const useAssetsStore = defineStore('assets', () => {
  const builtinFolders = ref<AssetFolder[]>(createBuiltinFolders())
  const customAssets = ref<AssetDefinition[]>([])

  // 初期化: localStorage からカスタム素材を読み込む
  function loadFromLocalStorage() {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as AssetDefinition[]
        if (Array.isArray(parsed)) {
          customAssets.value = parsed
        }
      }
    } catch {
      // 読み込み失敗は無視（初回起動など）
    }
  }

  function saveToLocalStorage() {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(customAssets.value))
    } catch {
      // ストレージ容量超過等は無視
    }
  }

  function addCustomAsset(asset: AssetDefinition) {
    customAssets.value.push(asset)
    saveToLocalStorage()
  }

  function removeCustomAsset(id: string) {
    customAssets.value = customAssets.value.filter(a => a.id !== id)
    saveToLocalStorage()
  }

  /** ビルトインフォルダの開閉を切り替える */
  function toggleBuiltinFolder(folderId: string) {
    const folder = builtinFolders.value.find(f => f.id === folderId)
    if (folder) folder.open = !folder.open
  }

  /**
   * アセットをキャンバスに追加する。
   * @param assetId - 追加するアセットID
   * @param docStore - DocumentStore インスタンス
   * @param position - 追加位置（省略時はキャンバス中央付近）
   */
  async function addAssetToCanvas(
    assetId: string,
    docStore: ReturnType<typeof import('./useDocumentStore').useDocumentStore>,
    position?: { x: number; y: number },
  ): Promise<void> {
    const asset = findAsset(assetId)
    if (!asset) return

    const historyStore = useHistoryStore()
    const snap = docStore.getSnapshot()
    if (snap) historyStore.push(snap)

    const doc = docStore.activeDocument
    const cx = position?.x ?? (doc ? doc.width / 2 - 50 : 50)
    const cy = position?.y ?? (doc ? doc.height / 2 - 25 : 50)

    if (asset.type === 'shape' && asset.objectTemplate) {
      const obj = {
        id: generateId(),
        x: cx, y: cy,
        rotation: 0, opacity: 1, visible: true, locked: false, filterId: null, label: '',
        ...asset.objectTemplate,
      } as CanvasObject
      docStore.addObject(obj)

    } else if (asset.type === 'filter' && asset.filterId) {
      // 選択中の全オブジェクトにフィルタを適用
      const ids = [...docStore.activeSelectedIds]
      if (ids.length === 0) return
      for (const id of ids) {
        docStore.updateObject(id, { filterId: asset.filterId })
      }

    } else if (asset.type === 'preset' && asset.presetChildren) {
      // children に新規 ID を付与して GroupObject を生成
      const children = assignNewIds(asset.presetChildren)
      // バウンディングボックス
      const left   = Math.min(...children.map(o => o.x))
      const top    = Math.min(...children.map(o => o.y))
      const right  = Math.max(...children.map(o => o.x + o.width))
      const bottom = Math.max(...children.map(o => o.y + o.height))
      const group: GroupObject = {
        id: generateId(),
        type: 'group',
        x: cx, y: cy,
        width: right - left, height: bottom - top,
        rotation: 0, opacity: 1, visible: true, locked: false,
        filterId: null, label: asset.label,
        children,
      }
      docStore.addObject(group)

    } else if (asset.type === 'image') {
      // 画像ファイルを読み込んで ImageObject として追加
      try {
        const img = await loadImageFile()
        // 最大 400px に収まるようスケール
        const maxSize = 400
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
        const w = Math.round(img.width * scale)
        const h = Math.round(img.height * scale)
        docStore.addObject({
          id: generateId(),
          type: 'image',
          x: cx, y: cy, width: w, height: h,
          href: img.dataUrl,
          preserveAspectRatio: 'xMidYMid meet',
          rotation: 0, opacity: 1, visible: true, locked: false,
          filterId: null, label: img.name,
        })
      } catch {
        // ユーザーキャンセルまたは読み込みエラーは無視
      }
    }
  }

  /** フォルダ内またはカスタム素材から assetId でアセットを検索 */
  function findAsset(id: string): AssetDefinition | undefined {
    for (const folder of builtinFolders.value) {
      const found = folder.items.find(i => i.id === id)
      if (found) return found
    }
    return customAssets.value.find(a => a.id === id)
  }

  /** children テンプレートの全オブジェクトに新規 ID を再帰的に付与 */
  function assignNewIds(list: CanvasObject[]): CanvasObject[] {
    return list.map(obj => {
      const newObj = { ...obj, id: generateId() }
      if (newObj.type === 'group') {
        return { ...newObj, children: assignNewIds((newObj as GroupObject).children) } as GroupObject
      }
      return newObj
    })
  }

  // 起動時に localStorage を読み込む
  loadFromLocalStorage()

  return {
    builtinFolders,
    customAssets,
    toggleBuiltinFolder,
    addCustomAsset,
    removeCustomAsset,
    loadFromLocalStorage,
    saveToLocalStorage,
    findAsset,
    addAssetToCanvas,
  }
})
