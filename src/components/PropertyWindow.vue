<template>
  <div class="prop-window kit-shadow-4" v-if="selectedId">
    <i class="kit-right ms-Icon ms-Icon--ChromeClose" @click="onClear"></i>
    <h3>{{ selectedObject.type }}</h3>
    <div class="kit-sub">{{ selectedId }}</div>
    <div class="kit-flex">
      <i class="ms-Icon"></i>
      <p class="kit-flex-grow m-0 m-r">X座標</p>
      <ou-text-field v-model="updatedData.position.left" placeholder="Left" />
    </div>
    <div class="kit-flex">
      <i class="ms-Icon"></i>
      <p class="kit-flex-grow m-0 m-r">Y座標</p>
      <ou-text-field v-model="updatedData.position.top" placeholder="Top" />
    </div>
    <div class="kit-flex">
      <i class="ms-Icon"></i>
      <p class="kit-flex-grow m-0 m-r">回転</p>
      <ou-text-field v-model="updatedData.rotation" placeholder="Top" />
    </div>
    <div class="kit-flex">
      <i class="ms-Icon"></i>
      <p class="kit-flex-grow m-0 m-r">階層</p>
      <ou-text-field
        :value="String(updatedData.zIndex)"
        disabled
        placeholder="Left"
      />
    </div>
    <div class="kit-flex">
      <ou-command-button icon="ChevronUp">前</ou-command-button>
      <ou-command-button icon="ChevronDown">背</ou-command-button>
      <ou-command-button icon="DoubleChevronUp">最前</ou-command-button>
      <ou-command-button icon="DoubleChevronDown">最背</ou-command-button>
    </div>
    <div
      v-for="(prop, propName) in propTypes[selectedObject.type]"
      :key="propName"
    >
      <div class="kit-flex">
        <i class="ms-Icon">{{ prop.icon }}</i>
        <p class="kit-flex-grow m-0 m-r">{{ prop.label }}</p>
        <ou-text-field
          v-model="updatedData[propName]"
          :placeholder="propName"
        />
      </div>
    </div>
    <ou-button type="primary" @click="onDelete" class="m-t"
      >オブジェクトを削除</ou-button
    >
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
        TextObject: {
          content: {
            icon: "",
            label: "テキスト"
          },
          color: {
            icon: "",
            label: "文字色"
          },
          fontSize: {
            icon: "",
            label: "サイズ"
          },
          fontWeight: {
            icon: "",
            label: "太さ"
          },
          textShadow: {
            icon: "",
            label: "文字影"
          },
          fontFamily: {
            icon: "",
            label: "書体"
          }
        },
        ImageObject: {
          src: {
            icon: "",
            label: "画像パス"
          },
          width: {
            icon: "",
            label: "幅"
          },
          height: {
            icon: "",
            label: "高さ"
          },
          alt: {
            icon: "",
            label: "説明"
          },
          background: {
            icon: "",
            label: "背景"
          },
          blur: {
            icon: "",
            label: "ぼかし"
          }
        }
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
.prop-window .kit-flex {
  align-items: center;
  justify-content: space-between;
}
.prop-window .ms-TextField {
  margin: 0;
}
</style>
