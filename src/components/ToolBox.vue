<template>
  <div class="toolbox">
    <button @click="onAdd('TextObject')">Add TextObject</button>
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
  methods: {
    onAdd: function(type) {
      this.$emit("add-object", {
        type: type,
        content: "Hello"
      });
    }
  }
};
</script>

<style scoped></style>
