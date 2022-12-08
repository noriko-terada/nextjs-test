import { NextApiRequest, NextApiResponse } from 'next'
import * as vtecxnext from 'utils/vtecxnext'
import { VtecxNextError } from 'utils/vtecxnext'

const handler = async (req:NextApiRequest, res:NextApiResponse) => {
  console.log(`[getids] start. x-requested-with=${req.headers['x-requested-with']}`)
  // X-Requested-With ヘッダチェック
  if (!vtecxnext.checkXRequestedWith(req, res)) {
    return
  }
  // キーを取得
  const tmpUri = req.query['uri']
  const uri:string = tmpUri ? String(tmpUri) : ''
  console.log(`[getids] uri=${uri}`)
  // エントリー取得
  let resStatus:number
  let resMessage:string
  try {
    resMessage = String(await vtecxnext.getids(req, res, uri))
    resStatus = 200
  } catch (error) {
    if (error instanceof VtecxNextError) {
      console.log(`[getids] Error occured. status=${error.status} ${error.message}`)
      resStatus = error.status
      resMessage = error.message
    } else {
      console.log(`[getids] Error occured. (not VtecxNextError) ${error}`)
      resStatus = 503
      resMessage = 'Error occured.'
    }
  }
  const feed = {feed : {'title' : resMessage}}

  console.log('[getids] end.')
  res.status(resStatus)
  res.status(resStatus).json(feed)
  res.end()
}

export default handler
