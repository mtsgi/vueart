<script setup lang="ts">
/**
 * AppMenuBar — アプリケーションのメニューバー
 * 「ファイル」「編集」「表示」「挿入」「ウィンドウ」「ヘルプ」の各メニュー項目を表示する。
 */
import { useUiStore } from '@/stores/useUiStore'
import { useDocumentStore } from '@/stores/useDocumentStore'
import { useHistory } from '@/composables/useHistory'
import { useClipboard } from '@/composables/useClipboard'
import { saveAsVad, loadVadFile } from '@/utils/fileIo'
import AboutDialog from '@/components/dialogs/AboutDialog.vue'

const uiStore = useUiStore()
const docStore = useDocumentStore()
const { commit } = useHistory()
// Ctrl+C/V のキーボードショートカットはここで1箇所のみ登録する
const { copySelected, pasteClipboard } = useClipboard({ registerShortcuts: true })

/** 新規キャンバスを作成してMDIに追加 */
function onNewCanvas() {
  const canvasId = uiStore.addCanvas('新規キャンバス')
  docStore.getOrCreateDocument(canvasId, '新規キャンバス')
  docStore.setActiveCanvas(canvasId)
}

/** .vad ファイルを開いて新規キャンバスとして読み込む */
function onOpenFile() {
  loadVadFile().then(doc => {
    const canvasId = uiStore.addCanvas(doc.name)
    docStore.getOrCreateDocument(canvasId, doc.name)
    docStore.setActiveCanvas(canvasId)
    docStore.restoreSnapshot(doc)
  }).catch(err => {
    // ファイルエラーのみコンソールに出力（キャンセルは無視）
    if (err instanceof Error) console.error('[fileIo]', err.message)
  })
}

/** アクティブドキュメントを .vad ファイルとして保存 */
function onSaveFile() {
  const doc = docStore.getSnapshot()
  if (!doc) return
  saveAsVad(doc)
}

// メニュー項目の定義
const menuItems = [
  {
    label: 'ファイル',
    items: [
      { label: '新規作成(N)', action: onNewCanvas },
      { label: '開く(O)…', action: onOpenFile },
      null,
      { label: '上書き保存(S)', action: onSaveFile },
      { label: '名前を付けて保存(A)…', action: onSaveFile },
    ],
  },
  {
    label: '編集',
    items: [
      { label: '元に戻す(Z)  Ctrl+Z', action: () => {} },
      { label: 'やり直し(Y)  Ctrl+Y', action: () => {} },
      null,
      { label: 'コピー(C)  Ctrl+C', action: copySelected },
      { label: '貼り付け(V)  Ctrl+V', action: pasteClipboard },
      { label: '削除(D)', action: () => {
        commit() // 削除前にスナップショットを履歴に積む
        Array.from(docStore.activeSelectedIds).forEach((id: string) => docStore.removeObject(id))
      }},
    ],
  },
  {
    label: '表示',
    items: [
      { label: 'ツールバー', action: () => {} },
    ],
  },
  {
    label: '挿入',
    items: [
      { label: '矩形(R)', action: () => { uiStore.setTool('rect') } },
      { label: '楕円(E)', action: () => { uiStore.setTool('ellipse') } },
      { label: 'テキスト(T)', action: () => { uiStore.setTool('text') } },
    ],
  },
  {
    label: 'ウィンドウ',
    items: [
      { label: '新規キャンバス(N)', action: onNewCanvas },
    ],
  },
  {
    label: 'ヘルプ',
    items: [
      { label: 'Vue Art Designer について', action: () => { showAbout.value = true } },
    ],
  },
]

// ドロップダウン表示制御
import { ref } from 'vue'
const openMenu = ref<string | null>(null)
// Aboutダイアログ表示状態
const showAbout = ref(false)

function toggleMenu(label: string) {
  openMenu.value = openMenu.value === label ? null : label
}
function closeAll() {
  openMenu.value = null
}
function execAndClose(action: () => void) {
  action()
  closeAll()
}
</script>

<template>
  <div class="menubar" @mouseleave="closeAll">
    <!-- アプリロゴ -->
    <span class="menubar__logo">Vue Art Designer</span>

    <!-- メニュー項目 -->
    <div
      v-for="menu in menuItems"
      :key="menu.label"
      class="menubar__item"
      :class="{ open: openMenu === menu.label }"
    >
      <button class="menubar__trigger" @click="toggleMenu(menu.label)">
        {{ menu.label }}
      </button>
      <div v-if="openMenu === menu.label" class="dropdown">
        <template v-for="(item, i) in menu.items" :key="i">
          <div v-if="item === null" class="dropdown__sep" />
          <button v-else class="dropdown__item" @click="execAndClose(item.action)">
            {{ item.label }}
          </button>
        </template>
      </div>
    </div>
  </div>

  <!-- 「Vue Art Designer について」ダイアログ -->
  <AboutDialog v-if="showAbout" @close="showAbout = false" />
</template>

<style lang="scss" scoped>
.menubar {
  display: flex;
  align-items: center;
  height: 22px;
  background: var(--panel-bg);
  border-bottom: 1px solid var(--win-border-dark);
  padding: 0 4px;
  gap: 2px;
  flex-shrink: 0;
  position: relative;
  z-index: 9000; // ドロップダウンが最前面に来るように

  &__logo {
    font-size: 11px;
    font-weight: bold;
    color: var(--accent);
    padding: 0 8px 0 4px;
    border-right: 1px solid var(--win-border-dark);
    margin-right: 4px;
    letter-spacing: 0.3px;
  }

  &__item {
    position: relative;

    &.open > .menubar__trigger {
      background: var(--win-titlebar-active);
      color: #fff;
    }
  }

  &__trigger {
    height: 18px;
    padding: 0 8px;
    font-size: 11px;
    background: transparent;
    color: var(--text-primary);
    border: none;
    cursor: default;

    &:hover {
      background: var(--win-titlebar-active);
      color: #fff;
    }
  }
}

.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 180px;
  background: var(--panel-bg);
  border-top: 2px solid var(--win-border-light);
  border-left: 2px solid var(--win-border-light);
  border-right: 2px solid var(--win-border-dark);
  border-bottom: 2px solid var(--win-border-dark);
  z-index: 9999;
  box-shadow: 2px 2px 6px rgba(0,0,0,0.6);

  &__item {
    display: block;
    width: 100%;
    padding: 3px 20px 3px 16px;
    font-size: 11px;
    text-align: left;
    background: transparent;
    color: var(--text-primary);
    border: none;
    cursor: default;
    white-space: nowrap;

    &:hover {
      background: var(--win-titlebar-active);
      color: #fff;
    }
  }

  &__sep {
    height: 1px;
    background: var(--win-border-dark);
    margin: 2px 4px;
  }
}
</style>
