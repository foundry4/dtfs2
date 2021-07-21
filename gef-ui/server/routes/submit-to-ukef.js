import express from 'express';
import { submitToUkef, createSubmissionToUkef } from '../controllers/submit-to-ukef';
import validateToken from './middleware/validate-token';

const router = express.Router();

router.get('/application-details/:applicationId/submit-to-ukef', validateToken, (req, res) => submitToUkef(req, res));
router.post('/application-details/:applicationId/submit-to-ukef', validateToken, (req, res) => createSubmissionToUkef(req, res));

export default router;
