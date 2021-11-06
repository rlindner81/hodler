type TableCell = string | number | boolean;
type TableRow = Array<TableCell>;
type Table = Array<TableRow>;

interface TableOptions {
  sortCol?: number | null;
  sortDesc?: boolean;
  noHeader?: boolean;
  columnAlign?: string;
  columnType?: Array<string | null>;
}

const table = (
  table: Table,
  {sortCol = 0, sortDesc = false, noHeader = false, columnAlign = "", columnType = []}: TableOptions = {},
): null | string => {
  if (!table || !table.length || !table[0] || !table[0].length) {
    return null;
  }
  const columnCount = table[0].length;

  const header = noHeader ? [] : table[0];
  const body = noHeader ? table : table.slice(1);

  sortCol !== null &&
  Number.isInteger(sortCol) &&
  sortCol < columnCount &&
  body.sort((rowA, rowB) => {
    const cellA = rowA[sortCol] ? String(rowA[sortCol]).toUpperCase() : "";
    const cellB = rowB[sortCol] ? String(rowB[sortCol]).toUpperCase() : "";
    return sortDesc
      ? cellA < cellB ? 1 : cellA > cellB ? -1 : 0
      : cellA < cellB ? -1 : cellA > cellB ? 1 : 0;
  });

  body.forEach((row, rowIndex) =>
    row.forEach((cell, columnIndex) => {
      if (columnType.length > columnIndex && columnType[columnIndex] === "TO_FIXED_TWO") {
        body[rowIndex][columnIndex] = Number(cell).toFixed(2);
      }
    })
  );

  const sortedTable = noHeader ? table : [header].concat(body);

  const columnWidth = sortedTable.reduce((result, row) => {
    row.forEach((cell, index) => {
      if (index < columnCount) {
        result[index] = Math.max(result[index], String(cell).length);
      }
    });
    return result;
  }, new Array(columnCount).fill(0));


  return sortedTable
    .map((row, rowIndex) =>
      row
        .slice(0, columnCount)
        .map((cell, columnIndex) =>
          (noHeader || rowIndex > 0) &&
          columnAlign.length > columnIndex &&
          columnAlign[columnIndex] === "r"
            ? " ".repeat(columnWidth[columnIndex] - String(cell).length) + cell
            : cell + " ".repeat(columnWidth[columnIndex] - String(cell).length)
        )
        .join("  ")
    )
    .join("\n");
};

export default table;
