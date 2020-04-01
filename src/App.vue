<template>
  <div id="app">
    <tool-box :savedata="savedata" @add-object="addObject" />
    <canvas-area :savedata="savedata" @select-object="selectObject" />
    <property-window
      :selected-object="selectedObject"
      :selected-id="selectedId"
      @update-object="updateObject"
      @delete-object="deleteObject"
      @clear="clear"
    ></property-window>
  </div>
</template>

<script>
import CanvasArea from "./components/CanvasArea.vue";
import ToolBox from "./components/ToolBox.vue";
import PropertyWindow from "./components/PropertyWindow.vue";
import { uuid } from "vue-uuid";
import "office-ui-fabric-vue/dist/index.css";
import "kitstrap/d/kitstrap.css";

export default {
  name: "App",
  components: {
    CanvasArea,
    ToolBox,
    PropertyWindow
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
          background: "#ffffff"
        }
      },
      selectedId: "",
      selectedObject: {}
    };
  },
  methods: {
    addObject: function(objectData) {
      this.$set(this.savedata.objects, uuid.v4(), objectData);
    },
    selectObject: function(objectId, objectData) {
      this.selectedId = objectId;
      this.selectedObject = objectData;
    },
    updateObject: function(newData) {
      this.savedata.objects[this.selectedId] = newData;
    },
    deleteObject: function() {
      this.$delete(this.savedata.objects, this.selectedId);
      this.selectedId = null;
    },
    clear: function() {
      this.selectedId = null;
    }
  }
};
</script>

<style>
body {
  background: #f0f0f0;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
