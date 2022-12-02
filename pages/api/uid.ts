import { NextApiRequest, NextApiResponse } from 'next'
//import { checkXRequestedWith, requestVtecx } from 'utils/utils'
import * as vtecxnext from 'utils/vtecxnext'
import { VtecxNextError } from 'utils/vtecxnext'

export default async function handler(req:NextApiRequest, res:NextApiResponse) {
  console.log(`[uid] start. x-requested-with=${req.headers['x-requested-with']}`)
  // X-Requested-With ヘッダチェック
  if (!vtecxnext.checkXRequestedWith(req, res)) {
    return
  }
  /*
  // vte.cxへリクエスト
  const method = 'GET'
  const url = '/d/?_uid'
  const response = await requestVtecx(method, url, req, null)
  const feed = await response.json()

  console.log('[uid] end.')
  res.status(response.status).json(feed)
  */

  let resStatus:number
  let resMessage:string
  try {
    resMessage = await vtecxnext.uid(req)
    resStatus = 200
  } catch (error) {
    console.log(`[uid] Error occured. ${error}`)
    if (error instanceof VtecxNextError) {
      console.log(`[uid] error occured. status=${error.status} ${error.message}`)
      resStatus = error.status
      resMessage = error.message
    } else {
      resStatus = 503
      resMessage = 'Error occured.'
    }
  }
  const feed = {feed : {'title' : resMessage}}

  console.log('[uid] end.')
  res.status(resStatus).json(feed)
}
