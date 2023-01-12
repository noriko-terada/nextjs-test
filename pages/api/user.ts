import { NextApiRequest, NextApiResponse } from 'next'
import * as vtecxnext from '@vtecx/vtecxnext'
import { VtecxNextError } from '@vtecx/vtecxnext'
import * as testutil from 'utils/testutil'
import { ApiRouteTestError } from 'utils/testutil'

const handler = async (req:NextApiRequest, res:NextApiResponse) => {
  console.log(`[user] start. x-requested-with=${req.headers['x-requested-with']}`)
  // X-Requested-With ヘッダチェック
  if (!vtecxnext.checkXRequestedWith(req, res)) {
    return
  }
  // methodを取得
  const method = req.method
  // パラメータを取得
  const type:string = testutil.getParam(req, 'type')
  console.log(`[user] method=${method} type=${type}`)
  // ユーザ操作
  let resStatus:number = 200
  let resJson:any
  try {
    if (method === 'GET') {
      if (type === 'userstatus') {
        resJson = await vtecxnext.userstatus(req, res, testutil.getParam(req, 'account'))
        resStatus = resJson ? 200 : 204
      } else {
        console.log(`[user] invalid type. method=${method} type=${type}`)
        throw new ApiRouteTestError(400, `[user] invalid type. method=${method} type=${type}`)
      }
    } else if (method === 'POST') {
      if (type === 'adduserbyadmin') {
        resJson = await vtecxnext.adduserByAdmin(req, res, testutil.getRequestJson(req))
      } else {
        console.log(`[user] invalid type. method=${method} type=${type}`)
        throw new ApiRouteTestError(400, `[user] invalid type. method=${method} type=${type}`)
      }
    } else if (method === 'PUT') {
      if (type === 'changepassbyadmin') {
        resJson = await vtecxnext.changepassByAdmin(req, res, testutil.getRequestJson(req))
      } else if (type === 'changeaccount') {
        resJson = await vtecxnext.changeaccount(req, res, testutil.getRequestJson(req))
      } else if (type === 'changeaccount_verify') {
        resJson = await vtecxnext.changeaccount_verify(req, res, testutil.getParam(req, 'verify'))
      } else if (type === 'revokeuser') {
        resJson = await vtecxnext.revokeuser(req, res, testutil.getParam(req, 'account'))
      } else if (type === 'revokeusers') {
        resJson = await vtecxnext.revokeusers(req, res, testutil.getRequestJson(req))
      } else if (type === 'activateuser') {
        resJson = await vtecxnext.activateuser(req, res, testutil.getParam(req, 'account'))
      } else if (type === 'activateusers') {
        resJson = await vtecxnext.activateusers(req, res, testutil.getRequestJson(req))
      } else if (type === 'deleteusers') {  // API RouteではDELETEメソッドでリクエストデータを受け取れなかった
        resJson = await vtecxnext.deleteusers(req, res, testutil.getRequestJson(req))
      } else {
        console.log(`[user] invalid type. method=${method} type=${type}`)
        throw new ApiRouteTestError(400, `[user] invalid type. method=${method} type=${type}`)
      }
    } else if (method === 'DELETE') {
      if (type === 'canceluser') {
        resJson = await vtecxnext.canceluser(req, res)
      } else if (type === 'deleteuser') {
        resJson = await vtecxnext.deleteuser(req, res, testutil.getParam(req, 'account'))
      } else {
        console.log(`[user] invalid type. method=${method} type=${type}`)
        throw new ApiRouteTestError(400, `[user] invalid type. method=${method} type=${type}`)
      }
    } else {
      console.log(`[user] invalid type. method=${method} type=${type}`)
      throw new ApiRouteTestError(400, `[user] invalid type. method=${method} type=${type}`)
  }

  } catch (error) {
    let resErrMsg:string
    if (error instanceof VtecxNextError || error instanceof ApiRouteTestError) {
      console.log(`[user] Error occured. status=${error.status} ${error.message}`)
      resStatus = error.status
      resErrMsg = error.message
    } else {
      console.log(`[user] Error occured. (not VtecxNextError) ${error}`)
      resStatus = 503
      resErrMsg = 'Error occured.'
    }
    resJson = {feed : {'title' : resErrMsg}}
  }

  console.log(`[user] end. resJson=${resJson}`)
  res.status(resStatus)
  resJson ? res.json(resJson) : 
  res.end()
}

export default handler
