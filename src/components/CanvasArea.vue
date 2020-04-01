<template>
  <div class="canvas kit-shadow-4" :style="canvasStyle">
    <div v-for="(object, key) in savedata.objects" :key="key">
      <div
        class="object-wrapper"
        @click="onSelect(key, object)"
        :style="{
          top: object.position.top,
          left: object.position.left
        }"
      >
        <component :is="object.type" :object="object"></component>
      </div>
    </div>
  </div>
</template>

<script>
import TextObject from "./objects/TextObject.vue";

export default {
  name: "CanvasArea",
  components: {
    TextObject
  },
  data: function() {
    return {
      canvasStyle: {
        width: this.savedata.settings.size.width,
        height: this.savedata.settings.size.height,
        background: this.savedata.settings.background
      }
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
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.25);
}
</style>
