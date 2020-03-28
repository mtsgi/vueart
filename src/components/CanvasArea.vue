<template>
  <div class="canvas" :style="canvasStyle">
    <div v-for="(object, key) in savedata.objects" :key="key">
      ({{ key }})
      <component :is="object.type" :object="object"></component>
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
        height: this.savedata.settings.size.height
      }
    };
  },
  props: {
    savedata: {
      type: Object,
      required: true
    }
  }
};
</script>

<style scoped>
.canvas {
  box-shadow: 2px 2px 5px 0 rgba(0, 0, 0, 0.25);
}
</style>
