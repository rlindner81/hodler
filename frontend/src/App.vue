<template>
  <div id="nav">
    <router-link to="/">Overview</router-link> |
    <router-link to="/profit">Profit & Loss</router-link> |
    <router-link to="/plays">Play Theses</router-link> |
    <router-link to="/holdings">Holdings</router-link> |
    <router-link to="/about">About</router-link>
  </div>
  <router-view />
</template>

<style lang="scss">
@import url('https://fonts.googleapis.com/css?family=Lato');

#app * {
  font-family: 'Lato', Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  //color: black;
}

#nav {
  /*text-align: right;*/
  padding: 1em 3em;

  a {
    font-weight: bold;
    text-decoration: none;

    .router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
