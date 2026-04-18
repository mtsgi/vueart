import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.scss'
import App from './App.vue'

// Font Awesome アイコンライブラリの設定
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faFile, faFolderOpen, faFloppyDisk,
  faRotateLeft, faRotateRight,
  faScissors, faCopy, faPaste,
  faArrowPointer, faFont,
  faChevronDown, faChevronRight,
  faGripLines,
  faEye, faEyeSlash,
  faLock, faLockOpen,
  faCheck, faMinus, faXmark,
  faGem, faClone, faCircleDot, faStamp, faImage,
  faObjectGroup, faObjectUngroup,
  faPlus, faBookmark, faCertificate,
} from '@fortawesome/free-solid-svg-icons'
import { faSquare, faCircle } from '@fortawesome/free-regular-svg-icons'

// 使用するアイコンをライブラリに登録（ツリーシェイク対応）
library.add(
  faFile, faFolderOpen, faFloppyDisk,
  faRotateLeft, faRotateRight,
  faScissors, faCopy, faPaste,
  faArrowPointer, faFont,
  faChevronDown, faChevronRight,
  faGripLines,
  faEye, faEyeSlash,
  faLock, faLockOpen,
  faCheck, faMinus, faXmark,
  faGem, faClone, faCircleDot, faStamp, faImage,
  faObjectGroup, faObjectUngroup,
  faPlus, faBookmark, faCertificate,
  faSquare, faCircle,
)

const app = createApp(App)
app.use(createPinia())
// FontAwesomeIcon をグローバルコンポーネントとして登録
app.component('FontAwesomeIcon', FontAwesomeIcon)
app.mount('#app')
