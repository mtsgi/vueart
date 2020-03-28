<template>
  <div id="app">
    <canvas-area :savedata="savedata" />
    <tool-box :savedata="savedata" @add-object="addObject" />
  </div>
</template>

<script>
import CanvasArea from "./components/CanvasArea.vue";
import ToolBox from "./components/ToolBox.vue";
import { uuid } from "vue-uuid";

export default {
  name: "App",
  components: {
    CanvasArea,
    ToolBox
  },
  data: function() {
    return {
      savedata: {
        objects: {},
        settings: {
          size: {
            width: "600px",
            height: "400px"
          },
          backgound: "transparent"
        }
      }
    };
  },
  methods: {
    addObject: function(objectData) {
      console.log(this.savedata.objects);
      this.$set(this.savedata.objects, uuid.v4(), objectData);
    }
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
