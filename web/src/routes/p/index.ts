import { Request, Response } from "express"
import { AuthService, ContentService, ValidationService } from "services"
import { IdResponse, PostRequest } from "types"

const auth = new AuthService()
const valid = new ValidationService()
const cont = new ContentService()

export const POST = [auth.sessionGuard, async (req: Request, res: Response) => {
   const uid: string = res.locals.uid
   const text: string = req.body.text
   const type: string = req.body.type
   const content: string = req.body.content

   const ereq: PostRequest = {
      text,
      content,
      type
   }

   valid.contentValidation(ereq.text, ereq.content, ereq.type).then(() => {
      cont.uploadPost(uid, ereq.text, ereq.type, ereq.content).then((idResponse: IdResponse) => {
         res.status(201).json({
            ...idResponse //return the post id
         })
      }).catch((error) => { res.status(500).json({ error: error.message }) })
   }).catch((error) => { res.status(400).json({ error: error.message }) })
}]
