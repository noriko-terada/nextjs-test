import { NextApiRequest, NextApiResponse } from 'next'
import * as vtecxnext from 'utils/vtecxnext'
import { VtecxNextError } from 'utils/vtecxnext'
import * as testutil from 'utils/testutil'
import { ApiRouteTestError } from 'utils/testutil'

const handler = async (req:NextApiRequest, res:NextApiResponse) => {
  console.log(`[messagequeue] start. x-requested-with=${req.headers['x-requested-with']}`)
  // X-Requested-With ヘッダチェック
  if (!vtecxnext.checkXRequestedWith(req, res)) {
    return
  }
  // methodを取得
  const method = req.method
  // パラメータを取得
  const channel:string = testutil.getParam(req, 'channel')
  console.log(`[messagequeue] method=${method} channel=${channel}`)
  // セッション操作
  let resStatus:number = 200
  let resJson:any
  try {
    if (method === 'GET') {
      // メッセージキュー受信
      resJson = await vtecxnext.getMessageQueue(req, res, channel)
      resStatus = resJson ? 200 : 204

    } else if (method === 'PUT') {
      // メッセージキューステータス設定
      const flagStr:string = testutil.getParam(req, 'flag')
      const flag:boolean = testutil.toBoolean(flagStr)
      const result = await vtecxnext.setMessageQueueStatus(req, res, flag, channel)
      const message = `set message queue status. channel=${channel} flag=${flagStr}`
      resJson = {feed : {'title' : message}}

    } else if (method === 'POST') {
      // メッセージキュー送信
      const result = await vtecxnext.setMessageQueue(req, res, testutil.getRequestJson(req), channel)
      const message = `set message queue. channel=${channel}`
      resJson = {feed : {'title' : message}}
    }

  } catch (error) {
    let resErrMsg:string
    if (error instanceof VtecxNextError || error instanceof ApiRouteTestError) {
      console.log(`[messagequeue] Error occured. status=${error.status} ${error.message}`)
      resStatus = error.status
      resErrMsg = error.message
    } else {
      console.log(`[messagequeue] Error occured. (not VtecxNextError) ${error}`)
      resStatus = 503
      resErrMsg = 'Error occured.'
    }
    resJson = {feed : {'title' : resErrMsg}}
  }

  console.log(`[messagequeue] end. resJson=${resJson}`)
  res.status(resStatus)
  resJson ? res.json(resJson) : 
  res.end()
}

export default handler
