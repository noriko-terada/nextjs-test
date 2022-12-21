import { IncomingMessage, ServerResponse } from 'http'
import * as nodeurl from 'url'
//import { SqlString } from 'sqlstring'
var SqlString = require('sqlstring')

// 型定義
// 認証のため各関数にリクエスト(IncomingMessage)が必要。
// セッション維持のため各関数にレスポンス(ServerResponse)が必要。
type requestVtecx = (method:string, url:string, req:IncomingMessage, body:any) => Promise<Response>
type fetchVtecx = (method:string, url:string, headers:any, body:any) => Promise<Response>
// ----
type checkXRequestedWith = (req:IncomingMessage, res:ServerResponse) => boolean
type sendMessage = (res:ServerResponse, statusCode:number, message:string) => boolean
type login = (req:IncomingMessage, res:ServerResponse, wsse:string, reCaptchaToken?:string) => Promise<boolean>
type logout = (req:IncomingMessage, res:ServerResponse) => Promise<boolean>
type uid = (req:IncomingMessage, res:ServerResponse) => Promise<string>
type whoami = (req:IncomingMessage, res:ServerResponse) => Promise<any>
type isLoggedin = (req:IncomingMessage, res:ServerResponse) => Promise<boolean>
type log = (req:IncomingMessage, res:ServerResponse, message: string, title?:string, subtitle?:string) => Promise<boolean>
type getEntry = (req:IncomingMessage, res:ServerResponse, uri:string) => Promise<any>
type getFeed = (req:IncomingMessage, res:ServerResponse, uri:string) => Promise<any>
type count = (req:IncomingMessage, res:ServerResponse, uri:string) => Promise<number>
type post = (req:IncomingMessage, res:ServerResponse, feed:any, uri?:string) => Promise<any>
type put = (req:IncomingMessage, res:ServerResponse, feed:any) => Promise<any>
type deleteEntry = (req:IncomingMessage, res:ServerResponse, uri:string, revision?:number) => Promise<boolean>
type deleteFolder = (req:IncomingMessage, res:ServerResponse, uri:string) => Promise<boolean>
type allocids = (req:IncomingMessage, res:ServerResponse, uri:string, num:number) => Promise<string>
type addids = (req:IncomingMessage, res:ServerResponse, uri:string, num:number) => Promise<number>
type getids = (req:IncomingMessage, res:ServerResponse, uri:string) => Promise<number>
type setids = (req:IncomingMessage, res:ServerResponse, uri:string, num:number) => Promise<number>
type rangeids = (req:IncomingMessage, res:ServerResponse, uri:string, range:string) => Promise<string>
type getRangeids = (req:IncomingMessage, res:ServerResponse, uri:string) => Promise<string>
type setSessionFeed = (req:IncomingMessage, res:ServerResponse, name:string, feed:any) => Promise<boolean>
type setSessionEntry = (req:IncomingMessage, res:ServerResponse, name:string, entry:any) => Promise<boolean>
type setSessionString = (req:IncomingMessage, res:ServerResponse, name:string, str:string) => Promise<boolean>
type setSessionLong = (req:IncomingMessage, res:ServerResponse, name:string, num:number) => Promise<boolean>
type incrementSession = (req:IncomingMessage, res:ServerResponse, name:string, num:number) => Promise<number>
type deleteSessionFeed = (req:IncomingMessage, res:ServerResponse, name:string) => Promise<boolean>
type deleteSessionEntry = (req:IncomingMessage, res:ServerResponse, name:string) => Promise<boolean>
type deleteSessionString = (req:IncomingMessage, res:ServerResponse, name:string) => Promise<boolean>
type deleteSessionLong = (req:IncomingMessage, res:ServerResponse, name:string) => Promise<boolean>
type getSessionFeed = (req:IncomingMessage, res:ServerResponse, name:string) => Promise<any>
type getSessionEntry = (req:IncomingMessage, res:ServerResponse, name:string) => Promise<any>
type getSessionString = (req:IncomingMessage, res:ServerResponse, name:string) => Promise<string>
type getSessionLong = (req:IncomingMessage, res:ServerResponse, name:string) => Promise<number>
type pagination = (req:IncomingMessage, res:ServerResponse, uri:string, pagerange:string) => Promise<any>
type getPage = (req:IncomingMessage, res:ServerResponse, uri:string, num:number) => Promise<any>
type postBQ = (req:IncomingMessage, res:ServerResponse, feed:any, async?:boolean, tablenames?:any) => Promise<boolean>
type deleteBQ = (req:IncomingMessage, res:ServerResponse, keys:string[], async?:boolean, tablenames?:any) => Promise<boolean>
type getBQ = (req:IncomingMessage, res:ServerResponse, sql:string, parent?:string) => Promise<any>
type getBQCsv = (req:IncomingMessage, res:ServerResponse, sql:string, values?:any[], filename?:string, parent?:string) => Promise<boolean>
type toPdf = (req:IncomingMessage, res:ServerResponse, htmlTemplate:string, filename?:string) => Promise<boolean>
type putSignature = (req:IncomingMessage, res:ServerResponse, uri:string, revision?:number) => Promise<any>
type putSignatures = (req:IncomingMessage, res:ServerResponse, feed:any) => Promise<any>
type deleteSignature = (req:IncomingMessage, res:ServerResponse, uri:string, revision?:number) => Promise<boolean>
type checkSignature = (req:IncomingMessage, res:ServerResponse, uri:string) => Promise<boolean>
type sendMail = (req:IncomingMessage, res:ServerResponse, entry:any, to:string[], cc?:string[], bcc?:string[], attachments?:string[]) => Promise<boolean>
type pushNotification = (req:IncomingMessage, res:ServerResponse, message:string, to:string[], title?:string, subtitle?:string, imageUrl?:string, data?:any) => Promise<boolean>
type setMessageQueueStatus = (req:IncomingMessage, res:ServerResponse, flag:boolean, channel:string) => Promise<boolean>
type setMessageQueue = (req:IncomingMessage, res:ServerResponse, feed:any, channel:string) => Promise<boolean>
type getMessageQueue = (req:IncomingMessage, res:ServerResponse, channel:string) => Promise<any>
type joinGroup = (req:IncomingMessage, res:ServerResponse, group:string, selfid:string) => Promise<any>
type leaveGroup = (req:IncomingMessage, res:ServerResponse, group:string) => Promise<boolean>

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
 * Sends an feed response(including message) to the client using the specified status.
 * @param res response
 * @param statusCode status code
 * @param message message
 * @return true
 */
 export const sendMessage = (res:ServerResponse, statusCode:number, message:string) => {
  const resJson = {'feed' : {'title' : message}}
  res.writeHead(statusCode)
  res.end(JSON.stringify(resJson))
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
  // vte.cxへリクエスト
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
  // vte.cxへリクエスト
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
 * @param req request (for authentication)
 * @param res response (for authentication)
 * @return login user information
 */
 export const whoami = async (req:IncomingMessage, res:ServerResponse) => {
  console.log('[vtecxnext whoami] start.')
  // vte.cxへリクエスト
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
 * @param req request (for authentication)
 * @param res response (for authentication)
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
 * @param req request (for authentication)
 * @param res response (for authentication)
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
 * @param req request (for authentication)
 * @param res response (for authentication)
 * @param uri key
 * @return entry
 */
 export const getEntry = async (req:IncomingMessage, res:ServerResponse, uri:string) => {
  console.log('[vtecxnext getEntry] start.')
  // キー入力値チェック
  checkUri(uri)
  // vte.cxへリクエスト
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
 * @param req request (for authentication)
 * @param res response (for authentication)
 * @param uri key and conditions
 * @return feed (entry array)
 */
 export const getFeed = async (req:IncomingMessage, res:ServerResponse, uri:string) => {
  console.log('[vtecxnext getFeed] start.')
  // キー入力値チェック
  checkUri(uri)
  // vte.cxへリクエスト
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
 * @param req request (for authentication)
 * @param res response (for authentication)
 * @param uri key and conditions
 * @return count
 */
 export const count = async (req:IncomingMessage, res:ServerResponse, uri:string) => {
  console.log('[vtecxnext count] start.')
  // キー入力値チェック
  checkUri(uri)
  // vte.cxへリクエスト
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
  return data.feed.title ? Number(data.feed.title) : null
}

/**
 * register entries
 * @param req request (for authentication)
 * @param res response (for authentication)
 * @param feed entries (JSON)
 * @param uri parent key if not specified in entry
 * @return registed entries
 */
export const post = async (req:IncomingMessage, res:ServerResponse, feed:any, uri?:string) => {
  console.log(`[vtecxnext post] start. feed=${feed}`)
  // 入力チェック
  checkNotNull(feed, 'Feed')
  if (uri) {
    // 値の設定がある場合、キー入力値チェック
    checkUri(uri)
  }
  // vte.cxへリクエスト
  const method = 'POST'
  const url = `/p${uri ? uri : '/'}?e`
  const response = await requestVtecx(method, url, req, JSON.stringify(feed))
  console.log(`[vtecxnext post] response. status=${response.status}`)
  // vte.cxからのset-cookieを転記
  setCookie(response, res)
  // レスポンスのエラーチェック
  await checkVtecxResponse(response)
  return await getJson(response)
}

/**
 * update entries
 * @param req request (for authentication)
 * @param res response (for authentication)
 * @param feed entries (JSON)
 * @return updated entries
 */
 export const put = async (req:IncomingMessage, res:ServerResponse, feed:any) => {
  console.log(`[vtecxnext put] start. feed=${feed}`)
  // 入力チェック
  checkNotNull(feed, 'Feed')
  // vte.cxへリクエスト
  const method = 'PUT'
  const url = `/p/?e`
  const response = await requestVtecx(method, url, req, JSON.stringify(feed))
  console.log(`[vtecxnext put] response. status=${response.status}`)
  // vte.cxからのset-cookieを転記
  setCookie(response, res)
  // レスポンスのエラーチェック
  await checkVtecxResponse(response)
  return await getJson(response)
}

/**
 * delete entry
 * @param req request (for authentication)
 * @param res response (for authentication)
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
 * @param req request (for authentication)
 * @param res response (for authentication)
 * @param uri parent key
 * @param async execute async
 * @return true if successful
 */
 export const deleteFolder = async (req:IncomingMessage, res:ServerResponse, uri:string, async?:boolean) => {
  console.log(`[vtecxnext deleteFolder] start. uri=${uri} async=${async}`)
  // キー入力値チェック
  checkUri(uri)
  // vte.cxへリクエスト
  const method = 'DELETE'
  const url = `/p${uri}?_rf${async ? '&_async' : ''}`
  const response = await requestVtecx(method, url, req)
  console.log(`[vtecxnext deleteFolder] response. status=${response.status}`)
  // vte.cxからのset-cookieを転記
  setCookie(response, res)
  // レスポンスのエラーチェック
  await checkVtecxResponse(response)
  return true
}

/**
 * allocate numbers
 * @param req request (for authentication)
 * @param res response (for authentication)
 * @param uri key
 * @param num number to allocate
 * @return allocated numbers. comma separated if multiple.
 */
 export const allocids = async (req:IncomingMessage, res:ServerResponse, uri:string, num:number) => {
  console.log('[vtecxnext allocids] start.')
  // キー入力値チェック
  checkUri(uri)
  checkNotNull(num, 'number to allocate')
  // vte.cxへリクエスト
  const method = 'GET'
  const url = `/p${uri}?_allocids=${num}`
  const response = await requestVtecx(method, url, req)
  console.log(`[vtecxnext allocids] response=${response}`)
  // vte.cxからのset-cookieを転記
  setCookie(response, res)
  // レスポンスのエラーチェック
  await checkVtecxResponse(response)
  // 戻り値
  const data = await getJson(response)
  return data.feed.title
}

/**
 * add a number
 * @param req request (for authentication)
 * @param res response (for authentication)
 * @param uri key
 * @param num number to add
 * @return added number
 */
 export const addids = async (req:IncomingMessage, res:ServerResponse, uri:string, num:number) => {
  console.log('[vtecxnext addids] start.')
  // キー入力値チェック
  checkUri(uri)
  checkNotNull(num, 'number to add')
  // vte.cxへリクエスト
  const method = 'PUT'
  const url = `/p${uri}?_addids=${num}`
  const response = await requestVtecx(method, url, req)
  console.log(`[vtecxnext addids] response=${response}`)
  // vte.cxからのset-cookieを転記
  setCookie(response, res)
  // レスポンスのエラーチェック
  await checkVtecxResponse(response)
  // 戻り値
  const data = await getJson(response)
  return data.feed.title ? Number(data.feed.title) : null
}

/**
 * get a added number
 * @param req request (for authentication)
 * @param res response (for authentication)
 * @param uri key
 * @return added number
 */
 export const getids = async (req:IncomingMessage, res:ServerResponse, uri:string) => {
  console.log('[vtecxnext getids] start.')
  // キー入力値チェック
  checkUri(uri)
  // vte.cxへリクエスト
  const method = 'GET'
  const url = `/p${uri}?_getids`
  const response = await requestVtecx(method, url, req)
  console.log(`[vtecxnext getids] response=${response}`)
  // vte.cxからのset-cookieを転記
  setCookie(response, res)
  // レスポンスのエラーチェック
  await checkVtecxResponse(response)
  // 戻り値
  const data = await getJson(response)
  return data.feed.title ? Number(data.feed.title) : null
}

/**
 * set a number
 * @param req request (for authentication)
 * @param res response (for authentication)
 * @param uri key
 * @param num number to set
 * @return set number
 */
 export const setids = async (req:IncomingMessage, res:ServerResponse, uri:string, num:number) => {
  console.log('[vtecxnext setids] start.')
  // キー入力値チェック
  checkUri(uri)
  checkNotNull(num, 'number to set')
  // vte.cxへリクエスト
  const method = 'PUT'
  const url = `/p${uri}?_setids=${num}`
  const response = await requestVtecx(method, url, req)
  console.log(`[vtecxnext setids] response=${response}`)
  // vte.cxからのset-cookieを転記
  setCookie(response, res)
  // レスポンスのエラーチェック
  await checkVtecxResponse(response)
  // 戻り値
  const data = await getJson(response)
  return data.feed.title ? Number(data.feed.title) : null
}

/**
 * set a addition range
 * @param req request (for authentication)
 * @param res response (for authentication)
 * @param uri key
 * @param range addition range
 * @return addition range
 */
 export const rangeids = async (req:IncomingMessage, res:ServerResponse, uri:string, range:string) => {
  console.log(`[vtecxnext rangeids] start. range=${range}`)
  // 入力値チェック
  checkUri(uri)
  checkNotNull(range, 'range')
  // vte.cxへリクエスト
  const method = 'PUT'
  const url = `/p${uri}?_rangeids`
  const feed = {feed : {'title' : range}}
  const response = await requestVtecx(method, url, req, JSON.stringify(feed))
  console.log(`[vtecxnext rangeids] response=${response}`)
  // vte.cxからのset-cookieを転記
  setCookie(response, res)
  // レスポンスのエラーチェック
  await checkVtecxResponse(response)
  // 戻り値
  const data = await getJson(response)
  return data.feed.title
}

/**
 * get a addition range
 * @param req request (for authentication)
 * @param res response (for authentication)
 * @param uri key
 * @return addition range
 */
 export const getRangeids = async (req:IncomingMessage, res:ServerResponse, uri:string) => {
  console.log('[vtecxnext getrangeids] start.')
  // キー入力値チェック
  checkUri(uri)
  // vte.cxへリクエスト
  const method = 'GET'
  const url = `/p${uri}?_rangeids`
  const response = await requestVtecx(method, url, req)
  console.log(`[vtecxnext getrangeids] response=${response}`)
  // vte.cxからのset-cookieを転記
  setCookie(response, res)
  // レスポンスのエラーチェック
  await checkVtecxResponse(response)
  // 戻り値
  const data = await getJson(response)
  return data.feed.title
}

/**
 * set feed to session
 * @param req request (for authentication)
 * @param res response (for authentication)
 * @param name name
 * @param feed entries (JSON)
 * @return true if successful
 */
 export const setSessionFeed = async (req:IncomingMessage, res:ServerResponse, name:string, feed:any) => {
  console.log(`[vtecxnext setSessionFeed] start. name=${name} feed=${feed}`)
  // 入力チェック
  checkNotNull(name, 'Name')
  checkNotNull(feed, 'Feed')
  // vte.cxへリクエスト
  const method = 'PUT'
  const url = `/p/?_sessionfeed=${name}`
  const response = await requestVtecx(method, url, req, JSON.stringify(feed))
  console.log(`[vtecxnext setSessionFeed] response. status=${response.status}`)
  // vte.cxからのset-cookieを転記
  setCookie(response, res)
  // レスポンスのエラーチェック
  await checkVtecxResponse(response)
  return true
}

/**
 * set entry to session
 * @param req request (for authentication)
 * @param res response (for authentication)
 * @param name name
 * @param entry entry (JSON)
 * @return true if successful
 */
 export const setSessionEntry = async (req:IncomingMessage, res:ServerResponse, name:string, entry:any) => {
  console.log(`[vtecxnext setSessionEntry] start. name=${name} entry=${entry}`)
  // 入力チェック
  checkNotNull(name, 'Name')
  checkNotNull(entry, 'Entry')
  // vte.cxへリクエスト
  const method = 'PUT'
  const url = `/p/?_sessionentry=${name}`
  const feed = {feed : {'entry' : entry}}
  const response = await requestVtecx(method, url, req, JSON.stringify(feed))
  console.log(`[vtecxnext setSessionEntry] response. status=${response.status}`)
  // vte.cxからのset-cookieを転記
  setCookie(response, res)
  // レスポンスのエラーチェック
  await checkVtecxResponse(response)
  return true
}

/**
 * set string to session
 * @param req request (for authentication)
 * @param res response (for authentication)
 * @param name name
 * @param str string
 * @return true if successful
 */
 export const setSessionString = async (req:IncomingMessage, res:ServerResponse, name:string, str:string) => {
  console.log(`[vtecxnext setSessionString] start. name=${name} str=${str}`)
  // 入力チェック
  checkNotNull(name, 'Name')
  checkNotNull(str, 'String')
  // vte.cxへリクエスト
  const method = 'PUT'
  const url = `/p/?_sessionstring=${name}`
  const feed = {feed : {'title' : str}}
  const response = await requestVtecx(method, url, req, JSON.stringify(feed))
  console.log(`[vtecxnext setSessionString] response. status=${response.status}`)
  // vte.cxからのset-cookieを転記
  setCookie(response, res)
  // レスポンスのエラーチェック
  await checkVtecxResponse(response)
  return true
}

/**
 * set number to session
 * @param req request (for authentication)
 * @param res response (for authentication)
 * @param name name
 * @param num number
 * @return true if successful
 */
 export const setSessionLong = async (req:IncomingMessage, res:ServerResponse, name:string, num:number) => {
  console.log(`[vtecxnext setSessionLong] start. name=${name} num=${num}`)
  // 入力チェック
  checkNotNull(name, 'Name')
  checkNotNull(num, 'Number')
  // vte.cxへリクエスト
  const method = 'PUT'
  const url = `/p/?_sessionlong=${name}`
  const feed = {feed : {'title' : String(num)}}
  const response = await requestVtecx(method, url, req, JSON.stringify(feed))
  console.log(`[vtecxnext setSessionLong] response. status=${response.status}`)
  // vte.cxからのset-cookieを転記
  setCookie(response, res)
  // レスポンスのエラーチェック
  await checkVtecxResponse(response)
  return true
}

/**
 * add number in session
 * @param req request (for authentication)
 * @param res response (for authentication)
 * @param name name
 * @param num number to add
 * @return true if successful
 */
 export const incrementSession = async (req:IncomingMessage, res:ServerResponse, name:string, num:number) => {
  console.log(`[vtecxnext incrementSession] start. name=${name} num=${num}`)
  // 入力チェック
  checkNotNull(name, 'Name')
  checkNotNull(num, 'Number')
  // vte.cxへリクエスト
  const method = 'PUT'
  const url = `/p/?_sessionincr=${name}&_num=${num}`
  const response = await requestVtecx(method, url, req)
  console.log(`[vtecxnext incrementSession] response. status=${response.status}`)
  // vte.cxからのset-cookieを転記
  setCookie(response, res)
  // レスポンスのエラーチェック
  await checkVtecxResponse(response)
  // 戻り値
  const data = await getJson(response)
  return data.feed.title ? Number(data.feed.title) : null
}

/**
 * delete feed from session
 * @param req request (for authentication)
 * @param res response (for authentication)
 * @param name name
 * @return true if successful
 */
 export const deleteSessionFeed = async (req:IncomingMessage, res:ServerResponse, name:string) => {
  console.log(`[vtecxnext deleteSessionFeed] start. name=${name}`)
  // 入力チェック
  checkNotNull(name, 'Name')
  // vte.cxへリクエスト
  const method = 'DELETE'
  const url = `/p/?_sessionfeed=${name}`
  const response = await requestVtecx(method, url, req)
  console.log(`[vtecxnext deleteSessionFeed] response. status=${response.status}`)
  // vte.cxからのset-cookieを転記
  setCookie(response, res)
  // レスポンスのエラーチェック
  await checkVtecxResponse(response)
  return true
}

/**
 * delete entry from session
 * @param req request (for authentication)
 * @param res response (for authentication)
 * @param name name
 * @return true if successful
 */
 export const deleteSessionEntry = async (req:IncomingMessage, res:ServerResponse, name:string) => {
  console.log(`[vtecxnext deleteSessionEntry] start. name=${name}`)
  // 入力チェック
  checkNotNull(name, 'Name')
  // vte.cxへリクエスト
  const method = 'DELETE'
  const url = `/p/?_sessionentry=${name}`
  const response = await requestVtecx(method, url, req)
  console.log(`[vtecxnext deleteSessionEntry] response. status=${response.status}`)
  // vte.cxからのset-cookieを転記
  setCookie(response, res)
  // レスポンスのエラーチェック
  await checkVtecxResponse(response)
  return true
}

/**
 * delete string from session
 * @param req request (for authentication)
 * @param res response (for authentication)
 * @param name name
 * @return true if successful
 */
 export const deleteSessionString = async (req:IncomingMessage, res:ServerResponse, name:string) => {
  console.log(`[vtecxnext deleteSessionString] start. name=${name}`)
  // 入力チェック
  checkNotNull(name, 'Name')
  // vte.cxへリクエスト
  const method = 'DELETE'
  const url = `/p/?_sessionstring=${name}`
  const response = await requestVtecx(method, url, req)
  console.log(`[vtecxnext deleteSessionString] response. status=${response.status}`)
  // vte.cxからのset-cookieを転記
  setCookie(response, res)
  // レスポンスのエラーチェック
  await checkVtecxResponse(response)
  return true
}

/**
 * delete number from session
 * @param req request (for authentication)
 * @param res response (for authentication)
 * @param name name
 * @return true if successful
 */
 export const deleteSessionLong = async (req:IncomingMessage, res:ServerResponse, name:string) => {
  console.log(`[vtecxnext deleteSessionLong] start. name=${name}`)
  // 入力チェック
  checkNotNull(name, 'Name')
  // vte.cxへリクエスト
  const method = 'DELETE'
  const url = `/p/?_sessionlong=${name}`
  const response = await requestVtecx(method, url, req)
  console.log(`[vtecxnext deleteSessionLong] response. status=${response.status}`)
  // vte.cxからのset-cookieを転記
  setCookie(response, res)
  // レスポンスのエラーチェック
  await checkVtecxResponse(response)
  return true
}

/**
 * get feed from session
 * @param req request (for authentication)
 * @param res response (for authentication)
 * @param name name
 * @return feed
 */
 export const getSessionFeed = async (req:IncomingMessage, res:ServerResponse, name:string) => {
  console.log(`[vtecxnext getSessionFeed] start. name=${name}`)
  // 入力チェック
  checkNotNull(name, 'Name')
  // vte.cxへリクエスト
  const method = 'GET'
  const url = `/p/?_sessionfeed=${name}`
  const response = await requestVtecx(method, url, req)
  console.log(`[vtecxnext getSessionFeed] response. status=${response.status}`)
  // vte.cxからのset-cookieを転記
  setCookie(response, res)
  // レスポンスのエラーチェック
  await checkVtecxResponse(response)
  // 戻り値
  return await getJson(response)
}

/**
 * get entry from session
 * @param req request (for authentication)
 * @param res response (for authentication)
 * @param name name
 * @return entry
 */
 export const getSessionEntry = async (req:IncomingMessage, res:ServerResponse, name:string) => {
  console.log(`[vtecxnext getSessionEntry] start. name=${name}`)
  // 入力チェック
  checkNotNull(name, 'Name')
  // vte.cxへリクエスト
  const method = 'GET'
  const url = `/p/?_sessionentry=${name}`
  const response = await requestVtecx(method, url, req)
  console.log(`[vtecxnext getSessionEntry] response. status=${response.status}`)
  // vte.cxからのset-cookieを転記
  setCookie(response, res)
  // レスポンスのエラーチェック
  await checkVtecxResponse(response)
  // 戻り値
  return await getJson(response)
}

/**
 * get string from session
 * @param req request (for authentication)
 * @param res response (for authentication)
 * @param name name
 * @return string
 */
 export const getSessionString = async (req:IncomingMessage, res:ServerResponse, name:string) => {
  console.log(`[vtecxnext getSessionString] start. name=${name}`)
  // 入力チェック
  checkNotNull(name, 'Name')
  // vte.cxへリクエスト
  const method = 'GET'
  const url = `/p/?_sessionstring=${name}`
  const response = await requestVtecx(method, url, req)
  console.log(`[vtecxnext getSessionString] response. status=${response.status}`)
  // vte.cxからのset-cookieを転記
  setCookie(response, res)
  // レスポンスのエラーチェック
  await checkVtecxResponse(response)
  // 戻り値
  const data = await getJson(response)
  if (data) {
    return data.feed.title
  } else {
    return null
  }
}

/**
 * get number from session
 * @param req request (for authentication)
 * @param res response (for authentication)
 * @param name name
 * @return number
 */
 export const getSessionLong = async (req:IncomingMessage, res:ServerResponse, name:string) => {
  console.log(`[vtecxnext getSessionLong] start. name=${name}`)
  // 入力チェック
  checkNotNull(name, 'Name')
  // vte.cxへリクエスト
  const method = 'GET'
  const url = `/p/?_sessionlong=${name}`
  const response = await requestVtecx(method, url, req)
  console.log(`[vtecxnext getSessionLong] response. status=${response.status}`)
  // vte.cxからのset-cookieを転記
  setCookie(response, res)
  // レスポンスのエラーチェック
  await checkVtecxResponse(response)
  // 戻り値
  const data = await getJson(response)
  if (data) {
    return data.feed.title ? Number(data.feed.title) : null
  } else {
    return null
  }
}

/**
 * pagination
 * @param req request (for authentication)
 * @param res response (for authentication)
 * @param uri key and conditions
 * @param pagerange page range
 * @return feed Maximum number of pages in the specified page range, and total count.
 */
 export const pagination = async (req:IncomingMessage, res:ServerResponse, uri:string, pagerange:string) => {
  console.log('[vtecxnext pagination] start.')
  // キー入力値チェック
  checkUri(uri)
  // vte.cxへリクエスト
  const method = 'GET'
  const url = `/p${uri}${uri.includes('?') ? '&' : '?'}_pagination=${pagerange}`
  const response = await requestVtecx(method, url, req)
  console.log(`[vtecxnext pagination] response=${response}`)
  // vte.cxからのset-cookieを転記
  setCookie(response, res)
  // レスポンスのエラーチェック
  await checkVtecxResponse(response)
  // 戻り値
  return await getJson(response)
}

/**
 * get page
 * @param req request (for authentication)
 * @param res response (for authentication)
 * @param uri key and conditions
 * @param num page number
 * @return feed Maximum number of pages in the specified page range, and total count.
 */
 export const getPage = async (req:IncomingMessage, res:ServerResponse, uri:string, num:number) => {
  console.log('[vtecxnext getPage] start.')
  // 入力値チェック
  checkUri(uri)
  checkNotNull(num, 'page number')
  // vte.cxへリクエスト
  const method = 'GET'
  const url = `/p${uri}${uri.includes('?') ? '&' : '?'}n=${num}`
  const response = await requestVtecx(method, url, req)
  console.log(`[vtecxnext getPage] response=${response}`)
  // vte.cxからのset-cookieを転記
  setCookie(response, res)
  // レスポンスのエラーチェック
  await checkVtecxResponse(response)
  // 戻り値
  return await getJson(response)
}

/**
 * post data to bigquery
 * @param req request (for authentication)
 * @param res response (for authentication)
 * @param feed entries (JSON)
 * @param async execute async
 * @param tablenames key:entity's prop name, value:BigQuery table name
 * @return true if successful
 */
 export const postBQ = async (req:IncomingMessage, res:ServerResponse, feed:any, async?:boolean, tablenames?:any) => {
  console.log(`[vtecxnext postBQ] start. async=${async} feed=${feed}`)
  // 入力チェック
  checkNotNull(feed, 'Feed')
  // リクエストデータ
  const reqFeed = 'feed' in feed ? feed : {'feed' : {'entry' : feed}}
  // テーブル名の指定がある場合は指定
  const tablenamesStr = editBqTableNames(tablenames)
  if (tablenamesStr) {
    reqFeed.feed['title'] = tablenamesStr
  }
  // vte.cxへリクエスト
  const method = 'POST'
  const url = `/p/?_bq${async ? '&_async' : ''}`
  const response = await requestVtecx(method, url, req, JSON.stringify(reqFeed))
  console.log(`[vtecxnext postBQ] response. status=${response.status}`)
  // vte.cxからのset-cookieを転記
  setCookie(response, res)
  // レスポンスのエラーチェック
  await checkVtecxResponse(response)
  return true
}

/**
 * delete data from bigquery
 * @param req request (for authentication)
 * @param res response (for authentication)
 * @param keys delete keys
 * @param async execute async
 * @param tablenames key:entity's prop name, value:BigQuery table name
 * @return true if successful
 */
 export const deleteBQ = async (req:IncomingMessage, res:ServerResponse, keys:string[], async?:boolean, tablenames?:any) => {
  console.log(`[vtecxnext deleteBQ] start. async=${async} keys=${keys}`)
  // 入力チェック
  checkNotNull(keys, 'Key')
  // テーブル名の指定がある場合は指定
  const tablenamesStr = editBqTableNames(tablenames)
  // キーを feed.link.___href にセットする
  const links = []
  let idx = 0
  for (const key of keys) {
    console.log(`[vtecxnext deleteBQ] key=${key}`)
    links[idx] = {'___href' : key}
    idx++
  }
  const feed:any = {'feed': {}}
  if (tablenamesStr) {
    feed.feed['title'] = tablenamesStr
  }
  feed.feed['link'] = links
  console.log(`[vtecxnext deleteBQ] feed=${feed}`)
  // vte.cxへリクエスト
  const method = 'DELETE'
  const url = `/p/?_bq${async ? '&_async' : ''}`
  const response = await requestVtecx(method, url, req, JSON.stringify(feed))
  console.log(`[vtecxnext deleteBQ] response. status=${response.status}`)
  // vte.cxからのset-cookieを転記
  setCookie(response, res)
  // レスポンスのエラーチェック
  await checkVtecxResponse(response)
  return true
}

/**
 * query bigquery
 * @param req request (for authentication)
 * @param res response (for authentication)
 * @param sql query sql
 * @param values values of query arguments
 * @param parent parent name of result json
 * @return query results in JSON format
 */
 export const getBQ = async (req:IncomingMessage, res:ServerResponse, sql:string, values?:any[], parent?:string) => {
  console.log(`[vtecxnext getBQ] start. sql=${sql} values=${values}`)
  // 入力チェック
  checkNotNull(sql, 'Query SQL')
  // 引数生成
  const feed = editGetBqArgument(sql, values, parent)
  // vte.cxへリクエスト
  const method = 'PUT'
  const url = `/p/?_querybq`
  const response = await requestVtecx(method, url, req, JSON.stringify(feed))
  console.log(`[vtecxnext getBQ] response. status=${response.status}`)
  // vte.cxからのset-cookieを転記
  setCookie(response, res)
  console.log(`[vtecxnext getBQ] setCookie end.`)
  // レスポンスのエラーチェック
  await checkVtecxResponse(response)
  console.log(`[vtecxnext getBQ] checkVtecxResponse end.`)
  // 戻り値
  return await response.json()
}

/**
 * Search BigQuery and return results in CSV format.
 * @param req request (for authentication)
 * @param res response
 * @param sql query sql
 * @param values values of query arguments
 * @param filename file name of csv
 * @param parent parent name of result json
 * @return true
 */
 export const getBQCsv = async (req:IncomingMessage, res:ServerResponse, sql:string, values?:any[], filename?:string, parent?:string) => {
  console.log(`[vtecxnext getBQCsv] start. sql=${sql} values=${values}`)
  // 入力チェック
  checkNotNull(sql, 'Query SQL')
  // 引数生成
  const feed = editGetBqArgument(sql, values, parent)
  // vte.cxへリクエスト
  const method = 'PUT'
  const url = `/p/?_querybq&_csv${filename ? '=' + filename : ''}`
  const response = await requestVtecx(method, url, req, JSON.stringify(feed))
  console.log(`[vtecxnext getBQCsv] response. status=${response.status}`)
  // vte.cxからのset-cookieを転記
  setCookie(response, res)
  console.log(`[vtecxnext getBQCsv] setCookie end.`)
  // レスポンスのエラーチェック
  await checkVtecxResponse(response)
  console.log(`[vtecxnext getBQCsv] checkVtecxResponse end.`)
  // 戻り値
  const resData = await response.blob()
  setResponseHeaders(response, res)
  const csvData = await resData.arrayBuffer()
  res.end(csvData)
  return true
}

/**
 * Create PDF
 * @param req request (for authentication)
 * @param res response
 * @param htmlTemplate PDF layout
 * @param filename PDF file name
 * @return true
 */
 export const toPdf = async (req:IncomingMessage, res:ServerResponse, htmlTemplate:string, filename?:string) => {
  console.log(`[vtecxnext toPdf] start. htmlTemplate=${htmlTemplate} filename=${filename}`)
  // 入力チェック
  checkNotNull(htmlTemplate, 'PDF template')
  // vte.cxへリクエスト
  const method = 'PUT'
  const url = `/p/?_pdf${filename ? '=' + filename : ''}`
  const response = await requestVtecx(method, url, req, htmlTemplate)
  console.log(`[vtecxnext toPdf] response. status=${response.status}`)
  // vte.cxからのset-cookieを転記
  setCookie(response, res)
  console.log(`[vtecxnext toPdf] setCookie end.`)
  // レスポンスのエラーチェック
  await checkVtecxResponse(response)
  console.log(`[vtecxnext toPdf] checkVtecxResponse end.`)
  // 戻り値
  const resData = await response.blob()
  setResponseHeaders(response, res)
  const csvData:ArrayBuffer = await resData.arrayBuffer()
  res.end(new Uint8Array(csvData))
  return true
}

/**
 * put the signature of uri and revision.
 * @param req request (for authentication)
 * @param res response (for authentication)
 * @param uri key
 * @param revision revision
 * @return signed entry
 */
 export const putSignature = async (req:IncomingMessage, res:ServerResponse, uri:string, revision?:number) => {
  console.log('[vtecxnext putSignature] start.')
  // キー入力値チェック
  checkUri(uri)
  // vte.cxへリクエスト
  const method = 'PUT'
  const url = `/p${uri}?_signature${revision ? '&r=' + revision : ''}`
  const response = await requestVtecx(method, url, req)
  console.log(`[vtecxnext putSignature] response=${response}`)
  // vte.cxからのset-cookieを転記
  setCookie(response, res)
  // レスポンスのエラーチェック
  await checkVtecxResponse(response)
  // 戻り値
  return await getJson(response)
}

/**
 * puts the signature of uri and revision.
 * @param req request (for authentication)
 * @param res response (for authentication)
 * @param feed entries
 * @return signed entries
 */
 export const putSignatures = async (req:IncomingMessage, res:ServerResponse, feed:any) => {
  console.log('[vtecxnext putSignatures] start.')
  // 入力チェック
  checkNotNull(feed, 'Feed')
  // vte.cxへリクエスト
  const method = 'PUT'
  const url = `/p/?_signature`
  const response = await requestVtecx(method, url, req, JSON.stringify(feed))
  console.log(`[vtecxnext putSignatures] response=${response}`)
  // vte.cxからのset-cookieを転記
  setCookie(response, res)
  // レスポンスのエラーチェック
  await checkVtecxResponse(response)
  // 戻り値
  return await getJson(response)
}

/**
 * delete the signature.
 * @param req request (for authentication)
 * @param res response (for authentication)
 * @param uri key
 * @param revision revision
 * @return true if successful
 */
 export const deleteSignature = async (req:IncomingMessage, res:ServerResponse, uri:string, revision?:number) => {
  console.log('[vtecxnext deleteSignature] start.')
  // キー入力値チェック
  checkUri(uri)
  // vte.cxへリクエスト
  const method = 'DELETE'
  const url = `/p${uri}?_signature${revision ? '&r=' + revision : ''}`
  const response = await requestVtecx(method, url, req)
  console.log(`[vtecxnext deleteSignature] response=${response}`)
  // vte.cxからのset-cookieを転記
  setCookie(response, res)
  // レスポンスのエラーチェック
  await checkVtecxResponse(response)
  return true
}

/**
 * check the signature.
 * @param req request (for authentication)
 * @param res response (for authentication)
 * @param uri key
 * @return true if the signature is valid
 */
 export const checkSignature = async (req:IncomingMessage, res:ServerResponse, uri:string) => {
  console.log('[vtecxnext checkSignature] start.')
  // キー入力値チェック
  checkUri(uri)
  // vte.cxへリクエスト
  const method = 'GET'
  const url = `/p${uri}?_signature`
  const response = await requestVtecx(method, url, req)
  console.log(`[vtecxnext checkSignature] response=${response}`)
  // vte.cxからのset-cookieを転記
  setCookie(response, res)
  // レスポンスのエラーチェック
  await checkVtecxResponse(response)
  return true
}

/**
 * Send an mail (with attachments)
 * @param req request (for authentication)
 * @param res response (for authentication)
 * @param entry email contents
 * @param to email addresses to
 * @param cc email addresses cc
 * @param bcc email addresses bcc
 * @param attachments keys of attachment files
 * @return true if successful
 */
 export const sendMail = async (req:IncomingMessage, res:ServerResponse, entry:any, to:string[], cc?:string[], bcc?:string[], attachments?:string[]) => {
  console.log(`[vtecxnext sendMail] start. to=${to}`)
  // 入力チェック
  checkNotNull(entry, 'Entry')
  // 引数編集
  let links:any[] = []
  const linksTo = getLinks('to', to)
  console.log(`[vtecxnext sendMail] linksTo=${JSON.stringify(linksTo)}`)
  if (linksTo) {
    links = links.concat(linksTo)
  }
  if (cc) {
    const linksCc = getLinks('cc', cc)
    if (linksCc) {
      links = links.concat(linksCc)
    }
  }
  if (bcc) {
    const linksBcc = getLinks('bcc', bcc)
    if (linksBcc) {
      links = links.concat(linksBcc)
    }
  }
  if (attachments) {
    const linksAttachments = getLinks('attachment', attachments)
    if (linksAttachments) {
      links = links.concat(linksAttachments)
    }
  }
  console.log(`[vtecxnext sendMail] links = ${JSON.stringify(links)}`)
  let feed = {'feed' : {'entry' : [entry], 'link' : links}}
  console.log(`[vtecxnext sendMail] feed = ${JSON.stringify(feed)}`)
  // vte.cxへリクエスト
  const method = 'POST'
  const url = `/p/?_sendmail`
  const response = await requestVtecx(method, url, req, JSON.stringify(feed))
  console.log(`[vtecxnext sendMail] response. status=${response.status}`)
  // vte.cxからのset-cookieを転記
  setCookie(response, res)
  // レスポンスのエラーチェック
  await checkVtecxResponse(response)
  return true
}

/**
 * push notification to clients.
 * @param req request (for authentication)
 * @param res response (for authentication)
 * @param message message
 * @param to clients to
 * @param title title
 * @param subtitle subtitle (Expo)
 * @param imageUrl url of image (FCM)
 * @param data key value data (Expo)
 * @return true if successful
 */
 export const pushNotification = async (req:IncomingMessage, res:ServerResponse, message:string, to:string[], title?:string, subtitle?:string, imageUrl?:string, data?:any) => {
  console.log(`[vtecxnext pushNotification] start. to=${to}`)
  // 入力チェック
  checkNotNull(message, 'Message')
  checkNotNull(to, 'Destination')
  // 引数編集
  const links:any[] = []
  for (const destination of to) {
    const link = {'___rel' : 'to', '___href' : destination}
    links.push(link)
  }
  const categories:any[] = []
  if (imageUrl) {
    const category = {'___scheme' : 'imageurl', '___label' : imageUrl}
    categories.push(category)
  }
  if (data) {
    for (const name in data) {
      const category = {'___scheme' : name, '___label' : data[name]}
      categories.push(category)
    }
  }
  const content = {'______text' : message}
  const entry:any = {}
  if (title) {
    entry['title'] = title
  }
  if (subtitle) {
    entry['subtitle'] = subtitle
  }
  entry['content'] = content
  if (categories) {
    entry['category'] = categories
  }
  const feed = {'feed' : {
    'entry' : [entry],
    'link' : links}
  }
  console.log(`[vtecxnext pushNotification] feed = ${JSON.stringify(feed)}`)
  // vte.cxへリクエスト
  const method = 'POST'
  const url = `/p/?_pushnotification`
  const response = await requestVtecx(method, url, req, JSON.stringify(feed))
  console.log(`[vtecxnext pushNotification] response. status=${response.status}`)
  // vte.cxからのset-cookieを転記
  setCookie(response, res)
  // レスポンスのエラーチェック
  await checkVtecxResponse(response)
  return true
}

/**
 * set status of MessageQueue.
 * @param req request (for authentication)
 * @param res response (for authentication)
 * @param flag true if on, false if off
 * @param channel channel
 */
 export const setMessageQueueStatus = async (req:IncomingMessage, res:ServerResponse, flag:boolean, channel:string) => {
  console.log(`[vtecxnext setMessageQueueStatus] start. channel=${channel} flag=${flag}`)
  // キー入力値チェック
  checkUri(channel)
  // vte.cxへリクエスト
  const method = 'PUT'
  const url = `/p${channel}?_mqstatus=${flag ? 'true' : 'false'}`
  const response = await requestVtecx(method, url, req)
  console.log(`[vtecxnext setMessageQueueStatus] response=${response}`)
  // vte.cxからのset-cookieを転記
  setCookie(response, res)
  // レスポンスのエラーチェック
  await checkVtecxResponse(response)
  return true
}

/**
 * set MessageQueue.
 * @param req request (for authentication)
 * @param res response (for authentication)
 * @param feed entries (JSON)
 * @param channel channel
 * @return true if successful
 */
 export const setMessageQueue = async (req:IncomingMessage, res:ServerResponse, feed:any, channel:string) => {
  console.log(`[vtecxnext setMessageQueue] start. channel=${channel} feed=${feed}`)
  // 入力チェック
  checkUri(channel)
  checkNotNull(feed, 'Feed')
  // vte.cxへリクエスト
  const method = 'POST'
  const url = `/p${channel}?_mq`
  const response = await requestVtecx(method, url, req, JSON.stringify(feed))
  console.log(`[vtecxnext setMessageQueue] response. status=${response.status}`)
  // vte.cxからのset-cookieを転記
  setCookie(response, res)
  // レスポンスのエラーチェック
  await checkVtecxResponse(response)
  return true
}

/**
 * get feed from session
 * @param req request (for authentication)
 * @param res response (for authentication)
 * @param name name
 * @return feed
 */
 export const getMessageQueue = async (req:IncomingMessage, res:ServerResponse, channel:string) => {
  console.log(`[vtecxnext getMessageQueue] start. channel=${channel}`)
  // 入力チェック
  checkUri(channel)
  // vte.cxへリクエスト
  const method = 'GET'
  const url = `/p${channel}?_mq`
  const response = await requestVtecx(method, url, req)
  console.log(`[vtecxnext getMessageQueue] response. status=${response.status}`)
  // vte.cxからのset-cookieを転記
  setCookie(response, res)
  // レスポンスのエラーチェック
  await checkVtecxResponse(response)
  // 戻り値
  return await getJson(response)
}

/**
 * join to the group
 * @param req request (for authentication)
 * @param res response (for authentication)
 * @param group group
 * @param selfid hierarchical name under my group alias
 * @return feed
 */
 export const joinGroup = async (req:IncomingMessage, res:ServerResponse, group:string, selfid:string) => {
  console.log(`[vtecxnext joinGroup] start. group=${group} selfid=${selfid}`)
  // 入力チェック
  checkUri(group)
  checkNotNull(selfid, 'selfid (hierarchical name under my group alias)')
  // vte.cxへリクエスト
  const method = 'PUT'
  const url = `/p${group}?_joingroup&_selfid=${selfid}`
  const response = await requestVtecx(method, url, req)
  console.log(`[vtecxnext joinGroup] response. status=${response.status}`)
  // vte.cxからのset-cookieを転記
  setCookie(response, res)
  // レスポンスのエラーチェック
  await checkVtecxResponse(response)
  // 戻り値
  return await getJson(response)
}

/**
 * leave from the group
 * @param req request (for authentication)
 * @param res response (for authentication)
 * @param group group
 * @return feed
 */
 export const leaveGroup = async (req:IncomingMessage, res:ServerResponse, group:string) => {
  console.log(`[vtecxnext leaveGroup] start. group=${group}`)
  // 入力チェック
  checkUri(group)
  // vte.cxへリクエスト
  const method = 'DELETE'
  const url = `/p${group}?_leavegroup`
  const response = await requestVtecx(method, url, req)
  console.log(`[vtecxnext leaveGroup] response. status=${response.status}`)
  // vte.cxからのset-cookieを転記
  setCookie(response, res)
  // レスポンスのエラーチェック
  await checkVtecxResponse(response)
  // 戻り値
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
 * vte.cxからのレスポンスヘッダを、ブラウザへレスポンスする。
 * コンテンツの戻し時に使用。
 * @param response vte.cxからのレスポンス
 * @param res ブラウザへのレスポンス
 */
const setResponseHeaders = (response:Response, res:ServerResponse) => {
  const it = response.headers.entries()
  let header:IteratorResult<[string, string], any> = it.next()
  while (header && !header.done) {
    const name = header.value[0]
    if (name.startsWith('content-') || name.startsWith('x-')) {
      const val = header.value[1]
      console.log(`[setResponseHeaders] ${name} = ${val}`)
      res.setHeader(name, val)
    }
    header = it.next()
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
 * @param val チェック値
 * @param name 項目名。エラーの場合メッセージに使用。
 * @returns 戻り値はなし。エラーの場合VtecxNextErrorをスロー。
 */
const checkNotNull = (val:any, name?:string) => {
  if (!val) {
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

/**
 * BigQuery登録・削除時のテーブル名指定文字列を編集
 * @param tablenames テーブル名(キー:entry第一階層名、値:テーブル名)
 * @returns BigQuery登録・削除時のテーブル名指定文字列 ({スキーマ第一階層名}:{テーブル名}, ...)
 */
const editBqTableNames = (tablenames:any) => {
  console.log(`[editBqTableNames] tablenames = ${tablenames}`)
  if (!tablenames) {
    return null
  }
  let result = ''
  for (let key in tablenames) {
    const value = tablenames[key]
    console.log(`[editBqTableNames] ${key}=${value}`)
    result = `${result ? result + ',' : ''}${key}:${value}` 
  }
  console.log(`[editBqTableNames] result=${result}`)
  return result
}

/**
 * BigQuery検索の引数を生成
 * @param sql SQL
 * @param values SQLに指定する値
 * @param parent 戻り値JSONの親項目(任意)か、CSVのヘッダ(任意)
 * @returns BigQuery検索の引数
 */
const editGetBqArgument = (sql:string, values?:any[], parent?:string) => {
  // SQLに引数を代入（SQLインジェクション対応）
  const editSql = values ? formatSql(sql, values) : sql
  console.log(`[vtecxnext editGetBqArgument] sql=${editSql}`)
  // 引数
  const feed:any = {'feed' : {'title' : editSql}}
  if (parent) {
    feed.feed['subtitle'] = parent
  }
  return feed
}

/**
 * SQLの'?'を指定された引数に置き換える。（SQLインジェクション対応）
 * @param sql SQL
 * @param values 置き換え対象値
 * @returns 値が代入されたSQL
 */
const formatSql = (sql:string, values:any[]) => {
  if (!values) {
    return sql
  }
  return SqlString.format(sql, values)
}

/**
 * linkの編集
 * @param rel relに指定する値 
 * @param hrefs hrefに指定する値のリスト
 * @returns link
 */
const getLinks = (rel:string, hrefs:string[]) => {
  if (!rel || !hrefs) {
    return undefined
  }
  const links = []
  let idx = 0
  for (const href of hrefs) {
    const link = {'___rel' : rel, '___href' : href}
    links[idx] = link
    idx++
  }
  console.log(`[vtecxnext getLinks] links=${JSON.stringify(links)}`)
  return links
}
