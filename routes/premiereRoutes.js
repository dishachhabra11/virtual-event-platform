import express from 'express';
import {
  createPremiere,
  deletePremiere,
  getAllPremieres,
} from '../controllers/premiereController.js';

const router = express.Router();

router.get('/', getAllPremieres);
router.post('/', createPremiere);
router.delete('/:id', deletePremiere);

export default router;
