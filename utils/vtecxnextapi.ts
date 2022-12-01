import { NextApiRequest, NextApiResponse } from 'next'

// 型定義
type requestVtecx = (method:string, url:string, req:NextApiRequest, body:any) => Promise<Response>
type fetchVtecx = (method:string, url:string, headers:any, body:any) => Promise<Response>
type checkXRequestedWith = (req:NextApiRequest, res:NextApiResponse) => boolean
type log = (req:NextApiRequest, message: string, title?: string, subtitle?: string) => Promise<Response>


/**
 * X-Requested-With header check.
 * If not specified, set status 417 to the response.
 * @param req request
 * @param res response
 * @returns false if no X-Requested-With header is specified
 */
export const checkXRequestedWith = (req:NextApiRequest, res:NextApiResponse) => {
  // X-Requested-With ヘッダがない場合エラー
  if (!req.headers['x-requested-with']) {
    res.status(417).json(undefined)
    return false
  }
  return true
}

/**
 * Register a log entry
 * @param req request
 * @param message message
 * @param title title
 * @param subtitle subtitle
 */
export const log = async (req:NextApiRequest, message: string, title?: string, subtitle?: string) => {
  const logTitle = title ? title : 'JavaScript'
  const logSubtitle = subtitle ? subtitle : 'INFO'
  const feed = [{'title' : logTitle, 'subtitle' : logSubtitle, 'summary' : message}]

  const method = 'POST'
  const url = `/p/?_log`
  return requestVtecx(method, url, req, JSON.stringify(feed))
}


/**
 * vte.cxへリクエスト
 * @param method メソッド
 * @param url サーブレットパス以降のURL
 * @param req リクエスト。認証情報設定に使用。
 * @param body リクエストデータ
 * @returns promise
 */
const requestVtecx = async (method:string, url:string, req:NextApiRequest, body:any) => {
  // cookieの値をvte.cxへのリクエストヘッダに設定
  const cookie = req.headers['cookie']
  const headers = {'Cookie' : cookie}
  return fetchVtecx(method, url, headers, body)
}

/**
 * vte.cxへリクエスト
 * @param method メソッド
 * @param url サーブレットパス以降のURL
 * @param headers リクエストヘッダ。連想配列で指定。
 * @param body リクエストデータ
 * @returns promise
 */
const fetchVtecx = async (method:string, url:string, headers:any, body:any) => {
  console.log(`[fetchVtecx] url=${process.env.VTECX_URL}${url}`)
  headers['X-Requested-With'] = 'XMLHttpRequest'
  const apiKey = process.env.VTECX_APIKEY
  if (apiKey) {
    headers['Authorization'] = `APIKey ${apiKey}`
  }
  const requestInit:RequestInit = {
    body: body,
    method: method,
    headers: headers
  }

  return fetch(`${process.env.VTECX_URL}${url}`, requestInit)
}
