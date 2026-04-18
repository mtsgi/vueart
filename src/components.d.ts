// Font Awesome グローバルコンポーネントの型宣言
import type { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

declare module 'vue' {
  export interface GlobalComponents {
    FontAwesomeIcon: typeof FontAwesomeIcon
  }
}
