import { NextApiRequest, NextApiResponse } from 'next'
import * as vtecxnext from 'utils/vtecxnext'
import { VtecxNextError } from 'utils/vtecxnext'
import * as testutil from 'utils/testutil'
import { ApiRouteTestError } from 'utils/testutil'

const handler = async (req:NextApiRequest, res:NextApiResponse) => {
  console.log(`[session] start. x-requested-with=${req.headers['x-requested-with']}`)
  // X-Requested-With ヘッダチェック
  if (!vtecxnext.checkXRequestedWith(req, res)) {
    return
  }
  // methodを取得
  const method = req.method
  // パラメータを取得
  const name:string = testutil.getParam(req, 'name')
  const type:string = testutil.getParam(req, 'type')
  console.log(`[session] method=${method} name=${name} type=${type}`)
  // セッション操作
  let resStatus:number = 200
  let resJson:any
  try {
    if (method === 'GET') {
      if (type === 'feed') {
        console.log(`[session] method=${method} name=${name} type=${type}`)
        resJson = await vtecxnext.getSessionFeed(req, res, name)
        resStatus = resJson ? 200 : 204
      } else if (type == 'entry') {
        resJson = await vtecxnext.getSessionEntry(req, res, name)
        resStatus = resJson ? 200 : 204
      } else if (type == 'string') {
        const result = await vtecxnext.getSessionString(req, res, name)
        if (result) {
          resJson = {feed : {'title' : result}}
        } else {
          resStatus = 204
        }
      } else if (type == 'long') {
        const result = await vtecxnext.getSessionLong(req, res, name)
        if (result) {
          resJson = {feed : {'title' : result}}
        } else {
          resStatus = 204
        }
      } else {
        console.log(`[session] invalid type. method=${method} type=${type}`)
        throw new ApiRouteTestError(400, `[session] invalid type. method=${method} type=${type}`)
      }

    } else if (method === 'PUT') {
      let message
      if (type === 'feed') {
        const result = await vtecxnext.setSessionFeed(req, res, name, testutil.getRequestJson(req))
        message = `session ${type} set. name=${name} result=${result}`
      } else if (type == 'entry') {
        const result = await vtecxnext.setSessionEntry(req, res, name, testutil.getRequestJson(req))
        message = `session ${type} set. name=${name} result=${result}`
      } else if (type == 'string') {
        const result = await vtecxnext.setSessionString(req, res, name, testutil.getParam(req, 'val'))
        message = `session ${type} set. name=${name} result=${result}`
      } else if (type == 'long') {
        const result = await vtecxnext.setSessionLong(req, res, name, testutil.getParamNumber(req, 'val'))
        message = `session ${type} set. name=${name} result=${result}`
      } else if (type == 'incr') {
        message = await vtecxnext.incrementSession(req, res, name, testutil.getParamNumber(req, 'val'))
      } else {
        console.log(`[session] invalid type. method=${method} type=${type}`)
        throw new ApiRouteTestError(400, `[session] invalid type. ${type}`)
      }
      resJson = {feed : {'title' : message}}

    } else if (method === 'DELETE') {
      let result
      if (type === 'feed') {
        result = await vtecxnext.deleteSessionFeed(req, res, name)
      } else if (type == 'entry') {
        result = await vtecxnext.deleteSessionEntry(req, res, name)
      } else if (type == 'string') {
        result = await vtecxnext.deleteSessionString(req, res, name)
      } else if (type == 'long') {
        result = await vtecxnext.deleteSessionLong(req, res, name)
      } else {
        console.log(`[session] invalid type. method=${method} type=${type}`)
        throw new ApiRouteTestError(400, `[session] invalid type. ${type}`)
      }
      resJson = {feed : {'title' : `session ${type} deleted. name=${name} result=${result}`}}
    }

  } catch (error) {
    let resErrMsg:string
    if (error instanceof VtecxNextError || error instanceof ApiRouteTestError) {
      console.log(`[session] Error occured. status=${error.status} ${error.message}`)
      resStatus = error.status
      resErrMsg = error.message
    } else {
      console.log(`[session] Error occured. (not VtecxNextError) ${error}`)
      resStatus = 503
      resErrMsg = 'Error occured.'
    }
    resJson = {feed : {'title' : resErrMsg}}
  }

  console.log(`[session] end. resJson=${resJson}`)
  res.status(resStatus)
  resJson ? res.json(resJson) : 
  res.end()
}

export default handler
