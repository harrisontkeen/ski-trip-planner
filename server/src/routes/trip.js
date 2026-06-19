import { Router } from 'express'
import {
  generateTripPlan,
  saveTripPlan,
  listTrips,
  getTrip,
  removeTrip
} from '../controllers/tripController.js'

const router = Router()

router.post('/generate', generateTripPlan)
router.post('/save', saveTripPlan)
router.get('/all', listTrips)
router.get('/:id', getTrip)
router.delete('/:id', removeTrip)

export default router
