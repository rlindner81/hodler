<template>
  <div class="profit">
    <h1>Profit & Loss</h1>
    <table class="list">
      <tr>
        <th>Ticker</th>
        <th>Price</th>
      </tr>
      <tr class="row" v-for="stock in stocks" :key="stock.ticker">
        <td class="cell ticker">{{ stock.ticker }}</td>
        <td class="cell price">{{ stock.price }}</td>
      </tr>
    </table>
  </div>
</template>

<style lang="scss">
@import '../scss/color';
@import '../scss/list';

.profit {
  padding: 0 1rem;

  @include list();
}
</style>

<script>
export default {
  name: "Profit",

  data() {
    return {
      stocks: [
        { ticker: "PTON", price: 30.12,  },
        { ticker: "CCL", price: 12.01 }
      ]
    };
  },
};
</script>
