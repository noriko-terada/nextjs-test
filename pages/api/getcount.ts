import { NextApiRequest, NextApiResponse } from 'next'
import { checkXRequestedWith, requestVtecx } from 'utils/utils'

export default async function handler(req:NextApiRequest, res:NextApiResponse) {
    console.log(`[getcount] start. x-requested-with=${req.headers['x-requested-with']}`)
  // X-Requested-With ヘッダチェック
  if (!checkXRequestedWith(req, res)) {
    return
  }
  // リクエストパラメータ
  let uri = ''
  let param = ''
  for (const tmpkey in req.query) {
    if (tmpkey === "uri") {
      uri = `${req.query[tmpkey]}`
    } else {
      param = `${param}&${tmpkey}=${req.query[tmpkey]}`
    }
  }
  console.log(`[getcount] uri=${uri}`)
  console.log(`[getcount] param=${param}`)
  // vte.cxへリクエスト
  const method = 'GET'
  const url = `/p${uri}?c${param}`
  const response = await requestVtecx(method, url, req)
  const feed = await response.json()
    console.log("[getcount] end.")
    res.status(response.status).json(feed)
}
