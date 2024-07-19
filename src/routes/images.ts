import express, { Router } from 'express';
import { tryCatch } from '../utils/tryCatch';
import { addAnImage, cropImage, downloadImage, filterImage, filterImageProc, getImages, resizeImage } from '../controllers/images';
const router: Router = express.Router();


router.get('/', tryCatch(getImages))
router.post('/', tryCatch(addAnImage))

router.put('/crop/:id', tryCatch(cropImage))
router.put('/resize/:id', tryCatch(resizeImage))
router.get('/:id', tryCatch(downloadImage))
router.put('/filter/:id', tryCatch(filterImage))



export default router;