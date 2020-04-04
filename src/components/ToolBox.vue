<template>
  <div>
    <ou-command-bar class="kit-shadow-4">
      <template slot="main">
        <ou-contextual-menu>
          <ou-command-button icon="Document" type="dropdown">{{
            savedata.settings.title
          }}</ou-command-button>
          <div slot="list">
            <ou-contextual-menu-item name="タイトルを変更" />
          </div>
        </ou-contextual-menu>
        <ou-search-box type="commandBar" placeholder="Search" />
        <ou-contextual-menu>
          <ou-command-button icon="Add" type="dropdown">追加</ou-command-button>
          <div slot="list">
            <ou-contextual-menu-item
              @click="onAdd('TextObject')"
              icon="InsertTextBox"
              name="テキストオブジェクト"
            />
            <ou-contextual-menu-item
              @click="onAdd('ImageObject')"
              name="画像オブジェクト"
            />
            <ou-contextual-menu-item name="図形オブジェクト" />
          </div>
        </ou-contextual-menu>
        <ou-command-button icon="StackIndicator">レイヤー</ou-command-button>
        <ou-command-button icon="Settings" @click="canvasSettingModal = true"
          >キャンバス設定</ou-command-button
        >
      </template>
      <template slot="side">
        <ou-command-button icon="Save" type="noLabel"></ou-command-button>
      </template>
    </ou-command-bar>
    <ou-dialog type="close" title="キャンバス設定" v-model="canvasSettingModal">
      <div class="kit-flex">
        <p class="kit-flex-grow m-r">タイトル</p>
        <ou-text-field v-model="savedata.settings.title" />
      </div>
      <div class="kit-flex">
        <p class="kit-flex-grow m-r">背景色</p>
        <ou-text-field v-model="savedata.settings.background" />
      </div>
      <div class="kit-flex">
        <p class="kit-flex-grow m-r">高さ</p>
        <ou-text-field v-model="savedata.settings.size.height" />
      </div>
      <div class="kit-flex">
        <p class="kit-flex-grow m-r">横幅</p>
        <ou-text-field v-model="savedata.settings.size.width" />
      </div>
      <div slot="actions">
        <ou-button type="primary" @click="canvasSettingModal = false"
          >閉じる</ou-button
        >
      </div>
    </ou-dialog>
  </div>
</template>

<script>
export default {
  name: "ToolBox",
  props: {
    savedata: {
      type: Object,
      required: true
    }
  },
  data: function() {
    return {
      canvasSettingModal: false,
      defaultProps: {
        TextObject: {
          type: "TextObject",
          content: "Hello",
          color: "#000000",
          fontSize: "24px",
          fontWeight: "400",
          textShadow: "none",
          fontFamily: "sans-serif"
        },
        ImageObject: {
          type: "ImageObject",
          src: "/img/icons/favicon-32x32.png",
          width: "auto",
          height: "auto",
          background: "transparent",
          alt: "",
          blur: "0px"
        }
      }
    };
  },
  methods: {
    onAdd: function(type) {
      this.$emit("add-object", this.defaultProps[type]);
    }
  }
};
</script>

<style scoped></style>
