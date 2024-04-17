import { Request, Response } from "express"
import { AuthService, ValidationService } from "services"
import { AuthResponse, SignUpRequest, UserSchema } from "types"

const auth = new AuthService()
const valid = new ValidationService()

export const POST = (req: Request, res: Response) => {
   const authorization: string = req.headers.authorization!
   const username: string = req.body.username
   const interests: string[] = req.body.interests
   const bday: number = req.body.bday
   const pfp: string = req.body.pfp

   const ereq: SignUpRequest = {
      authorization,
      username,
      interests,
      bday,
      pfp
   }

   auth.checkIfAccessTokenIsValid(ereq.authorization).then((uid: string) => { //check if firebase access token is valid
      valid.usernameValidation(ereq.username).then(() => {
         valid.birthdateValidation(ereq.bday).then(() => {
            valid.interestsValidation(ereq.interests).then(async () => {
               try {
                  if (pfp) await valid.mediaValidation(pfp)
                  auth.createUserDocument(uid, ereq.username, ereq.pfp!, ereq.bday).then((userSchema: UserSchema) => { //create a new doc in /users
                     auth.createUserNode(uid, ereq.interests).then(() => { //create a new node in neo4j
                        auth.createNewSession(uid).then((jwt: string) => { //return the session jwt and the user for the frontend side
                           const authResponse: AuthResponse = {
                              jwt,
                              ...userSchema
                           }

                           res.status(201).json({
                              ...authResponse
                           })
                        }).catch((error) => { res.status(500).json({ error: error.message }) })
                     }).catch((error) => { res.status(500).json({ error: error.message }) })
                  }).catch((error) => { res.status(500).json({ error: error.message }) })
               } catch (error: any) { res.status(400).json({ error: error.message }) }
            }).catch((error) => { res.status(400).json({ error: error.message }) })
         }).catch((error) => { res.status(400).json({ error: error.message }) })
      }).catch((error) => { res.status(400).json({ error: error.message }) })
   }).catch((error) => { res.status(401).json({ error: error.message }) })
}
