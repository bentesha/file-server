const sharp = require("sharp");
const assert = require("assert");

const SIZES = {
  xs: 90,
  s: 140,
  m: 260,
  l: 500,
  xl: 900,
  avatar: 180
};

/**
 *
 * @param String fileName File name without path
 * @param String size  File size. Possible values are s, xs, m, l, xl
 * @returns String The name of the resized file
 */
exports.getResizedFileName = (fileName, size) => {
  //All resized images are in a JPEG format
  //As such, all resized files are appended to a .jpg extension
  assert.ok(
    typeof fileName === "string",
    "fileName must be a valid file name without path"
  );
  return SIZES[size] ? `${fileName}__${size}.jpg` : null;
};

/**
 * Risize image file to a given size
 * @param String inputPath Full path of the image file to resize
 * @param String size File size. Possible values are xs, s, m, l, xl
 * @param String outputPath Full path of the resized image file
 * @returns Promise
 */
exports.resizeImage = (inputPath, outputPath, size) => {
  assert(Object.keys(SIZES).includes(size), "File size must be a valid size");
  assert.ok(
    typeof inputPath === "string",
    "imagePath must be a valid string value"
  );
  assert.ok(
    typeof outputPath === "string",
    "resizedImagePath must be a valid string value"
  );

  return sharp(inputPath)
    .resize(SIZES[size], size === "avatar" ? SIZES[size] : null)
    [size === "avatar" ? "crop" : "max"]()
    .jpeg()
    .toFile(outputPath);
};
