import { NextApiRequest, NextApiResponse } from 'next'
import * as vtecxnext from 'utils/vtecxnext'
import { VtecxNextError } from 'utils/vtecxnext'

const handler = async (req:NextApiRequest, res:NextApiResponse) => {
  console.log(`[putentry] start. x-requested-with=${req.headers['x-requested-with']}`)
  // X-Requested-With ヘッダチェック
  if (!vtecxnext.checkXRequestedWith(req, res)) {
    return
  }

  // 更新
  let resStatus:number
  let resJson:any
  let feed
  try {
    feed = req.body ? JSON.parse(req.body) : null
  } catch (e) {
    let resErrMsg:string
    if (e instanceof Error) {
      const error:Error = e
      resErrMsg = `${error.name}: ${error.message}`
    } else {
      resErrMsg = String(e)
    }
    resJson = {feed : {'title' : resErrMsg}}
    res.status(400).json(resJson)
    res.end()
    return
  }

  try {
    resJson = await vtecxnext.put(req, res, feed)
    resStatus = 200
  } catch (error) {
    let resErrMsg:string
    if (error instanceof VtecxNextError) {
      console.log(`[putentry] Error occured. status=${error.status} ${error.message}`)
      resStatus = error.status
      resErrMsg = error.message
    } else {
      console.log(`[putentry] Error occured. (not VtecxNextError) ${error}`)
      resStatus = 503
      resErrMsg = 'Error occured.'
    }
    resJson = {feed : {'title' : resErrMsg}}
  }

  console.log('[putentry] end.')
  res.status(resStatus).json(resJson)
  res.end()
}

export default handler
