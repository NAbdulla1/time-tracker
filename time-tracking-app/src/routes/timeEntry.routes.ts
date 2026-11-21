import { Router } from 'express';
import * as timeEntryController from '../controllers/timeEntry.controller';
import { validate } from '../middlewares/validate';
import {
    clockInBodySchema,
    clockOutBodySchema,
    deleteEntryParamsSchema,
    updateEntryBodySchema,
} from '../schemas/timeEntry.schema';

const router = Router();

router.post('/clock-in', validate({ body: clockInBodySchema }), timeEntryController.clockIn);
router.post('/clock-out', validate({ body: clockOutBodySchema }), timeEntryController.clockOut);
router.get('/is-clocked-in', timeEntryController.getClockStatus);
router.get('/today', timeEntryController.getToday);
router.get('/previous', timeEntryController.getPrevious);
router.get('/current-week', timeEntryController.getCurrentWeek);
router.get('/secondary-week', timeEntryController.getSecondaryWeek);
router.get('/thursday-week', timeEntryController.getThursdayWeek);
router.put(
    '/clock-entry/:id',
    validate({ params: deleteEntryParamsSchema, body: updateEntryBodySchema }),
    timeEntryController.updateEntry
);
router.delete('/clock-entry/:id', validate({ params: deleteEntryParamsSchema }), timeEntryController.deleteEntry);

export default router;
