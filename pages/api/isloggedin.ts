import { NextApiRequest, NextApiResponse } from 'next'
import * as vtecxnext from 'utils/vtecxnext'
import { VtecxNextError } from 'utils/vtecxnext'

const handler = async (req:NextApiRequest, res:NextApiResponse) => {
  console.log(`[isloggedin] start. x-requested-with=${req.headers['x-requested-with']}`)
  // X-Requested-With ヘッダチェック
  if (!vtecxnext.checkXRequestedWith(req, res)) {
    return
  }
  // ログインチェック
  let resStatus:number
  let resMessage:string
  try {
    const isloggedin = await vtecxnext.isLoggedin(req, res)
    resMessage = String(isloggedin)
    resStatus = 200
  } catch (error) {
    if (error instanceof VtecxNextError) {
      console.log(`[isloggedin] Error occured. status=${error.status} ${error.message}`)
      resStatus = error.status
      resMessage = error.message
    } else {
      console.log(`[isloggedin] Error occured. (not VtecxNextError) ${error}`)
      resStatus = 503
      resMessage = 'Error occured.'
    }
  }
  const feed = {feed : {'title' : resMessage}}

  console.log('[isloggedin] end.')
  res.status(resStatus).json(feed)
  res.end()
}

export default handler
