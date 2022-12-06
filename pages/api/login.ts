import { NextApiRequest, NextApiResponse } from 'next'
//import { checkXRequestedWith, fetchVtecx } from 'utils/utils'
import * as vtecxnext from 'utils/vtecxnext'
import { VtecxNextError } from 'utils/vtecxnext'

/**
 * ログイン処理.
 * @param req リクエスト
 * @param res レスポンス
 * @returns ログイン成功の場合、SIDをSet-Cookieする。
 */
const handler = async (req:NextApiRequest, res:NextApiResponse) => {
  // X-Requested-With ヘッダチェック
  if (!vtecxnext.checkXRequestedWith(req, res)) {
    return
  }
  // リクエストヘッダからWSSEを取得
  const wsse = String(req.headers['x-wsse'])
  const reCaptchaToken = String(req.query['g-recaptcha-token'])
  const param = reCaptchaToken ? `&g-recaptcha-token=${reCaptchaToken}` : ''
  console.log(`[login] x-wsse=${wsse}`)
  if (wsse == null) {
    console.log(`[login] x-wsse header is required.`)
    res.status(400).json({feed : {title: 'Authentication is required.'}})
    return
  }
  // ログイン
  let resStatus:number
  let resMessage:string
  try {
    const isLoggedin = await vtecxnext.login(req, res, wsse, reCaptchaToken)
    resMessage = isLoggedin ? 'Logged in!' : 'login failed.'
    resStatus = 200
  } catch (error) {
    if (error instanceof VtecxNextError) {
      console.log(`[login] Error occured. status=${error.status} ${error.message}`)
      resStatus = error.status
      resMessage = error.message
    } else {
      console.log(`[login] Error occured. (not VtecxNextError) ${error}`)
      resStatus = 503
      resMessage = 'Error occured.'
    }
  }
  const resJson = {feed : {'title' : resMessage}}
  res.status(resStatus).json(resJson)
}

export default handler
