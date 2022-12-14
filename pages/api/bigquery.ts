import { NextApiRequest, NextApiResponse } from 'next'
import * as vtecxnext from 'utils/vtecxnext'
import { VtecxNextError } from 'utils/vtecxnext'
import * as testutil from 'utils/testutil'
import { ApiRouteTestError } from 'utils/testutil'

const handler = async (req:NextApiRequest, res:NextApiResponse) => {
  console.log(`[bigquery] start. x-requested-with=${req.headers['x-requested-with']}`)
  // X-Requested-With ヘッダチェック
  if (!vtecxnext.checkXRequestedWith(req, res)) {
    return
  }
  // methodを取得
  const method = req.method
  console.log(`[bigquery] method=${method}`)
  // BigQuery操作
  let resStatus:number = 200
  let resJson:any
  try {
    if (method === 'PUT') {
      // クエリ検索
      const feed = testutil.getRequestJson(req)
      const sql = feed.feed.title
      const parent = feed.feed.subtitle
      const csv = testutil.getParam(req, '_csv')
      const resData:any = await vtecxnext.queryBQ(req, res, sql, parent, csv ? true : false)
      console.log(`[bigquery] resData=${resData}`)
      resStatus = resData ? 200 : 204
      res.send(resData)  // test

    } else if (method === 'POST') {
      // BigQuery登録
      const asyncStr:string = testutil.getParam(req, '_async')
      const async:boolean = asyncStr ? testutil.toBoolean(asyncStr) : false
      const tablenamesStr:string = testutil.getParam(req, 'tablenames')
      const tablenames:any = testutil.getBqTablenames(tablenamesStr)
      const result = await vtecxnext.postBQ(req, res, testutil.getRequestJson(req), async, tablenames)
      const message = `post bigquery. result=${result}`
      resJson = {feed : {'title' : message}}

    } else if (method === 'DELETE') {
      // BigQuery削除
      const tmpUri:string = testutil.getParam(req, 'uri')
      const uris:string[] = tmpUri.split(',')
      const asyncStr:string = testutil.getParam(req, '_async')
      const async:boolean = asyncStr ? testutil.toBoolean(asyncStr) : false
      const tablenamesStr:string = testutil.getParam(req, 'tablenames')
      const tablenames:any = testutil.getBqTablenames(tablenamesStr)
      const result = await vtecxnext.deleteBQ(req, res, uris, async, tablenames)
      const message = `delete bigquery. result=${result}`
      resJson = {feed : {'title' : message}}
    }

  } catch (error) {
    let resErrMsg:string
    if (error instanceof VtecxNextError || error instanceof ApiRouteTestError) {
      console.log(`[bigquery] Error occured. status=${error.status} ${error.message}`)
      resStatus = error.status
      resErrMsg = error.message
    } else {
      console.log(`[bigquery] Error occured. (not VtecxNextError) ${error}`)
      resStatus = 503
      resErrMsg = 'Error occured.'
    }
    resJson = {feed : {'title' : resErrMsg}}
  }

  console.log(`[bigquery] end. resJson=${resJson}`)
  res.status(resStatus)
  resJson ? res.json(resJson) : 
  res.end()
}

export default handler
