<template>
  <ou-command-bar class="kit-shadow-4">
    <template slot="main">
      <ou-search-box type="commandBar" placeholder="Search" />
      <ou-contextual-menu>
        <ou-command-button icon="Add" type="dropdown">追加</ou-command-button>
        <div slot="list">
          <ou-contextual-menu-item
            @click="onAdd('TextObject')"
            name="テキストオブジェクト"
          />
          <ou-contextual-menu-item name="画像オブジェクト" />
          <ou-contextual-menu-item name="図形オブジェクト" />
        </div>
      </ou-contextual-menu>
      <ou-command-button icon="StackIndicator">レイヤー</ou-command-button>
      <ou-command-button icon="Settings">キャンバス設定</ou-command-button>
    </template>
    <template slot="side">
      <ou-command-button icon="Save" type="noLabel"></ou-command-button>
    </template>
  </ou-command-bar>
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
  methods: {
    onAdd: function(type) {
      this.$emit("add-object", {
        type: type,
        content: "Hello",
        fontSize: "24px",
        position: {
          top: "20px",
          left: "20px"
        }
      });
    }
  }
};
</script>

<style scoped></style>
