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

.profit {
  padding: 0 1rem;

  .list {
    border-collapse: collapse;
    width: 100%;

    td, th {
      border: none;
      padding: 0.5rem;
    }
    td {
      border: solid color("primary");
      border-width: 1px 0;
    }

    tr:nth-child(even) {
      background-color: color("primary", "lighten-4");
    }

    th {
      text-align: left;
      background-color: color("primary");
      color: color("white");
    }
  }
}
</style>

<script>
export default {
  name: "Profit",

  data() {
    return {
      stocks: [
        { ticker: "PTON", price: 30 },
        { ticker: "CCL", price: 12 }
      ]
    };
  },
};
</script>
