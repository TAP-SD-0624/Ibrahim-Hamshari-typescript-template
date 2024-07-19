import { NextFunction, Request, Response } from "express";
import multer, { FileFilterCallback, MulterError } from 'multer'
import { logger } from "../config/loggers";
import { applyFilters, getAllImages, getImage } from "../utils/images";
import sharp from "sharp";

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/');
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
  limits: {
    fileSize: 1024 * 1024 * 20,
  },
  fileFilter,
}).single('image');


export function addAnImage(req: Request, res: Response, next: NextFunction) {

  upload(req, res, (err) => {
    if (err instanceof MulterError) {
      logger.error(err.message);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ status: "failed", error: 'File size is too large. Maximum size is 20 MB.' });
      }
      return res.status(400).json({ status: "failed", error: err.message });
    } else if (err) {
      if (err.message === 'Only image files are allowed!') {
        return res.status(400).json({ status: "failed", error: err.message });
      }
      console.log(err);
      return res.status(500).json({ status: "failed", error: 'An unknown error occurred during the upload.' });
    }


    res.status(200).json({ status: "success", result: 'File uploaded successfully!' });
  })
}


export async function getImages(req: Request, res: Response, next: NextFunction) {
  const images = await getAllImages();
  res.status(200).json({ status: "success", result: images });
}

export async function cropImage(req: Request, res: Response, next: NextFunction) {
  const param = req.params.id;
  const { width, height, left, top } = req.body;
  if (!param || !width || !height || !left || !top) {
    throw new Error("please provide all required params");
  }
  const imagePath = await getImage(param);
  const croppedImagePath = await getImage(param, { cropped: true });
  const croppedImage = await sharp(imagePath).extract({ width: parseInt(width), height: parseInt(height), left: parseInt(left), top: parseInt(top) }).toFile(croppedImagePath);
  res.status(200).json({ status: "success", result: "Image cropped successfully" });
}

export async function resizeImage(req: Request, res: Response, next: NextFunction) {
  const param = req.params.id;
  const { width, height } = req.body;

  if (!param || !width || !height) {
    throw new Error("Please provide all required params");
  }

  const imagePath = await getImage(param);
  const resizedImagePath = await getImage(param, { resized: true });

  await sharp(imagePath)
    .resize({ width: parseInt(width), height: parseInt(height) })
    .toFile(resizedImagePath);

  res.status(200).json({ status: "success", result: "Image resized successfully" });

}

export async function downloadImage(req: Request, res: Response, next: NextFunction) {
  const param = req.params.id;
  const imagePath = await getImage(param);
  res.download(imagePath);
}

export const filterImageProc: Function[] = [
  upload,
  filterImage
];

export async function filterImage(req: Request, res: Response, next: NextFunction) {

  await new Promise<void>((resolve, reject) => upload(req, res, (err) => {
    if (err) {
      logger.error(err.message);

      if (err instanceof MulterError) {
        logger.error(err.message);
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ status: "failed", error: 'File size is too large. Maximum size is 20 MB.' });
        }
        return res.status(400).json({ status: "failed", error: err.message });
      } else if (err) {
        if (err.message === 'Only image files are allowed!') {
          return res.status(400).json({ status: "failed", error: err.message });
        }
        return res.status(500).json({ status: "failed", error: 'An unknown error occurred during the upload.' });
      }
      reject();
    }
    resolve();
  }))
  const param: string = req.params.id;
  console.log(req.body)
  const { grayscale, blur, watermark, blurRadius, top, left } = req.body;
  let watermarkPath: string | undefined;

  if (!param) {
    throw new Error("Please provide the Path");
  }
  if (!grayscale && !blur && !watermark) {
    throw new Error("Please provide an operation for filtering.")
  }
  if (blur && !blurRadius) throw new Error("Please Provide blurRadius in the body.")
  if (watermark) {
    if (!top || !left) throw new Error("Please Provide Top and Left in the body.")

    watermarkPath = req.file?.path;
  }

  const imagePath = await getImage(param);
  const result = await applyFilters(imagePath, { watermark, grayscale, blur, blurRadius, top, left, watermarkPath });

  res.set('Content-Type', 'image/png');
  res.set('Content-Disposition', 'attachment; filename="processed-image.png"');


  res.send(result);

}