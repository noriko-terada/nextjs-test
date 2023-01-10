import { NextApiRequest, NextApiResponse } from 'next'
import * as vtecxnext from '@vtecx/vtecxnext'
import { VtecxNextError } from '@vtecx/vtecxnext'

/**
 * リクエストデータを取得.
 * エラー発生時、ステータス400のApiRouteTestErrorをスローする。
 * @param req リクエスト
 * @return JSON
 */
 export const getRequestJson = (req:NextApiRequest): any => {
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
 export const getParam = (req:NextApiRequest, name:string): string => {
  const tmpVal = req.query[name]
  return toString(tmpVal)
}

/**
 * URLパラメータを取得し、string型で返す.
 * @param req リクエスト
 * @param name パラメータ名
 * @return パラメータ値
 */
 export const hasParam = (req:NextApiRequest, name:string): boolean => {
  const tmpVal = req.query[name]
  console.log(`[hasParam] ${name}=${tmpVal}`)
  return tmpVal == undefined ? false : true
}

/**
 * 値をstring型で返す.
 * @param tmpVal 値
 * @return stringの値
 */
 export const toString = (tmpVal:any): string => {
  return tmpVal ? String(tmpVal) : ''
}

/**
 * URLパラメータを取得し、number型で返す.
 * @param req リクエスト
 * @param name パラメータ名
 * @return パラメータ値
 */
 export const getParamNumber = (req:NextApiRequest, name:string): number|undefined => {
  const tmpVal = req.query[name]
  if (!tmpVal) {
    return undefined
  }
  return toNumber(tmpVal)
}

/**
 * URLパラメータを取得し、number型で返す. 値の指定がない場合エラーを返す.
 * @param req リクエスト
 * @param name パラメータ名
 * @return パラメータ値
 */
 export const getParamNumberRequired = (req:NextApiRequest, name:string): number => {
  const tmpVal = req.query[name]
  return toNumber(tmpVal)
}

/**
 * 値をnumber型で返す.空はエラー.
 * @param tmpVal 値
 * @return numberの値
 */
 export const toNumber = (tmpVal:any): number => {
  let errMsg = `Not numeric. ${tmpVal}`
  if (tmpVal) {
    try {
      return Number(tmpVal)
    } catch (e) {
      if (e instanceof Error) {
        errMsg = e.message
      }
    }
  }
  throw new ApiRouteTestError(400, errMsg)
}

/**
 * 値をboolean型で返す.空はエラー.
 * @param tmpVal 値
 * @return booleanの値
 */
 export const toBoolean = (tmpVal:string): boolean => {
  let errMsg = `Not boolean. ${tmpVal}`
  if (tmpVal) {
    try {
      return tmpVal.toLowerCase() === 'true'
    } catch (e) {
      if (e instanceof Error) {
        errMsg = e.message
      }
    }
  }
  throw new ApiRouteTestError(400, errMsg)
}

/**
 * BigQueryでテーブル名指定の場合の型変換を行う.
 * @param tablenamesStr 値
 * @return テーブル名リスト
 */
 export const getBqTablenames = (tablenamesStr:string): any => {
  if (!tablenamesStr) {
    return null
  }
  const tablenames:any = {}
  const tmp = tablenamesStr.split(',')
  for (const tablenameInfo of tmp) {
    const idx = tablenameInfo.indexOf(':')
    if (idx < 1) {
      throw new ApiRouteTestError(400, `Invalid tablenames of BigQuery. ${tablenamesStr}`)
    }
    const entityName:string = tablenameInfo.substring(0, idx)
    tablenames[entityName] = tablenameInfo.substring(idx + 1)
  }
  console.log(`[getBqTablenames] tablenames = ${JSON.stringify(tablenames)}`)
  return tablenames
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
