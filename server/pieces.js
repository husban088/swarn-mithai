// Milk Cake, Habshi Halwa aur Gajar Halwa par "16 pcs / 16 pieces" nahi dikhana.
// Baqi mithai products ka "Box (16 pcs)" jaisa hai waisa hi rehta hai.
const NO_PIECES = /(milk\s*cake|habshi\s*halwa|gajar(\s*ka)?\s*halwa)/i;

const stripPieces = (productName, text) => {
  const s = String(text ?? "");
  if (!s || !NO_PIECES.test(String(productName || ""))) return s;
  return s
    .replace(/\s*\(\s*16\s*(pcs?|pieces?)\s*\)/gi, "")
    .replace(/\s*[·•|,\-–—]?\s*16\s*(pcs?|pieces?)\b/gi, "")
    .replace(/[\s·•|,\-–—]+$/g, "")
    .trim();
};

module.exports = { stripPieces };
