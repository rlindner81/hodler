<template>
  <div class="profit">
    <h1>Profit & Loss</h1>
    <div class="list">
      <div v-for="stock in stocks" :key="stock.ticker">
        <span class="ticker">{{stock.ticker}}</span><span class="price">{{stock.price}}</span><span class="currency">{{stock.currency}}</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.list > {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;

  //> .game {
  //  .flexRow();
  //
  //  width: 100%;
  //  flex-wrap: wrap;
  //  border-bottom: 3px solid @color-background;
  //
  //  > .league > span {
  //    .mp(15px, 5px);
  //    .size(35px, 35px);
  //    .background();
  //
  //    line-height: 25px;
  //    border-radius: 50%;
  //    display: block;
  //    box-sizing: border-box;
  //    font-size: 0.7rem;
  //    text-transform: lowercase;
  //  }
  //
  //  > .players {
  //    .flexRow();
  //
  //    justify-content: space-around;
  //    flex-grow: 1;
  //    margin: 0;
  //    padding: 15px 0;
  //    width: 100%;
  //
  //    > .team {
  //      .flexCenter();
  //      width: 40%;
  //      flex-shrink: 0;
  //    }
  //  }
  //
  //  > .other {
  //    .backgroundSecondary();
  //
  //    width: 100%;
  //    padding: 5px 15px;
  //
  //    .flexRow();
  //    > .info {
  //      padding: 5px;
  //      font-size: 0.7rem;
  //
  //      > i {
  //        margin-right: 10px;
  //      }
  //    }
  //  }
  //}
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
