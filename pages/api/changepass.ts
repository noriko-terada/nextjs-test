import { NextApiRequest, NextApiResponse } from 'next'
import * as vtecxnext from 'utils/vtecxnext'
import { VtecxNextError } from 'utils/vtecxnext'

const handler = async (req:NextApiRequest, res:NextApiResponse) => {
  console.log(`[changepass] start. x-requested-with=${req.headers['x-requested-with']}`)
  // X-Requested-With ヘッダチェック
  if (!vtecxnext.checkXRequestedWith(req, res)) {
    return
  }
  // 引数を取得
  console.log(`[changepass] req.body = ${req.body}`)

  // 登録
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
    console.log(`[changepass] resErrMsg = ${resErrMsg}`)
    resJson = {feed : {'title' : resErrMsg}}
    res.status(400).json(resJson)
    res.end()
    return
  }

  try {
    console.log(`[changepass] vtecxnext.adduser start.`)
    resJson = await vtecxnext.changepass(req, res, feed)
    resStatus = 200
  } catch (error) {
    let resErrMsg:string
    if (error instanceof VtecxNextError) {
      console.log(`[changepass] Error occured. status=${error.status} ${error.message}`)
      resStatus = error.status
      resErrMsg = error.message
    } else {
      console.log(`[changepass] Error occured. (not VtecxNextError) ${error}`)
      resStatus = 503
      resErrMsg = 'Error occured.'
    }
    resJson = {feed : {'title' : resErrMsg}}
  }

  console.log('[changepass] end.')
  res.status(resStatus).json(resJson)
  res.end()
}

export default handler
