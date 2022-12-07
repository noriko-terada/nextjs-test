import { NextApiRequest, NextApiResponse } from 'next'
import * as vtecxnext from 'utils/vtecxnext'
import { VtecxNextError } from 'utils/vtecxnext'

const handler = async (req:NextApiRequest, res:NextApiResponse) => {
  console.log(`[logout] start. x-requested-with=${req.headers['x-requested-with']}`)
  // X-Requested-With ヘッダチェック
  if (!vtecxnext.checkXRequestedWith(req, res)) {
    return
  }
  // ログアウト
  let resStatus:number
  let resMessage:string
  try {
    const isLogout = await vtecxnext.logout(req, res)
    resMessage = isLogout ? 'Logged out!' : 'logout failed.'
    resStatus = 200
  } catch (error) {
    if (error instanceof VtecxNextError) {
      console.log(`[logout] Error occured. status=${error.status} ${error.message}`)
      resStatus = error.status
      resMessage = error.message
    } else {
      console.log(`[logout] Error occured. (not VtecxNextError) ${error}`)
      resStatus = 503
      resMessage = 'Error occured.'
    }
  }
  const resJson = {feed : {'title' : resMessage}}
  res.status(resStatus).json(resJson)
  res.end()
}

export default handler
