import { NextApiRequest, NextApiResponse } from 'next'
import { checkXRequestedWith, requestVtecx } from 'utils/utils'

export default async function handler(req:NextApiRequest, res:NextApiResponse) {
  console.log(`[log] start. x-requested-with=${req.headers['x-requested-with']}`)
  // X-Requested-With ヘッダチェック
  if (!checkXRequestedWith(req, res)) {
    return
  }
  // vte.cxへリクエスト
  console.log(`[log] body : ${req.body}`)
  const method = 'POST'
  const url = `/p/?_log`
  const response = await requestVtecx(method, url, req, req.body)
  const feed = await response.json()
  console.log("[log] end.")
  res.status(response.status).json(feed)
}
