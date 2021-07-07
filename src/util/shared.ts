/**
 * Returns the element of a nested array or object if possible, otherwise null.
 *
 * Usage: getByKeys(array, 1, 2, 3) === array[1][2][3] || null      (without access exceptions)
 *        getByKeys(object, "a", "b") === object["a"]["b"] || null  (without access exceptions)
 */

const getByKeys = (
  node: Record<string, unknown> | Array<unknown>,
  ...keys: Array<string | number>
) => {
  if (keys.length < 1) {
    return null;
  }
  try {
    for (let i = 0; i < keys.length; i++) {
      node = node[keys[i]];
    }
    return node === undefined ? null : node;
  } catch (err) {
    return null;
  }
};
export { getByKeys };
