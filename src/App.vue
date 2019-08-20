<template>
  <div id="app">
    <transition :name="animateName">
      <router-view></router-view>
    </transition>
  </div>
</template>
<script>
  export default {
    name: "App",
    watch: {
      /*"$route"(val, oldVal) {
        let newIndex = val.meta.index;
        let oldIndex = oldVal.meta.index;
        if(newIndex > oldIndex) {
          this.animateName = "top";
        } else {
          this.animateName = "bottom";
        }
      }*/
    },
    data() {
      return {
        animateName: "top"
      }
    },
    mounted() {
      function checkIE() {
        return (
          "-ms-scroll-limit" in document.documentElement.style &&
          "-ms-ime-align" in document.documentElement.style
        );
      }
      if (checkIE()) {
        window.addEventListener(
          "hashchange",
          () => {
            var currentPath = window.location.hash.slice(1);
            if (this.$route.path !== currentPath) {
              this.$router.push(currentPath);
            }
          },
          false
        );
      }
    }
  }
</script>

<style lang="less">
  .top-enter {
    /*position: absolute;
    left: 0;
    top: 0;*/
    height: 100%;
    width: 100%;
    opacity: 0;
  }
  .top-enter-to {
    position: relative;
  }
  .top-enter-active {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    transition: 0.8s;
  }
  .top-leave {
    height: 100%;
    width: 100%;
    opacity: 1;
  }
  .top-leave-to {
    position: relative;
    opacity: 0;
  }
  .top-leave-active {
    transition: 0.8s;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }



  .bottom-enter {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    transform: translateY(100%);
  }
  .bottom-enter-to {
    position: relative;
    transform: translateY(0);
  }
  .bottom-enter-active {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    transition: 0.8s;
  }
  .bottom-leave {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    transform: translateY(0);
  }
  .bottom-leave-to {
    position: relative;
    transform: translateY(-100%);
  }
  .bottom-leave-active {
    transition: 0.8s;
  }

</style>
