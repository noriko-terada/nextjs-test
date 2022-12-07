import { NextApiRequest, NextApiResponse } from 'next'
import * as vtecxnext from 'utils/vtecxnext'
import { VtecxNextError } from 'utils/vtecxnext'

const handler = async (req:NextApiRequest, res:NextApiResponse) => {
  console.log(`[uid2] start. x-requested-with=${req.headers['x-requested-with']}`)
  // X-Requested-With ヘッダチェック
  if (!vtecxnext.checkXRequestedWith(req, res)) {
    return
  }
  // uid取得
  let resStatus:number
  let resMessage:string

  // 1回目
  console.log(`[uid2](1) start.`)
  try {
    resMessage = await vtecxnext.uid(req, res)
    resStatus = 200
  } catch (error) {
    // エラーの場合は抜ける
    if (error instanceof VtecxNextError) {
      console.log(`[uid2](1) Error occured. status=${error.status} ${error.message}`)
      resStatus = error.status
      resMessage = `(1) ${error.message}`
    } else {
      console.log(`[uid2](1) Error occured. (not VtecxNextError) ${error}`)
      resStatus = 503
      resMessage = '(1) Error occured.'
    }
    const feed = {feed : {'title' : resMessage}}
    res.status(resStatus).json(feed)
  }

  // ２回目
  console.log(`[uid2](2) start.`)
  try {
    resMessage = await vtecxnext.uid(req, res)
    resStatus = 200
  } catch (error) {
    // エラーの場合は抜ける
    if (error instanceof VtecxNextError) {
      console.log(`[uid2](2) Error occured. status=${error.status} ${error.message}`)
      resStatus = error.status
      resMessage = `(2) ${error.message}`
    } else {
      console.log(`[uid2](2) Error occured. (not VtecxNextError) ${error}`)
      resStatus = 503
      resMessage = '(2) Error occured.'
    }
  }

  const feed = {feed : {'title' : resMessage}}

  console.log('[uid2] end.')
  res.status(resStatus).json(feed)
  res.end()
}

export default handler
