import { NextApiRequest, NextApiResponse } from 'next'
//import { checkXRequestedWith, requestVtecx } from 'utils/utils'
import * as vtecxnextapi from 'utils/vtecxnextapi'

export default async function handler(req:NextApiRequest, res:NextApiResponse) {
  console.log(`[log] start. x-requested-with=${req.headers['x-requested-with']}`)
  // X-Requested-With ヘッダチェック
  if (!vtecxnextapi.checkXRequestedWith(req, res)) {
    return
  }
  // vte.cxへリクエスト
  console.log(`[log] body : ${req.body}`)
  /*
  const method = 'POST'
  const url = `/p/?_log`
  const response = await requestVtecx(method, url, req, req.body)
  const feed = await response.json()
  */

  const bodyJson = JSON.parse(req.body)
  const message = bodyJson[0].summary
  const title = bodyJson[0].title
  const subtitle = bodyJson[0].subtitle

  console.log(`[log] message=${message} title=${title} subtitle=${subtitle}`)
  const response = await vtecxnextapi.log(req, message, title, subtitle)
  const feed = await response.json()

  console.log('[log] end.')
  res.status(response.status).json(feed)
}
