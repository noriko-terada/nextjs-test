import { NextApiRequest, NextApiResponse } from 'next'
import * as vtecxnext from '@vtecx/vtecxnext'
import { VtecxNextError } from '@vtecx/vtecxnext'
import * as testutil from 'utils/testutil'

const handler = async (req:NextApiRequest, res:NextApiResponse) => {
  console.log(`[setids] start. x-requested-with=${req.headers['x-requested-with']}`)
  // X-Requested-With ヘッダチェック
  if (!vtecxnext.checkXRequestedWith(req, res)) {
    return
  }
  // キーを取得
  const key:string = testutil.getParam(req, 'key')
  const tmpNum = req.query['num']
  const num:number = tmpNum ? Number(tmpNum) : 0
  const targetservice:string = testutil.getParam(req, 'targetservice')
  console.log(`[setids] key=${key} num=${num} ${targetservice ? 'targetservice=' + targetservice : ''}`)

  // エントリー取得
  let resStatus:number
  let resMessage:string
  try {
    resMessage = String(await vtecxnext.setids(req, res, key, num, targetservice))
    resStatus = 200
  } catch (error) {
    if (error instanceof VtecxNextError) {
      console.log(`[setids] Error occured. status=${error.status} ${error.message}`)
      resStatus = error.status
      resMessage = error.message
    } else {
      console.log(`[setids] Error occured. (not VtecxNextError) ${error}`)
      resStatus = 503
      resMessage = 'Error occured.'
    }
  }
  const feed = {feed : {'title' : resMessage}}

  console.log('[setids] end.')
  res.status(resStatus)
  res.status(resStatus).json(feed)
  res.end()
}

export default handler
