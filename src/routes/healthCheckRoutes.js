import { Router } from "express"

import { healthCheck } from "../controllers/healthCheckController.js"

const router = Router()
//when someone hits /api/v1/healthcheck/test

router.route("/").get(healthCheck);




export default router