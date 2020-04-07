<template>
  <div
    class="box-object"
    :style="{
      background: object.color,
      width: object.width,
      height: object.height,
      borderRadius: object.radius,
      border: `${object.borderWidth} solid ${object.borderColor}`
    }"
  ></div>
</template>

<script>
export default {
  name: "BoxObject",
  props: {
    object: Object
  }
};
</script>

<style scoped>
.box-object {
  box-sizing: border-box;
}
</style>
