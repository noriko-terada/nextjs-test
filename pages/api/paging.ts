import { NextApiRequest, NextApiResponse } from 'next'
import * as vtecxnext from 'utils/vtecxnext'
import { VtecxNextError } from 'utils/vtecxnext'
import * as testutil from 'utils/testutil'
import { ApiRouteTestError } from 'utils/testutil'

const handler = async (req:NextApiRequest, res:NextApiResponse) => {
  console.log(`[paging] start. x-requested-with=${req.headers['x-requested-with']}`)
  // X-Requested-With ヘッダチェック
  if (!vtecxnext.checkXRequestedWith(req, res)) {
    return
  }
  // パラメータを取得
  let uri = ''
  let param = ''
  let pagerange = ''
  let num = undefined
  for (const tmpkey in req.query) {
    if (tmpkey === 'uri') {
      uri = testutil.toString(req.query[tmpkey])
    } else if (tmpkey === '_pagination') {
      pagerange = testutil.toString(req.query[tmpkey])
    } else if (tmpkey === 'n') {
      num = testutil.toNumber(req.query[tmpkey])
    } else {
      param = `${param}${param ? '&' : '?'}${tmpkey}=${req.query[tmpkey]}`
    }
  }
  const requesturi = `${uri}${param}`

  console.log(`[paging] uri=${uri} pagerange=${pagerange} num=${String(num)}`)
  // ページング
  let resStatus:number = 200
  let resJson:any
  try {
    if (pagerange) {
      // ページネーション
      resJson = await vtecxnext.pagination(req, res, requesturi, pagerange)
      resStatus = resJson ? 200 : 204
    } else if (num) {
      // ページ数取得
      resJson = await vtecxnext.getPage(req, res, requesturi, testutil.toNumber(num))
      resStatus = resJson ? 200 : 204
    } else {
      console.log(`[paging] invalid type. uri=${uri}`)
      throw new ApiRouteTestError(400, `[paging] invalid type. uri=${uri}`)
    }

  } catch (error) {
    let resErrMsg:string
    if (error instanceof VtecxNextError || error instanceof ApiRouteTestError) {
      console.log(`[paging] Error occured. status=${error.status} ${error.message}`)
      resStatus = error.status
      resErrMsg = error.message
    } else {
      console.log(`[paging] Error occured. (not VtecxNextError) ${error}`)
      resStatus = 503
      resErrMsg = 'Error occured.'
    }
    resJson = {feed : {'title' : resErrMsg}}
  }

  console.log(`[paging] end. resJson=${resJson}`)
  res.status(resStatus)
  resJson ? res.json(resJson) : 
  res.end()
}

export default handler
