/**
 * Returns the code of the given character
 * @param {string} data
 * @returns {Code}
 */
function getCode(data) {
  const char = data.normalize();
  return char.length === 1 && char.charCodeAt(0);
}

export default getCode;
