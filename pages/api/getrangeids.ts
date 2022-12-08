import { NextApiRequest, NextApiResponse } from 'next'
import * as vtecxnext from 'utils/vtecxnext'
import { VtecxNextError } from 'utils/vtecxnext'

const handler = async (req:NextApiRequest, res:NextApiResponse) => {
  console.log(`[getrangeids] start. x-requested-with=${req.headers['x-requested-with']}`)
  // X-Requested-With ヘッダチェック
  if (!vtecxnext.checkXRequestedWith(req, res)) {
    return
  }
  // キーを取得
  const tmpUri = req.query['uri']
  const uri:string = tmpUri ? String(tmpUri) : ''
  console.log(`[getrangeids] uri=${uri}`)
  // エントリー取得
  let resStatus:number
  let resMessage:string
  try {
    resMessage = await vtecxnext.getRangeids(req, res, uri)
    resStatus = 200
  } catch (error) {
    if (error instanceof VtecxNextError) {
      console.log(`[getrangeids] Error occured. status=${error.status} ${error.message}`)
      resStatus = error.status
      resMessage = error.message
    } else {
      console.log(`[getrangeids] Error occured. (not VtecxNextError) ${error}`)
      resStatus = 503
      resMessage = 'Error occured.'
    }
  }
  const feed = {feed : {'title' : resMessage}}

  console.log('[getrangeids] end.')
  res.status(resStatus)
  res.status(resStatus).json(feed)
  res.end()
}

export default handler
