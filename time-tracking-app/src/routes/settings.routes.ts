import { Router } from 'express';
import * as settingsController from '../controllers/settings.controller';
import { validate } from '../middlewares/validate';
import { updateSettingsSchema } from '../schemas/settings.schema';

const router = Router();

router.get('/settings', settingsController.getSettings);
router.put('/settings', validate({ body: updateSettingsSchema }), settingsController.updateSettings);

export default router;
