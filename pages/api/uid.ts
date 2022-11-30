import { NextApiRequest, NextApiResponse } from 'next'
import { checkXRequestedWith, requestVtecx } from 'utils/utils'

export default async function handler(req:NextApiRequest, res:NextApiResponse) {
  console.log(`[uid] start. x-requested-with=${req.headers['x-requested-with']}`)
  // X-Requested-With ヘッダチェック
  if (!checkXRequestedWith(req, res)) {
    return
  }
  // vte.cxへリクエスト
  const method = 'GET'
  const url = '/d/?_uid'
  const response = await requestVtecx(method, url, req, null)
  const feed = await response.json()

  console.log('[uid] end.')
  res.status(response.status).json(feed)
}
