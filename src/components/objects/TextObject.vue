<template>
  <span
    class="text-object"
    :style="{
      color: object.color,
      fontSize: object.fontSize
    }"
    >{{ object.content }}</span
  >
</template>

<script>
export default {
  name: "TextObject",
  props: {
    object: Object
  }
};
</script>

<style scoped>
.text-object {
}
</style>
