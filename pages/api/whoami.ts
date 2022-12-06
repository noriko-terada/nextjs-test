import { NextApiRequest, NextApiResponse } from 'next'
//import { checkXRequestedWith, requestVtecx } from 'utils/utils'
import * as vtecxnext from 'utils/vtecxnext'
import { VtecxNextError } from 'utils/vtecxnext'

const handler = async (req:NextApiRequest, res:NextApiResponse) => {
  console.log(`[whoami] start. x-requested-with=${req.headers['x-requested-with']}`)
  // X-Requested-With ヘッダチェック
  if (!vtecxnext.checkXRequestedWith(req, res)) {
    return
  }
  // whoami
  let resStatus:number
  let resJson:any
  try {
    resJson = await vtecxnext.whoami(req)
    resStatus = 200
  } catch (error) {
    let resErrMsg:string
    if (error instanceof VtecxNextError) {
      console.log(`[whoami] Error occured. status=${error.status} ${error.message}`)
      resStatus = error.status
      resErrMsg = error.message
    } else {
      console.log(`[whoami] Error occured. (not VtecxNextError) ${error}`)
      resStatus = 503
      resErrMsg = 'Error occured.'
    }
    resJson = {feed : {'title' : resErrMsg}}
  }

  console.log('[whoami] end.')
  res.status(resStatus).json(resJson)
}

export default handler
