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
@use './../scss/variables' as var;

.profit {
  padding: 0 1rem;

  .list {
    border-collapse: collapse;
    width: 100%;

    td, th {
      border: 1px solid #ddd;
      padding: 0.5rem;
    }

    tr:nth-child(even) {
      background-color: #f2f2f2;
    }

    tr:hover {
      background-color: #ddd;
    }

    th {
      text-align: left;
      background-color: var.$accent-1;
      color: white;
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
