import { Router } from 'express';
import { throwError } from '../middlewares/error';
import { getIndex } from '../controllers/index';

const router = Router();

router.get('/', throwError(getIndex));

export default router;