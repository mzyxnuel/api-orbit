import { Request, Response } from "express"
import { AuthService, CronJobsService } from "services"
import { SuccessResponse } from "types"

const auth = new AuthService()
const cron = new CronJobsService()

export const GET = [auth.checkIfCronSecretIsValid, async (_: Request, res: Response) => {
   cron.keepAliveNeo().then((success: SuccessResponse) => {
      res.status(200).json({
         ...success
      })
   }).catch((error) => { res.status(500).json({ error: error.message }) })
}]
