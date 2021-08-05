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
@use './scss/variables' as var;
@import url("https://fonts.googleapis.com/css?family=Lato");

#app {
  font-family: "Lato", Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: black;
}

#nav {
  padding: 1rem;

  a {
    padding: 0.2rem 1rem;
    font-weight: bold;
    text-decoration: none;
    color: black;
    background-color: var.$accent-1-lightest;

    &:hover, &.router-link-exact-active {
      background-color: white;
    }
  }
}
</style>
