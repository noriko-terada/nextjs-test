import { IncomingMessage, ServerResponse } from 'http'
import * as nodeurl from 'url'

// 型定義
type requestVtecx = (method:string, url:string, req:IncomingMessage, body:any) => Promise<Response>
type fetchVtecx = (method:string, url:string, headers:any, body:any) => Promise<Response>
type checkXRequestedWith = (req:IncomingMessage, res:ServerResponse) => boolean
type login = (req:IncomingMessage, res:ServerResponse, wsse:string, reCaptchaToken?:string) => Promise<boolean>
type logout = (req:IncomingMessage, res:ServerResponse) => Promise<boolean>
type uid = (req:IncomingMessage) => Promise<string>
type whoami = (req:IncomingMessage) => Promise<any>
type isLoggedin = (req:IncomingMessage) => Promise<boolean>
type log = (req:IncomingMessage, message: string, title?: string, subtitle?: string) => Promise<boolean>
type getEntry = (req:IncomingMessage, uri:string) => Promise<any>

/**
 * X-Requested-With header check.
 * If not specified, set status 417 to the response.
 * @param req request
 * @param res response
 * @returns false if no X-Requested-With header is specified
 */
export const checkXRequestedWith = (req:IncomingMessage, res:ServerResponse) => {
  if (!req.headers['x-requested-with']) {
    res.writeHead(417)
    res.end()
    return false
  }
  return true
}

/**
 * login.
 * Request authentication with WSSE.
 * If the login is successful, sets the authentication information in a cookie.
 * @param req request
 * @param res response
 * @param wsse WSSE
 * @param reCaptchaToken reCAPTCHA token
 * @return true if log in has been successful.
 */
 export const login = async (req:IncomingMessage, res:ServerResponse, wsse:string, reCaptchaToken?:string) => {
  console.log('[vtecxnext login] start.')
  // 入力チェック
  checkNotNull(wsse, 'Authentication information')
  // ログイン
  // reCAPTCHA tokenは任意
  const param = reCaptchaToken ? `&g-recaptcha-token=${reCaptchaToken}` : ''
  const method = 'GET'
  const url = `/d/?_login${param}`
  const headers = {'X-WSSE' : `${wsse}`}
  const response = await fetchVtecx(method, url, headers)
  const feed = await response.json()
  // vte.cxからのset-cookieを転記
  setCookie(response, res)
  // レスポンスのエラーチェック
  let isLoggedin
  if (response.status < 400) {
    isLoggedin = true
  } else {
    isLoggedin = false
  }
  console.log(`[vtecxnext login] end. status=${response.status} message=${feed.title}`)
  return isLoggedin
}

/**
 * logout.
 * If the logout is successful, delete the authentication information in a cookie.
 * @param req request
 * @param res response
 * @return true if log out has been successful.
 */
 export const logout = async (req:IncomingMessage, res:ServerResponse) => {
  console.log('[vtecxnext logout] start.')
  const method = 'GET'
  const url = '/d/?_logout'
  const response = await requestVtecx(method, url, req, null)
  console.log(`[vtecxnext logout] response=${response}`)
  // vte.cxからのset-cookieを転記
  setCookie(response, res)
  // レスポンスのエラーチェック
  await checkVtecxResponse(response)
  console.log(`[vtecxnext logout] checkVtecxResponse ok.`)
  // 戻り値
  const data = await response.json()
  console.log(`[vtecxnext logout] response message : ${data.feed.title}`)
  return true
}

/**
 * get login uid
 * @param req request
 * @return uid
 */
 export const uid = async (req:IncomingMessage) => {
  console.log('[vtecxnext uid] start.')
  const method = 'GET'
  const url = '/d/?_uid'
  const response = await requestVtecx(method, url, req, null)
  console.log(`[vtecxnext uid] response=${response}`)
  // レスポンスのエラーチェック
  await checkVtecxResponse(response)
  // 戻り値
  const data = await response.json()
  return data.feed.title
}

/**
 * get login whoami
 * @param req request
 * @return login user information
 */
 export const whoami = async (req:IncomingMessage) => {
  console.log('[vtecxnext whoami] start.')
  const method = 'GET'
  const url = '/d/?_whoami'
  const response = await requestVtecx(method, url, req, null)
  console.log(`[vtecxnext whoami] response=${response}`)
  // レスポンスのエラーチェック
  await checkVtecxResponse(response)
  // 戻り値
  return await response.json()
}

/**
 * whether you are logged in
 * @param req request
 * @return true if logged in
 */
 export const isLoggedin = async (req:IncomingMessage) => {
  console.log('[vtecxnext isLoggedin] start.')
  try {
    await uid(req)
    return true
  } catch (error) {
    return false
  }
}

/**
 * register a log entry
 * @param req request
 * @param message message
 * @param title title
 * @param subtitle subtitle
 */
 export const log = async (req:IncomingMessage, message: string, title?: string, subtitle?: string) => {
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
 * get entry
 * @param req request
 * @param uri key
 * @return entry
 */
 export const getEntry = async (req:IncomingMessage, uri:string) => {
  console.log('[vtecxnext getEntry] start.')
  // キー入力値チェック
  checkUri(uri)
  // エントリー取得
  const method = 'GET'
  const url = `/p${uri}?e`
  const response = await requestVtecx(method, url, req, null)
  console.log(`[vtecxnext getEntry] response=${response}`)
  // レスポンスのエラーチェック
  await checkVtecxResponse(response)
  // 戻り値
  return await response.json()
}

/**
 * vte.cxへリクエスト
 * @param method メソッド
 * @param url サーブレットパス以降のURL
 * @param req リクエスト。認証情報設定に使用。
 * @param body リクエストデータ
 * @returns promise
 */
const requestVtecx = async (method:string, url:string, req:IncomingMessage, body?:any) => {
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
const fetchVtecx = async (method:string, url:string, headers:any, body?:any) => {
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

/**
 * vte.cxからのset-cookieを、ブラウザへレスポンスする。
 * @param response vte.cxからのレスポンス
 * @param res ブラウザへのレスポンス
 */
const setCookie = (response:Response, res:ServerResponse) => {
  const setCookieVal = response.headers.get('set-cookie')
  if (setCookieVal === '' || setCookieVal) {
    res.setHeader('set-cookie', setCookieVal)
  }
}

/**
 * vte.cxからのレスポンスが正常かエラーかをチェックする。
 * エラーの場合 VtecxNextError をスローする。
 * @param response Response
 * @returns 戻り値はなし。エラーの場合VtecxNextErrorをスロー。
 */
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
    message = message ? message : `status=${response.status}`
    throw new VtecxNextError(response.status, message)
  }
}

/**
 * 入力チェック
 * エラーの場合 VtecxNextError をスローする。
 * @param str チェック値
 * @param name 項目名。エラーの場合メッセージに使用。
 * @returns 戻り値はなし。エラーの場合VtecxNextErrorをスロー。
 */
const checkNotNull = (str:string, name?:string) => {
  if (!str) {
    throw new VtecxNextError(400, `${name ? name : 'Key'} is required.`)
  }
}

/**
 * キーチェック。
 * 入力チェックと、先頭が/で始まっているかどうかチェックする。
 * エラーの場合 VtecxNextError をスローする。
 * @param str チェック値
 * @param name 項目名。エラーの場合メッセージに使用。
 * @returns 戻り値はなし。エラーの場合VtecxNextErrorをスロー。
 */
 const checkUri = (str:string, name?:string) => {
  checkNotNull(str, name)
  if (!str.startsWith('/')) {
    throw new VtecxNextError(400, `${name ? name : 'Key'} must start with a slash.`)
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
