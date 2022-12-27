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
      console.log(`[bigquery] sql=${sql}`)
      const values:any[] = getValues(feed)
      console.log(`[bigquery] values=${values}`)
      const parent = feed.feed.subtitle
      const csv = testutil.hasParam(req, 'csv')
      console.log(`[bigquery] csv=${csv}`)
      //const resData:any = await vtecxnext.queryBQ(req, res, sql, parent, csv ? true : false)
      //console.log(`[bigquery] resData=${resData}`)
      //resStatus = resData ? 200 : 204
      //res.send(resData)  // test
      if (!csv) {
        // 戻り値: JSON
        const resData = await vtecxnext.getBQ(req, res, sql, values, parent)
        if (resData) {
          res.statusCode = 200
          res.json(resData)
        } else {
          res.statusCode = 204
          res.end()
        }
      } else {
        // 戻り値: CSV
        const csvname = testutil.getParam(req, 'csv')
        const resData = await vtecxnext.getBQCsv(req, res, sql, values, csvname, parent)
        res.statusCode = resData ? 200 : 204
      }
      console.log('[bigquery] queryBq end.')

    } else if (method === 'POST') {
      // BigQuery登録
      const async:boolean = testutil.hasParam(req, 'async')
      const tablenamesStr:string = testutil.getParam(req, 'tablenames')
      const tablenames:any = testutil.getBqTablenames(tablenamesStr)
      const result = await vtecxnext.postBQ(req, res, testutil.getRequestJson(req), async, tablenames)
      const message = `post bigquery. ${async ? '(async)' : ''} result=${result}`
      resJson = {feed : {'title' : message}}
      resStatus = async ? 202 : 200

    } else if (method === 'DELETE') {
      // BigQuery削除
      const tmpKey:string = testutil.getParam(req, 'key')
      const keys:string[] = tmpKey.split(',')
      const async:boolean = testutil.hasParam(req, '_async')
      const tablenamesStr:string = testutil.getParam(req, 'tablenames')
      const tablenames:any = testutil.getBqTablenames(tablenamesStr)
      const result = await vtecxnext.deleteBQ(req, res, keys, async, tablenames)
      const message = `delete bigquery. ${async ? '(async)' : ''} result=${result}`
      resJson = {feed : {'title' : message}}
      resStatus = async ? 202 : 200
    }

  } catch (error) {
    let resErrMsg:string
    if (error instanceof VtecxNextError || error instanceof ApiRouteTestError) {
      console.log(`[bigquery] Error occured. status=${error.status} ${error.message}`)
      resStatus = error.status
      resErrMsg = error.message
    } else {
      console.log(`[bigquery] Error occured. (not VtecxNextError) ${error}`)
      if (error instanceof Error) {
        console.log(`[bigquery] ${error.stack}`)
      }
      resStatus = 503
      resErrMsg = 'Error occured.'
    }
    resJson = {feed : {'title' : resErrMsg}}
  }

  console.log(`[bigquery] end. res.closed=${res.closed} resJson=${resJson}`)
  if (!res.closed) {
    res.status(resStatus)
    resJson ? res.json(resJson) : 
    res.end()
  }
}

export default handler

const getValues = (feed:any) => {
  const values = []
  let idx = 0
  if ('category' in feed.feed) {
    for (const category of feed.feed.category) {
      const type = category.___term
      const tmpVal = category.___label
      let val
      if (type) {
        if (type === 'int' || type === 'float') {
          val = Number(tmpVal)
        } else if (type === 'bool') {
          val = tmpVal.toLowerCase() === 'true'
          console.log(`[getValues] inputVal=${tmpVal} result=${val}`)
        } else {
          val = String(tmpVal)
        }
      } else {
        val = String(tmpVal)
      }
      values[idx] = val
      idx++
    }
  }
  return values
}
