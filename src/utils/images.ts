import fs from 'fs/promises'
import { join } from 'path';
import { CONSTANTS } from '../constnats';
import sharp from 'sharp';
export async function getAllImages() {
  const images = await fs.readdir("public/");
  return images;
}

export async function getImage(id: string, options?: { cropped?: boolean, resized?: boolean }) {
  const dataPath = join(CONSTANTS.UPLOADS, id);
  await fs.access(dataPath, fs.constants.R_OK);
  let optionsName = options?.cropped ? "cropped-" : "";
  optionsName = options?.resized ? "resized-" : "";
  const newDataPath = join(CONSTANTS.UPLOADS, optionsName + id);
  return newDataPath;
}



export async function applyFilters(imagePath: string, filters: { watermark?: boolean, blur?: boolean, grayscale?: boolean, blurRadius?: string, top?: string, left?: string, watermarkPath?: string }) {
  let intermediateImage: sharp.Sharp = await sharp(imagePath);

  if (filters.grayscale) {
    intermediateImage = intermediateImage.grayscale()
  }
  if (filters.blur) {
    if (!filters.blurRadius) throw new Error("blurRadius Must be Provided")
    intermediateImage = intermediateImage.blur(parseFloat(filters.blurRadius))
  }
  if (filters.watermark) {
    if (!filters.watermarkPath) throw new Error("watermark Image must be provided.")
    const { width, height } = await intermediateImage.metadata();
    if (!width || !height) throw new Error("image is invalid")
    const watermark = await sharp(filters.watermarkPath).resize(Math.floor(0.2 * width), Math.floor(0.2 * height)).png().toBuffer();

    await intermediateImage.composite([
      {
        input: watermark,
        gravity: 'southeast'
      }
    ]);
  }

  return await intermediateImage.toBuffer();

}