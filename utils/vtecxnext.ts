import { IncomingMessage, ServerResponse } from 'http'
import * as nodeurl from 'url'

// 型定義
// 認証のため各関数にリクエスト(IncomingMessage)が必要。
// セッション維持のため各関数にレスポンス(ServerResponse)が必要。
type requestVtecx = (method:string, url:string, req:IncomingMessage, body:any) => Promise<Response>
type fetchVtecx = (method:string, url:string, headers:any, body:any) => Promise<Response>
// ----
type checkXRequestedWith = (req:IncomingMessage, res:ServerResponse) => boolean
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
 * @param req request
 * @param res response
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
 * @param req request
 * @param res response
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
 * @param req request
 * @param res response
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
 * @param req request
 * @param res response
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
 * @param req request
 * @param res response
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

/**
 * allocate numbers
 * @param req request
 * @param res response
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
 * @param req request
 * @param res response
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
 * @param req request
 * @param res response
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
 * @param req request
 * @param res response
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
 * @param req request
 * @param res response
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
 * @param req request
 * @param res response
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
 * @param req request
 * @param res response
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
  const url = `/p?_sessionfeed=${name}`
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
 * @param req request
 * @param res response
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
  const url = `/p?_sessionentry=${name}`
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
 * @param req request
 * @param res response
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
  const url = `/p?_sessionstring=${name}`
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
 * @param req request
 * @param res response
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
  const url = `/p?_sessionlong=${name}`
  const feed = {feed : {'title' : num}}
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
 * @param req request
 * @param res response
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
  const url = `/p?_sessionincr=${name}&_num=${num}`
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
 * @param req request
 * @param res response
 * @param name name
 * @return true if successful
 */
 export const deleteSessionFeed = async (req:IncomingMessage, res:ServerResponse, name:string) => {
  console.log(`[vtecxnext deleteSessionFeed] start. name=${name}`)
  // 入力チェック
  checkNotNull(name, 'Name')
  // vte.cxへリクエスト
  const method = 'DELETE'
  const url = `/p?_sessionfeed=${name}`
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
 * @param req request
 * @param res response
 * @param name name
 * @return true if successful
 */
 export const deleteSessionEntry = async (req:IncomingMessage, res:ServerResponse, name:string) => {
  console.log(`[vtecxnext deleteSessionEntry] start. name=${name}`)
  // 入力チェック
  checkNotNull(name, 'Name')
  // vte.cxへリクエスト
  const method = 'DELETE'
  const url = `/p?_sessionentry=${name}`
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
 * @param req request
 * @param res response
 * @param name name
 * @return true if successful
 */
 export const deleteSessionString = async (req:IncomingMessage, res:ServerResponse, name:string) => {
  console.log(`[vtecxnext deleteSessionString] start. name=${name}`)
  // 入力チェック
  checkNotNull(name, 'Name')
  // vte.cxへリクエスト
  const method = 'DELETE'
  const url = `/p?_sessionstring=${name}`
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
 * @param req request
 * @param res response
 * @param name name
 * @return true if successful
 */
 export const deleteSessioLong = async (req:IncomingMessage, res:ServerResponse, name:string) => {
  console.log(`[vtecxnext deleteSessioLong] start. name=${name}`)
  // 入力チェック
  checkNotNull(name, 'Name')
  // vte.cxへリクエスト
  const method = 'DELETE'
  const url = `/p?_sessionlong=${name}`
  const response = await requestVtecx(method, url, req)
  console.log(`[vtecxnext deleteSessioLong] response. status=${response.status}`)
  // vte.cxからのset-cookieを転記
  setCookie(response, res)
  // レスポンスのエラーチェック
  await checkVtecxResponse(response)
  return true
}

/**
 * get feed from session
 * @param req request
 * @param res response
 * @param name name
 * @return feed
 */
 export const getSessionFeed = async (req:IncomingMessage, res:ServerResponse, name:string) => {
  console.log(`[vtecxnext getSessionFeed] start. name=${name}`)
  // 入力チェック
  checkNotNull(name, 'Name')
  // vte.cxへリクエスト
  const method = 'GET'
  const url = `/p?_sessionfeed=${name}`
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
 * @param req request
 * @param res response
 * @param name name
 * @return entry
 */
 export const getSessionEntry = async (req:IncomingMessage, res:ServerResponse, name:string) => {
  console.log(`[vtecxnext getSessionEntry] start. name=${name}`)
  // 入力チェック
  checkNotNull(name, 'Name')
  // vte.cxへリクエスト
  const method = 'GET'
  const url = `/p?_sessionentry=${name}`
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
 * @param req request
 * @param res response
 * @param name name
 * @return string
 */
 export const getSessionString = async (req:IncomingMessage, res:ServerResponse, name:string) => {
  console.log(`[vtecxnext getSessionString] start. name=${name}`)
  // 入力チェック
  checkNotNull(name, 'Name')
  // vte.cxへリクエスト
  const method = 'GET'
  const url = `/p?_sessionstring=${name}`
  const response = await requestVtecx(method, url, req)
  console.log(`[vtecxnext getSessionString] response. status=${response.status}`)
  // vte.cxからのset-cookieを転記
  setCookie(response, res)
  // レスポンスのエラーチェック
  await checkVtecxResponse(response)
  // 戻り値
  const data = await getJson(response)
  return data.feed.title
}

/**
 * get number from session
 * @param req request
 * @param res response
 * @param name name
 * @return number
 */
 export const getSessionLong = async (req:IncomingMessage, res:ServerResponse, name:string) => {
  console.log(`[vtecxnext getSessionLong] start. name=${name}`)
  // 入力チェック
  checkNotNull(name, 'Name')
  // vte.cxへリクエスト
  const method = 'GET'
  const url = `/p?_sessionlong=${name}`
  const response = await requestVtecx(method, url, req)
  console.log(`[vtecxnext getSessionLong] response. status=${response.status}`)
  // vte.cxからのset-cookieを転記
  setCookie(response, res)
  // レスポンスのエラーチェック
  await checkVtecxResponse(response)
  // 戻り値
  const data = await getJson(response)
  return data.feed.title ? Number(data.feed.title) : null
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
