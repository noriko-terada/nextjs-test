import { NextApiRequest, NextApiResponse } from 'next'
import * as vtecxnext from 'utils/vtecxnext'
import { VtecxNextError } from 'utils/vtecxnext'

/**
 * リクエストデータを取得.
 * エラー発生時、ステータス400のApiRouteTestErrorをスローする。
 * @param req リクエスト
 * @return JSON
 */
 export const getRequestJson = (req:NextApiRequest) => {
  let json
  try {
    json = req.body ? JSON.parse(req.body) : null
  } catch (e) {
    let resErrMsg:string
    if (e instanceof Error) {
      const error:Error = e
      resErrMsg = `${error.name}: ${error.message}`
    } else {
      resErrMsg = String(e)
    }
    throw new ApiRouteTestError(400, resErrMsg)
  }
  return json
}

/**
 * URLパラメータを取得し、string型で返す.
 * @param req リクエスト
 * @param name パラメータ名
 * @return パラメータ値
 */
 export const getParam = (req:NextApiRequest, name:string) => {
  const tmpVal = req.query[name]
  return tmpVal ? String(tmpVal) : ''
}

/**
 * URLパラメータを取得し、number型で返す.
 * @param req リクエスト
 * @param name パラメータ名
 * @return パラメータ値
 */
 export const getParamNumber = (req:NextApiRequest, name:string) => {
  const tmpVal = req.query[name]
  if (tmpVal) {
    return Number(tmpVal)
  } else {
    throw new ApiRouteTestError(400, `Not numeric. name=${name} value=${tmpVal}`)
  }
}




// --------------------------------------
/**
 * Error returned from api route test
 */
export class ApiRouteTestError extends Error {
  status:number
  constructor(status:number, message:string) {
    super(message)
    this.name = 'ApiRouteTestError'
    this.status = status
  }
}
