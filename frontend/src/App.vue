<template>
  <div id="nav">
    <router-link to="/">Overview</router-link>
    |
    <router-link to="/profit">Profit & Loss</router-link>
    |
    <router-link to="/plays">Play Theses</router-link>
    |
    <router-link to="/holdings">Holdings</router-link>
    |
    <router-link to="/about">About</router-link>
  </div>
  <router-view/>
</template>

<style lang="scss">
@import 'scss/color';
@import url("https://fonts.googleapis.com/css?family=Lato");

#app {
  font-family: "Lato", Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: color("black");
}

#nav {
  padding: 1rem;

  a {
    padding: 0.2rem 1rem;
    font-weight: bold;
    text-decoration: none;
    color: color("black");
    background-color: color("primary", "lighten-5");

    &:hover, &.router-link-exact-active {
      background-color: color("white");
    }
  }
}
</style>

