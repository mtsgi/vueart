<template>
  <img
    :src="object.src"
    :alt="object.alt"
    :style="{
      background: object.background,
      width: object.width,
      height: object.height,
      filter: `blur(${object.blur})`
    }"
  />
</template>

<script>
export default {
  name: "ImageObject",
  props: {
    object: Object
  }
};
</script>

<style scoped></style>
