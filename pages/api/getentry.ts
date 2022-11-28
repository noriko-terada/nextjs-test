import { NextApiRequest, NextApiResponse } from 'next'
import { checkXRequestedWith, requestVtecx } from 'utils/utils'

export default async function handler(req:NextApiRequest, res:NextApiResponse) {
  console.log(`[getentry] start. x-requested-with=${req.headers['x-requested-with']}`)
  // X-Requested-With ヘッダチェック
  if (!checkXRequestedWith(req, res)) {
    return
  }
  // キーを取得
  const uri = req.query["uri"]
  console.log(`[getentry] uri=${uri}`)
  // vte.cxへリクエスト
  const method = 'GET'
  const url = `/p${uri}?e`
  const response = await requestVtecx(method, url, req, null)
  const feed = await response.json()
  console.log("[getentry] end.")
  res.status(response.status).json(feed)
}
