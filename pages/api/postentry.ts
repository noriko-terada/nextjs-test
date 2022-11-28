import { NextApiRequest, NextApiResponse } from 'next'
import { checkXRequestedWith, requestVtecx } from 'utils/utils'

export default async function handler(req:NextApiRequest, res:NextApiResponse) {
  console.log(`[postentry] start. x-requested-with=${req.headers['x-requested-with']}`)
  // X-Requested-With ヘッダチェック
  if (!checkXRequestedWith(req, res)) {
    return
  }
  // キーを取得
  let uri = req.query["uri"]
  if (uri != null) {
    console.log(`[postentry] uri=${uri}`)
  } else {
    uri = '/'
  }
  // vte.cxへリクエスト
  console.log(`[postentry] body : ${req.body}`)
  const method = 'POST'
  const url = `/p${uri}?e`
  const response = await requestVtecx(method, url, req, req.body)
  const feed = await response.json()
  console.log("[postentry] end.")
  res.status(response.status).json(feed)
}
