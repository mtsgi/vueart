# Copilot カスタム命令

## プロジェクト概要
Vue Art Designer — Vue 3 + TypeScript + Pinia による MDI型 SVGベクター画像エディタ。

## 技術制約
- **Vue 3**: Composition API + `<script setup>` のみ（Options API 禁止）
- **TypeScript `erasableSyntaxOnly: true`**: `enum` 禁止 → 文字列リテラルユニオンを使用
- **状態管理**: Pinia の Composition スタイル（`defineStore('id', () => {...})`）
- **スタイル**: SCSS、CSS カスタムプロパティでテーマを定義済み（`var(--accent)` 等）
- **パスエイリアス**: `@/` → `src/`

## アーキテクチャ
- **マルチキャンバス**: `useDocumentStore` は `Map<canvasId, CanvasDocument>` で管理
- **MDI**: `useUiStore` の `WindowState[]` でフローティングウィンドウを管理
- **SVG描画**: `<template>` 内の `<svg>` バインディングのみ（Canvas API 使用禁止）

## コーディング規則
- ソースコード・コメントは**日本語**で記述
- `toRaw()` を介さずに `structuredClone` で Vue Proxy を直接クローンしない
- 型名は英語（`CanvasDocument`, `ToolType` 等）のまま維持
