import { NextApiRequest, NextApiResponse } from 'next'
import { checkXRequestedWith, requestVtecx } from 'utils/utils'

const handler = async (req:NextApiRequest, res:NextApiResponse) => {
  console.log(`[deleteentry] start. x-requested-with=${req.headers['x-requested-with']}`)
  // X-Requested-With ヘッダチェック
  if (!checkXRequestedWith(req, res)) {
    return
  }
  // キーを取得
  let uri = req.query['uri']
  if (uri) {
    console.log(`[deleteentry] uri=${uri}`)
  } else {
    uri = '/'
  }
  // vte.cxへリクエスト
  const method = 'DELETE'
  const url = `/p${uri}?e`
  const response = await requestVtecx(method, url, req, null)
  const feed = await response.json()
  console.log('[deleteentry] end.')
  res.status(response.status).json(feed)
}

export default handler
