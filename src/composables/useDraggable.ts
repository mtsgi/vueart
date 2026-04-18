import { ref, onUnmounted } from 'vue'

export interface DragState {
  dragging: boolean
  startX: number
  startY: number
  origX: number
  origY: number
}

export function useDraggable(
  onMove: (x: number, y: number) => void,
  onStart?: () => void
) {
  const dragging = ref(false)
  let startMouseX = 0
  let startMouseY = 0
  let origX = 0
  let origY = 0

  function startDrag(e: MouseEvent, currentX: number, currentY: number) {
    if (e.button !== 0) return
    dragging.value = true
    startMouseX = e.clientX
    startMouseY = e.clientY
    origX = currentX
    origY = currentY
    onStart?.()
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', stopDrag)
  }

  function onMouseMove(e: MouseEvent) {
    if (!dragging.value) return
    const dx = e.clientX - startMouseX
    const dy = e.clientY - startMouseY
    onMove(origX + dx, origY + dy)
  }

  function stopDrag() {
    dragging.value = false
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', stopDrag)
  }

  onUnmounted(() => {
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', stopDrag)
  })

  return { dragging, startDrag }
}
