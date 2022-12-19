import { NextApiRequest, NextApiResponse } from 'next'
import * as vtecxnext from 'utils/vtecxnext'
import { VtecxNextError } from 'utils/vtecxnext'
import * as testutil from 'utils/testutil'
import { ApiRouteTestError } from 'utils/testutil'

const handler = async (req:NextApiRequest, res:NextApiResponse) => {
  console.log(`[signature] start. x-requested-with=${req.headers['x-requested-with']}`)
  // X-Requested-With ヘッダチェック
  if (!vtecxnext.checkXRequestedWith(req, res)) {
    return
  }
  // methodを取得
  const method = req.method
  // キー
  const uri = testutil.getParam(req, 'uri')
  console.log(`[signature] method=${method} uri=${uri}`)
  // 署名処理
  let resStatus:number = 200
  let resJson:any
  try {
    if (method === 'GET') {
      const result = await vtecxnext.checkSignature(req, res, uri)
      if (result) {
        resJson = {feed : {'title' : result}}
      } else {
        resStatus = 204
      }

    } else if (method === 'PUT') {
      const json = testutil.getRequestJson(req)
      if (json) {
        // 複数
        resJson = await vtecxnext.putSignatures(req, res, json)
      } else {
        // 1件
        const revision = testutil.getParamNumber(req, 'r')
        resJson = await vtecxnext.putSignature(req, res, uri, revision)
      }

    } else if (method === 'DELETE') {
      const revision = testutil.getParamNumber(req, 'r')
      const result = await vtecxnext.deleteSignature(req, res, uri, revision)
      if (result) {
        resJson = {feed : {'title' : result}}
      } else {
        resStatus = 204
      }

    } else {
      throw new ApiRouteTestError(400, `[signature] invalid method. ${method}`)
    }

  } catch (error) {
    let resErrMsg:string
    if (error instanceof VtecxNextError || error instanceof ApiRouteTestError) {
      console.log(`[signature] Error occured. status=${error.status} ${error.message}`)
      resStatus = error.status
      resErrMsg = error.message
    } else {
      console.log(`[signature] Error occured. (not VtecxNextError) ${error}`)
      resStatus = 503
      resErrMsg = 'Error occured.'
    }
    resJson = {feed : {'title' : resErrMsg}}
  }

  console.log(`[signature] end. resJson=${resJson}`)
  res.status(resStatus)
  resJson ? res.json(resJson) : 
  res.end()
}

export default handler
