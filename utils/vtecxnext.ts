import { IncomingMessage, ServerResponse } from 'http'
import * as nodeurl from 'url'

// 型定義
// 認証のため各関数にリクエスト(IncomingMessage)が必要。
// セッション維持のため各関数にレスポンス(ServerResponse)が必要。
type requestVtecx = (method:string, url:string, req:IncomingMessage, body:any) => Promise<Response>
type fetchVtecx = (method:string, url:string, headers:any, body:any) => Promise<Response>
type checkXRequestedWith = (req:IncomingMessage, res:ServerResponse) => boolean
type login = (req:IncomingMessage, res:ServerResponse, wsse:string, reCaptchaToken?:string) => Promise<boolean>
type logout = (req:IncomingMessage, res:ServerResponse) => Promise<boolean>
type uid = (req:IncomingMessage, res:ServerResponse) => Promise<string>
type whoami = (req:IncomingMessage, res:ServerResponse) => Promise<any>
type isLoggedin = (req:IncomingMessage, res:ServerResponse) => Promise<boolean>
type log = (req:IncomingMessage, res:ServerResponse, message: string, title?:string, subtitle?:string) => Promise<boolean>
type getEntry = (req:IncomingMessage, res:ServerResponse, uri:string) => Promise<any>
type getFeed = (req:IncomingMessage, res:ServerResponse, uri:string) => Promise<any>
type count = (req:IncomingMessage, res:ServerResponse, uri:string) => Promise<string>
type post = (req:IncomingMessage, res:ServerResponse, feed:any, uri?:string) => Promise<any>
type put = (req:IncomingMessage, res:ServerResponse, feed:any) => Promise<any>
type deleteEntry = (req:IncomingMessage, res:ServerResponse, uri:string, revision?:number) => Promise<boolean>

/**
 * X-Requested-With header check.
 * If not specified, set status 417 to the response.
 * @param req request
 * @param res response
 * @return false if no X-Requested-With header is specified
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
  const response = await requestVtecx(method, url, req)
  console.log(`[vtecxnext logout] response=${response}`)
  // vte.cxからのset-cookieを転記
  setCookie(response, res)
  // レスポンスのエラーチェック
  await checkVtecxResponse(response)
  console.log(`[vtecxnext logout] checkVtecxResponse ok.`)
  // 戻り値
  const data = await getJson(response)
  console.log(`[vtecxnext logout] response message : ${data.feed.title}`)
  return true
}

/**
 * get login uid
 * @param req request
 * @param res response
 * @return uid
 */
 export const uid = async (req:IncomingMessage, res:ServerResponse) => {
  console.log('[vtecxnext uid] start.')
  const method = 'GET'
  const url = '/d/?_uid'
  const response = await requestVtecx(method, url, req)
  console.log(`[vtecxnext uid] response=${response}`)
  // vte.cxからのset-cookieを転記
  setCookie(response, res)
  // レスポンスのエラーチェック
  await checkVtecxResponse(response)
  // 戻り値
  const data = await getJson(response)
  return data.feed.title
}

/**
 * get login whoami
 * @param req request
 * @param res response
 * @return login user information
 */
 export const whoami = async (req:IncomingMessage, res:ServerResponse) => {
  console.log('[vtecxnext whoami] start.')
  const method = 'GET'
  const url = '/d/?_whoami'
  const response = await requestVtecx(method, url, req)
  console.log(`[vtecxnext whoami] response=${response}`)
  // vte.cxからのset-cookieを転記
  setCookie(response, res)
  // レスポンスのエラーチェック
  await checkVtecxResponse(response)
  // 戻り値
  return await getJson(response)
}

/**
 * whether you are logged in
 * @param req request
 * @param res response
 * @return true if logged in
 */
 export const isLoggedin = async (req:IncomingMessage, res:ServerResponse) => {
  console.log('[vtecxnext isLoggedin] start.')
  try {
    await uid(req, res)
    return true
  } catch (error) {
    return false
  }
}

/**
 * register a log entry
 * @param req request
 * @param res response
 * @param message message
 * @param title title
 * @param subtitle subtitle
 * @return true if successful
 */
 export const log = async (req:IncomingMessage, res:ServerResponse, message:string, title?:string, subtitle?:string) => {
  const logTitle = title ? title : 'JavaScript'
  const logSubtitle = subtitle ? subtitle : 'INFO'
  const feed = [{'title' : logTitle, 'subtitle' : logSubtitle, 'summary' : message}]

  const method = 'POST'
  const url = `/p/?_log`
  const response = await requestVtecx(method, url, req, JSON.stringify(feed))

  console.log(`[vtecxnext log] response. status=${response.status}`)
  // vte.cxからのset-cookieを転記
  setCookie(response, res)
  // レスポンスのエラーチェック
  await checkVtecxResponse(response)
  // 正常処理
  return true
}

/**
 * get entry
 * @param req request
 * @param res response
 * @param uri key
 * @return entry
 */
 export const getEntry = async (req:IncomingMessage, res:ServerResponse, uri:string) => {
  console.log('[vtecxnext getEntry] start.')
  // キー入力値チェック
  checkUri(uri)
  // エントリー取得
  const method = 'GET'
  const url = `/p${uri}?e`
  const response = await requestVtecx(method, url, req)
  console.log(`[vtecxnext getEntry] response=${response}`)
  // vte.cxからのset-cookieを転記
  setCookie(response, res)
  // レスポンスのエラーチェック
  await checkVtecxResponse(response)
  // 戻り値
  return await getJson(response)
}

