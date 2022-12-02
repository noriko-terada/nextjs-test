import { NextApiRequest, NextApiResponse } from 'next'

// 型定義
type requestVtecx = (method:string, url:string, req:NextApiRequest, body:any) => Promise<Response>
type fetchVtecx = (method:string, url:string, headers:any, body:any) => Promise<Response>
type checkXRequestedWith = (req:NextApiRequest, res:NextApiResponse) => boolean
type log = (req:NextApiRequest, message: string, title?: string, subtitle?: string) => Promise<boolean>
type uid = (req:NextApiRequest) => Promise<string>

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
 * register a log entry
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
  const response = await requestVtecx(method, url, req, JSON.stringify(feed))

  console.log(`[vtecxnext log] response. status=${response.status}`)
  // レスポンスのエラーチェック
  await checkVtecxResponse(response)
  // 正常処理
  return true
}

/**
 * get login uid
 * @param req request
 * @return uid
 */
 export const uid = async (req:NextApiRequest) => {
  console.log('[vtecxnext uid] start.')
  const method = 'GET'
  const url = '/d/?_uid'
  //return requestVtecx(method, url, req, null)
  /* 
  let uid = undefined
  if (response) {
    const feed = await response.json()
    if (feed) {
      uid = feed.title
    }
  }
  return uid
  */
  const response = await requestVtecx(method, url, req, null)
  console.log(`[vtecxnext uid] response=${response}`)
  // レスポンスのエラーチェック
  await checkVtecxResponse(response)
  // 戻り値
  const data = await response.json()
  return data.feed.title
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
  console.log(`[vtecxnext fetchVtecx] url=${process.env.VTECX_URL}${url}`)
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

const checkVtecxResponse = async (response:Response) => {
  if (response.status < 400) {
    return
  } else {
    // エラー
    const data = await response.json()
    let message
    if (data && data.feed) {
      message = data.feed.title
    }
    message = message ? message : `stauts=${response.status}`
    throw new VtecxNextError(response.status, message)
  }
}

/**
 * Error returned from vte.cx
 */
export class VtecxNextError extends Error {
  status:number
  constructor(status:number, message:string) {
    super(message)
    this.name = 'VtecxNextError'
    this.status = status
  }
}