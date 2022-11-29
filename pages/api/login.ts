import { NextApiRequest, NextApiResponse } from 'next'
import { checkXRequestedWith, fetchVtecx } from 'utils/utils'

/**
 * ログイン処理.
 * @param req リクエスト
 * @param res レスポンス
 * @returns ログイン成功の場合、SIDをSet-Cookieする。
 */
export default async function handler(req:NextApiRequest, res:NextApiResponse) {
  // X-Requested-With ヘッダチェック
  if (!checkXRequestedWith(req, res)) {
    return
  }

  // リクエストヘッダからWSSEを取得
  const wsse = req.headers['x-wsse']
  const reCaptchaToken = req.query['g-recaptcha-token']
  const param = reCaptchaToken ? `&g-recaptcha-token=${reCaptchaToken}` : ''
  console.log(`[login] x-wsse=${wsse}`)
  if (wsse == null) {
    console.log(`[login] x-wsse header is required.`)
    res.status(400).json({feed : {title: "Authentication is required."}})
    return
  }
  
  const method = 'GET'
  const url = `/d/?_login${param}`
  const headers = {'X-WSSE' : `${wsse}`}
  const response = await fetchVtecx(method, url, headers, null)
  const feed = await response.json()
  // レスポンスヘッダの値のうち、"content-type"、"set-cookie"、"x-"で始まるものをセット
  const it = response.headers.entries()
  let tmp = it.next()
  while (!tmp.done) {
    const name = tmp.value[0]
    const val = tmp.value[1]
    console.log(`[login] response.header = ${name} : ${val}`)
    if (name.startsWith("x-") || name === "set-cookie" || name === "content-type") {
      console.log(`[login] (set) response.header = ${name} : ${val}`)
      res.setHeader(name, val)
    }
    tmp = it.next()
  }

  console.log("[login] end.")
  res.status(response.status).json(feed)
}
