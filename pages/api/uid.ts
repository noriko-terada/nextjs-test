import { NextApiRequest, NextApiResponse } from 'next'
import * as vtecxnext from 'utils/vtecxnext'
import { VtecxNextError } from 'utils/vtecxnext'

const handler = async (req:NextApiRequest, res:NextApiResponse) => {
  console.log(`[uid] start. x-requested-with=${req.headers['x-requested-with']}`)
  // X-Requested-With ヘッダチェック
  if (!vtecxnext.checkXRequestedWith(req, res)) {
    return
  }
  // uid取得
  let resStatus:number
  let resMessage:string
  try {
    resMessage = await vtecxnext.uid(req)
    resStatus = 200
  } catch (error) {
    if (error instanceof VtecxNextError) {
      console.log(`[uid] Error occured. status=${error.status} ${error.message}`)
      resStatus = error.status
      resMessage = error.message
    } else {
      console.log(`[uid] Error occured. (not VtecxNextError) ${error}`)
      resStatus = 503
      resMessage = 'Error occured.'
    }
  }
  const feed = {feed : {'title' : resMessage}}

  console.log('[uid] end.')
  res.status(resStatus).json(feed)
}

export default handler
