import { NextApiRequest, NextApiResponse } from 'next'
import * as vtecxnext from 'utils/vtecxnext'
import { VtecxNextError } from 'utils/vtecxnext'

const handler = async (req:NextApiRequest, res:NextApiResponse) => {
  console.log(`[allocids] start. x-requested-with=${req.headers['x-requested-with']}`)
  // X-Requested-With ヘッダチェック
  if (!vtecxnext.checkXRequestedWith(req, res)) {
    return
  }
  // キーを取得
  const tmpUri = req.query['uri']
  const uri:string = tmpUri ? String(tmpUri) : ''
  const tmpNum = req.query['num']
  const num:number = tmpNum ? Number(tmpNum) : 0
  console.log(`[allocids] uri=${uri} num=${num}`)
  // エントリー取得
  let resStatus:number
  let resMessage:string
  try {
    resMessage = await vtecxnext.allocids(req, res, uri, num)
    resStatus = 200
  } catch (error) {
    if (error instanceof VtecxNextError) {
      console.log(`[allocids] Error occured. status=${error.status} ${error.message}`)
      resStatus = error.status
      resMessage = error.message
    } else {
      console.log(`[allocids] Error occured. (not VtecxNextError) ${error}`)
      resStatus = 503
      resMessage = 'Error occured.'
    }
  }
  const feed = {feed : {'title' : resMessage}}

  console.log('[allocids] end.')
  res.status(resStatus)
  res.status(resStatus).json(feed)
  res.end()
}

export default handler
