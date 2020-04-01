<template>
  <div class="prop-window kit-shadow-4" v-if="selectedId">
    <h3>{{ selectedObject.type }}</h3>
    <div class="kit-sub">{{ selectedId }}</div>
    <div class="kit-flex">
      <p class="kit-flex-grow m-r">top</p>
      <ou-text-field v-model="updatedData.position.top" placeholder="Top" />
    </div>
    <div class="kit-flex">
      <p class="kit-flex-grow m-r">left</p>
      <ou-text-field v-model="updatedData.position.left" placeholder="Left" />
    </div>
    <ou-button type="primary" @click="onDelete">Delete Object</ou-button>
    <div v-for="propName in propTypes[selectedObject.type]" :key="propName">
      <div class="kit-flex">
        <p class="kit-flex-grow m-r">{{ propName }}</p>
        <ou-text-field
          v-model="updatedData[propName]"
          :placeholder="propName"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "PropertyWindow",
  data: function() {
    return {
      updatedData: {
        position: {}
      },
      propTypes: {
        TextObject: [
          "content",
          "color",
          "fontSize",
          "fontWeight",
          "textShadow",
          "fontFamily"
        ]
      }
    };
  },
  props: {
    selectedObject: {
      type: Object,
      required: true
    },
    selectedId: String
  },
  watch: {
    selectedId: function() {
      this.updatedData = this.selectedObject;
    },
    updatedData: function(newData) {
      this.$emit("update-object", newData);
    }
  },
  methods: {
    onDelete: function() {
      this.$emit("delete-object");
    },
    onClear: function() {
      this.$emit("clear");
    }
  }
};
</script>

<style scoped>
.prop-window {
  background: #ffffff;
  padding: 10px;
  position: fixed;
  bottom: 20px;
  right: 20px;
}
</style>
