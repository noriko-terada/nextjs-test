import { NextApiRequest, NextApiResponse } from 'next'
import { checkXRequestedWith, requestVtecx } from 'utils/utils'

export default async function handler(req:NextApiRequest, res:NextApiResponse) {
  console.log(`[deleteentry] start. x-requested-with=${req.headers['x-requested-with']}`)
  // X-Requested-With ヘッダチェック
  if (!checkXRequestedWith(req, res)) {
    return
  }
  // キーを取得
  let uri = req.query["uri"]
  if (uri != null) {
    console.log(`[deleteentry] uri=${uri}`)
  } else {
    uri = '/'
  }
  // vte.cxへリクエスト
  const method = 'DELETE'
  const url = `/p${uri}?e`
  const response = await requestVtecx(method, url, req)
  const feed = await response.json()
  console.log("[deleteentry] end.")
  res.status(response.status).json(feed)
}
