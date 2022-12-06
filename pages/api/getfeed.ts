import { NextApiRequest, NextApiResponse } from 'next'
import { checkXRequestedWith, requestVtecx } from 'utils/utils'

const handler = async (req:NextApiRequest, res:NextApiResponse) => {
    console.log(`[getfeed] start. x-requested-with=${req.headers['x-requested-with']}`)
  // X-Requested-With ヘッダチェック
  if (!checkXRequestedWith(req, res)) {
    return
  }
  // リクエストパラメータ
  let uri = ''
  let param = ''
  for (const tmpkey in req.query) {
    if (tmpkey === 'uri') {
      uri = `${req.query[tmpkey]}`
    } else {
      param = `${param}&${tmpkey}=${req.query[tmpkey]}`
    }
  }
  console.log(`[getfeed] uri=${uri}`)
  console.log(`[getfeed] param=${param}`)
  // vte.cxへリクエスト
  const method = 'GET'
  const url = `/p${uri}?f${param}`
  const response = await requestVtecx(method, url, req, null)
  const feed = await response.json()
    console.log('[getfeed] end.')
    res.status(response.status).json(feed)
}

export default handler
