import { NextApiRequest, NextApiResponse } from 'next'
import { checkXRequestedWith, requestVtecx } from 'utils/utils'

export default async function handler(req:NextApiRequest, res:NextApiResponse) {
  console.log(`[putentry] start. x-requested-with=${req.headers['x-requested-with']}`)
  // X-Requested-With ヘッダチェック
  if (!checkXRequestedWith(req, res)) {
    return
  }
  // vte.cxへリクエスト
  console.log(`[putentry] body : ${req.body}`)
  const method = 'PUT'
  const url = `/p/?e`
  const response = await requestVtecx(method, url, req, req.body)
  const feed = await response.json()
  console.log("[putentry] end.")
  res.status(response.status).json(feed)
}
