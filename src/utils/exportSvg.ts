/**
 * Export utilities — decoupled from UI components.
 * Converts a live <svg> DOM element to PNG, JPEG, or .svg file download.
 */

function svgToBlob(svgEl: SVGElement): Blob {
  const serializer = new XMLSerializer()
  const svgStr = serializer.serializeToString(svgEl)
  return new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' })
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = globalThis.document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export async function exportAsPng(svgEl: SVGElement, filename = 'export.png'): Promise<void> {
  const blob = svgToBlob(svgEl)
  const url = URL.createObjectURL(blob)
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = globalThis.document.createElement('canvas')
      canvas.width = svgEl.clientWidth || 400
      canvas.height = svgEl.clientHeight || 300
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(url)
      canvas.toBlob(pngBlob => {
        if (!pngBlob) { reject(new Error('Canvas toBlob failed')); return }
        triggerDownload(pngBlob, filename)
        resolve()
      }, 'image/png')
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('SVG load failed')) }
    img.src = url
  })
}

export async function exportAsJpeg(svgEl: SVGElement, filename = 'export.jpg', quality = 0.9): Promise<void> {
  const blob = svgToBlob(svgEl)
  const url = URL.createObjectURL(blob)
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = globalThis.document.createElement('canvas')
      canvas.width = svgEl.clientWidth || 400
      canvas.height = svgEl.clientHeight || 300
      const ctx = canvas.getContext('2d')!
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(url)
      canvas.toBlob(jpgBlob => {
        if (!jpgBlob) { reject(new Error('Canvas toBlob failed')); return }
        triggerDownload(jpgBlob, filename)
        resolve()
      }, 'image/jpeg', quality)
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('SVG load failed')) }
    img.src = url
  })
}

export function exportAsSvg(svgEl: SVGElement, filename = 'export.svg') {
  const blob = svgToBlob(svgEl)
  triggerDownload(blob, filename)
}
