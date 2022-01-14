import { defineStore } from 'pinia';

export interface CanvasData {
  width: number;
  height: number;
  background: string;
  objects: CanvasObject[];
}

export interface CanvasObject {
  type: 'text' | 'box' | 'image';
}

export const useCanvasStore = defineStore('canvas', {
  state: (): CanvasData => {
    return {
      width: 720,
      height: 480,
      background: '#ffffff',
      objects: []
    };
  },
  getters: {
    getCanvasData: (state): CanvasData => state
  }
});
