<template>
  <div
    class="canvas kit-shadow-4"
    :style="canvasStyle"
    @click="openingContext = null"
  >
    <div v-for="(object, key) in savedata.objects" :key="key">
      <div
        class="object-wrapper"
        @click="onSelect(key, object)"
        @click.right.prevent="openContext(key, $event)"
        :style="{
          top: object.position.top,
          left: object.position.left
        }"
      >
        <component :is="object.type" :object="object"></component>
      </div>
    </div>
    <template v-if="openingContext">
      <div class="context-menu" :style="contextPosition">
        <ou-persona
          type="available"
          size="tiny"
          class="m-left"
          :primaryText="savedata.objects[openingContext].type"
        />
        <ou-command-button icon="Copy">オブジェクトを複製</ou-command-button>
        <ou-command-button icon="Delete">オブジェクトを削除</ou-command-button>
      </div>
    </template>
  </div>
</template>

<script>
import TextObject from "./objects/TextObject.vue";

export default {
  name: "CanvasArea",
  components: {
    TextObject
  },
  computed: {
    canvasStyle: function() {
      return {
        width: this.savedata.settings.size.width,
        height: this.savedata.settings.size.height,
        background: this.savedata.settings.background
      };
    }
  },
  data: function() {
    return {
      openingContext: null,
      contextPosition: {}
    };
  },
  props: {
    savedata: {
      type: Object,
      required: true
    }
  },
  methods: {
    onSelect: function(objectId, objectData) {
      this.$emit("select-object", objectId, objectData);
    },
    openContext: function(id, event) {
      this.openingContext = id;
      this.contextPosition = {
        left: `${event.pageX}px`,
        top: `${event.pageY}px`
      };
    }
  }
};
</script>

<style scoped>
.canvas {
  position: relative;
  margin: 20px;
}
.object-wrapper {
  position: absolute;
}
.object-wrapper:hover {
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.5), 0 0 4px 0 rgba(255, 255, 255, 0.75);
}
button {
}
.context-menu {
  position: fixed;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.5);
}
.context-menu .ms-CommandButton + .ms-CommandButton {
  margin: 0;
}
</style>
