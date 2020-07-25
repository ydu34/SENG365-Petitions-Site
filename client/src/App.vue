<template>
  <div id="app">
    <NavBar :key="$route.fullPath"></NavBar>
    <br>
    <br>
    <router-view></router-view>
  </div>

</template>

<script>
  import NavBar from "./components/NavBar";
  export default {
    name: 'app',
    components: {
      NavBar
    }
  }
</script>

<style>
  .clickable {
    cursor: pointer;
  }

  .container-margin-top {
    margin-top: 50px;
  }

  .right-button {
    float: right;
    margin-left: 10px;
  }

  .avatar {
    object-fit: cover;
    width: 75px;
    height: 75px;
  }

  .avatarSmall {
    object-fit: cover;
    width: 50px;
    height: 50px;
  }

  .avatarBig {
    object-fit: cover;
    width: 200px;
    height:200px;
  }

  .fileinput-filename {
    display: inline-block;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
</style>
