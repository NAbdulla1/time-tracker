import { Router } from 'express';
import * as timeEntryController from '../controllers/timeEntry.controller';

const router = Router();

router.post('/clock-in', timeEntryController.clockIn);
router.post('/clock-out', timeEntryController.clockOut);
router.get('/is-clocked-in', timeEntryController.getClockStatus);
router.get('/today', timeEntryController.getToday);
router.get('/previous', timeEntryController.getPrevious);
router.get('/current-week', timeEntryController.getCurrentWeek);
router.get('/thursday-week', timeEntryController.getThursdayWeek);
router.delete('/clock-entry/:id', timeEntryController.deleteEntry);

export default router;
