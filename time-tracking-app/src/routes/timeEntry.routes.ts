import { Router } from 'express';
import * as timeEntryController from '../controllers/timeEntry.controller';
import { validate } from '../middlewares/validate';
import {
    clockInBodySchema,
    clockOutBodySchema,
    deleteEntryParamsSchema,
} from '../schemas/timeEntry.schema';

const router = Router();

router.post('/clock-in', validate({ body: clockInBodySchema }), timeEntryController.clockIn);
router.post('/clock-out', validate({ body: clockOutBodySchema }), timeEntryController.clockOut);
router.get('/is-clocked-in', timeEntryController.getClockStatus);
router.get('/today', timeEntryController.getToday);
router.get('/previous', timeEntryController.getPrevious);
router.get('/current-week', timeEntryController.getCurrentWeek);
router.get('/thursday-week', timeEntryController.getThursdayWeek);
router.delete('/clock-entry/:id', validate({ params: deleteEntryParamsSchema }), timeEntryController.deleteEntry);

export default router;
