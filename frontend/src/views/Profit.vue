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
        <td class="cell price">{{ stock.price }}{{ stock.currency }}</td>
      </tr>
    </table>
  </div>
</template>

<style lang="scss">
.profit {
  padding: 0 1rem;

  .list {
    border-collapse: collapse;
    width: 100%;

    td, th {
      border: 1px solid #ddd;
      padding: 0.5rem;
    }

    tr:nth-child(even){background-color: #f2f2f2;}

    tr:hover {background-color: #ddd;}

    th {
      text-align: left;
      background-color: #04AA6D;
      color: white;
    }

    //display: flex;
    //flex-direction: column;
    //justify-content: stretch
    //;

    //> .row {
    //  padding: 0.5rem 0;
    //  min-height: 1.5rem;
    //  background-color: red;
    //
    //  > .cell {
    //    padding: 0.5rem;
    //    background-color: green;
    //  }
    //}

    //.row .cell {
    //  padding: 0.5rem;
    //  box-sizing: border-box;
    //}

    //> .row {
    //  display: flex;
    //  min-height: 1rem;
    //
    //  &:first-child .cell {
    //    display: flex;
    //    justify-content: center; /*  center horiz. */
    //    align-items: stretch; /*  center vert. */
    //  }
    //
    //  > .cell {
    //    //flex: 4;
    //    border: 1px solid red;
    //
    //    &:nth-child(1) {
    //      //flex: 1;
    //    }
    //
    //    &:nth-child(2) {
    //      //flex: 2;
    //    }
    //
    //    &.span4-5 {
    //      //flex: 8 24px; /*  col 4,5 flex-grow/border/padding  */
    //    }
    //
    //    &.span3-4 {
    //      //flex: 8 24px; /*  col 3,4 flex-grow/border/padding  */
    //    }
    //
    //    &.span3-5 {
    //      //flex: 12 36px; /*  col 3,4,5 flex-grow/border/padding  */
    //    }
    //  }
    //}
  }
}
</style>

<script>
export default {
  name: "Profit",

  data() {
    return {
      stocks: [
        { ticker: "PTON", price: 30, currency: "$" },
        { ticker: "CCL", price: 12, currency: "$" }
      ]
    };
  },
};
</script>
