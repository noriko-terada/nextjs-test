import { NextApiRequest, NextApiResponse } from 'next'

/**
 * X-Requested-With ヘッダチェック.
 * 指定がない場合は、レスポンスにステータス417をセットする。
 * @param req リクエスト
 * @param res レスポンス
 * @returns X-Requested-Withヘッダが指定されていない場合false
 */
export const checkXRequestedWith = (req:NextApiRequest, res:NextApiResponse) => {
  console.log(`[checkXRequestedWith] start. x-requested-with=${req.headers['x-requested-with']}`)
  // X-Requested-With ヘッダがない場合エラー
  if (req.headers['x-requested-with'] == null) {
    console.log(`[checkXRequestedWith] x-requested-with header is required.`)
    res.status(417).json(undefined)
    return false
  }
  return true
}

/**
 * vte.cxへリクエスト
 * @param method メソッド
 * @param url サーブレットパス以降のURL
 * @param req リクエスト。認証情報設定に使用。
 * @param body リクエストデータ
 * @returns promise
 */
export const requestVtecx = async (method:string, url:string, req:NextApiRequest, body:any) => {
  // cookieの値をvte.cxへのリクエストヘッダに設定
  const cookie = req.headers["cookie"]
  console.log(`[requestVtecx] cookie=${cookie}`)
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
export const fetchVtecx = async (method:string, url:string, headers:[string, string][],
    body:any) => {
  console.log(`[fetchVtecx] url=${process.env.VTECX_URL}${url}`)
  const mapHeaders = new Map<string, string>(Object.entries(headers))
  mapHeaders.set('X-Requested-With', 'XMLHttpRequest')
  const apiKey = process.env.VTECX_APIKEY
  if (apiKey != null) {
    mapHeaders.set('Authorization', `APIKey ${apiKey}`)
  }
  console.log(`[fetchVtecx] headers = ${mapHeaders}`)
  const requestInit:RequestInit = {
    body: body,
    method: method,
    headers: mapHeaders
  }

  return fetch(`${process.env.VTECX_URL}${url}`, requestInit)
}

