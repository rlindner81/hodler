type TableCell = any;
type TableRow = Array<TableCell>;
type Table = Array<TableRow>;

interface TableOptions {
  sortCol?: number | null,
  noHeader?: boolean
}

const table = (table: Table, {sortCol = 0, noHeader = false}: TableOptions = {}): null | string => {
  if (!table || !table.length || !table[0] || !table[0].length) {
    return null;
  }
  const columnCount = table[0].length;
  const columnWidth = table.reduce((result, row) => {
    row.forEach((cell, index) => {
      if (index < columnCount) {
        result[index] = Math.max(result[index], String(cell).length);
      }
    });
    return result;
  }, new Array(columnCount).fill(0));

  const header = noHeader ? [] : table[0];
  const body = noHeader ? table : table.slice(1);

  sortCol !== null
  && Number.isInteger(sortCol)
  && sortCol < columnCount
  && body.sort((rowA, rowB) => {
    const cellA = rowA[sortCol] ? rowA[sortCol].toUpperCase() : "";
    const cellB = rowB[sortCol] ? rowB[sortCol].toUpperCase() : "";
    return cellA < cellB ? -1 : cellA > cellB ? 1 : 0;
  });

  const sortedTable = noHeader ? table : [header].concat(body);

  return sortedTable
    .map((row) =>
      row
        .slice(0, columnCount)
        .map((cell, columnIndex) => cell + " ".repeat(columnWidth[columnIndex] - String(cell).length))
        .join("  ")
    )
    .join("\n");
};

export default table;
