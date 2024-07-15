import express, { Router } from 'express';

const router: Router = express.Router();


router.get('/', (req, res) => {
    res.send('Images');
})
router.post('/', (req, res) => {
    res.send('Images');
})
router.put('/crop/:id', (req, res) => {
    res.send('Images');
})
router.put('/resize/:id', (req, res) => {
    res.send('Images');
})
router.get('/:id', (req, res) => {
    res.send('Images');
})




export default router;