/**
 * get entry
 * @param req request
 * @param res response
 * @param uri key and conditions
 * @return feed (entry array)
 */
 export const getFeed = async (req:IncomingMessage, res:ServerResponse, uri:string) => {
  console.log('[vtecxnext getFeed] start.')
  // キー入力値チェック
  checkUri(uri)
  // エントリー取得
  const method = 'GET'
  const url = `/p${uri}${uri.includes('?') ? '&' : '?'}f`
  const response = await requestVtecx(method, url, req)
  console.log(`[vtecxnext getFeed] response=${response}`)
  // vte.cxからのset-cookieを転記
  setCookie(response, res)
  // レスポンスのエラーチェック
  await checkVtecxResponse(response)
  // 戻り値
  return await getJson(response)
}

/**
 * get count
 * @param req request
 * @param res response
 * @param uri key and conditions
 * @return count
 */
 export const count = async (req:IncomingMessage, res:ServerResponse, uri:string) => {
  console.log('[vtecxnext count] start.')
  // キー入力値チェック
  checkUri(uri)
  // エントリー取得
  const method = 'GET'
  const url = `/p${uri}${uri.includes('?') ? '&' : '?'}c`
  const response = await requestVtecx(method, url, req)
  console.log(`[vtecxnext count] response=${response}`)
  // vte.cxからのset-cookieを転記
  setCookie(response, res)
  // レスポンスのエラーチェック
  await checkVtecxResponse(response)
  // 戻り値
  const data = await getJson(response)
  return data.feed.title
}

/**
 * register entries
 * @param req request
 * @param res response
 * @param feed entries
 * @param uri parent key if not specified in entry
 * @return registed entries
 */
 export const post = async (req:IncomingMessage, res:ServerResponse, feed:any, uri?:string) => {
  console.log(`[vtecxnext post] start. feed=${feed}`)
  if (uri) {
    // 値の設定がある場合、キー入力値チェック
    checkUri(uri)
  }
  // vte.cxへリクエスト
  const method = 'POST'
  const url = `/p${uri ? uri : '/'}?e`
  const response = await requestVtecx(method, url, req, feed)
  console.log(`[vtecxnext post] response. status=${response.status}`)
  // vte.cxからのset-cookieを転記
  setCookie(response, res)
  // レスポンスのエラーチェック
  await checkVtecxResponse(response)
  return await getJson(response)
}

/**
 * update entries
 * @param req request
 * @param res response
 * @param feed entries
 * @return updated entries
 */
 export const put = async (req:IncomingMessage, res:ServerResponse, feed:any) => {
  console.log(`[vtecxnext put] start. feed=${feed}`)
  // vte.cxへリクエスト
  const method = 'PUT'
  const url = `/p/?e`
  const response = await requestVtecx(method, url, req, feed)
  console.log(`[vtecxnext put] response. status=${response.status}`)
  // vte.cxからのset-cookieを転記
  setCookie(response, res)
  // レスポンスのエラーチェック
  await checkVtecxResponse(response)
  return await getJson(response)
}

/**
 * delete entry
 * @param req request
 * @param res response
 * @param uri key
 * @param revision number of revision
 * @return true if successful
 */
 export const deleteEntry = async (req:IncomingMessage, res:ServerResponse, uri:string, revision?:number) => {
  console.log(`[vtecxnext deleteEntry] start. uri=${uri} revision=${revision}`)
  // キー入力値チェック
  checkUri(uri)
  // vte.cxへリクエスト
  const method = 'DELETE'
  const param = revision ? `&r=${revision}` : ''
  const url = `/p${uri}?e${param}`
  const response = await requestVtecx(method, url, req)
  console.log(`[vtecxnext deleteEntry] response. status=${response.status}`)
  // vte.cxからのset-cookieを転記
  setCookie(response, res)
  // レスポンスのエラーチェック
  await checkVtecxResponse(response)
  return true
}

/**
 * delete folder
 * @param req request
 * @param res response
 * @param uri parent key
 * @return true if successful
 */
 export const deleteFolder = async (req:IncomingMessage, res:ServerResponse, uri:string) => {
  console.log(`[vtecxnext deleteFolder] start. uri=${uri}`)
  // キー入力値チェック
  checkUri(uri)
  // vte.cxへリクエスト
  const method = 'DELETE'
  const url = `/p${uri}?_rf`
  const response = await requestVtecx(method, url, req)
  console.log(`[vtecxnext deleteFolder] response. status=${response.status}`)
  // vte.cxからのset-cookieを転記
  setCookie(response, res)
  // レスポンスのエラーチェック
  await checkVtecxResponse(response)
  return true
}

//---------------------------------------------
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

//---------------------------------------------
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
 * レスポンスデータをJSON形式で取得.
 * @param response レスポンス
 * @returns JSON
 */
const getJson = async (response:Response) => {
  // ステータスが204の場合nullを返す。
  if (response.status === 204) {
    return null
  }
  try {
    return await response.json()
  } catch (e) {
    if (e instanceof Error) {
      const error:Error = e
      console.log(`[getJson] Error occured. ${error.name}: ${error.message}`)
    }
    return null
  }
}
