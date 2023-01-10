import { NextApiRequest, NextApiResponse } from 'next'
import * as vtecxnext from '@vtecx/vtecxnext'
import { VtecxNextError } from '@vtecx/vtecxnext'
import * as testutil from 'utils/testutil'

const handler = async (req:NextApiRequest, res:NextApiResponse) => {
  console.log(`[putentry] start. x-requested-with=${req.headers['x-requested-with']}`)
  // X-Requested-With ヘッダチェック
  if (!vtecxnext.checkXRequestedWith(req, res)) {
    return
  }

  // 更新
  let resStatus:number
  let resJson:any
  let feed
  try {
    feed = req.body ? JSON.parse(req.body) : null
  } catch (e) {
    let resErrMsg:string
    if (e instanceof Error) {
      const error:Error = e
      resErrMsg = `${error.name}: ${error.message}`
    } else {
      resErrMsg = String(e)
    }
    resJson = {feed : {'title' : resErrMsg}}
    res.status(400).json(resJson)
    res.end()
    return
  }

  try {
    const isbulkStr = req.query['isbulk']
    const isbulk = isbulkStr != undefined ? true : false
    const parallelStr = req.query['parallel']
    const parallel = parallelStr != undefined ? true : false
    const asyncStr = req.query['async']
    const async = asyncStr != undefined ? true : false
    const targetservice:string = testutil.getParam(req, 'targetservice')
    console.log(`[putentry] isbulk=${isbulk} parallel=${parallel} async=${async} ${targetservice ? 'targetservice=' + targetservice : ''}`)
  
    resJson = await vtecxnext.put(req, res, feed, isbulk, parallel, async, targetservice)
    resStatus = 200
  } catch (error) {
    let resErrMsg:string
    if (error instanceof VtecxNextError) {
      console.log(`[putentry] Error occured. status=${error.status} ${error.message}`)
      resStatus = error.status
      resErrMsg = error.message
    } else {
      console.log(`[putentry] Error occured. (not VtecxNextError) ${error}`)
      resStatus = 503
      resErrMsg = 'Error occured.'
    }
    resJson = {feed : {'title' : resErrMsg}}
  }

  console.log('[putentry] end.')
  res.status(resStatus).json(resJson)
  res.end()
}

export default handler
