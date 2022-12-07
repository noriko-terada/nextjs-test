import { NextApiRequest, NextApiResponse } from 'next'
import * as vtecxnext from 'utils/vtecxnext'
import { VtecxNextError } from 'utils/vtecxnext'

const handler = async (req:NextApiRequest, res:NextApiResponse) => {
  console.log(`[getfeed] start. x-requested-with=${req.headers['x-requested-with']}`)
  // X-Requested-With ヘッダチェック
  if (!vtecxnext.checkXRequestedWith(req, res)) {
    return
  }
  // リクエストパラメータ
  let uri = ''
  let param = ''
  for (const tmpkey in req.query) {
    if (tmpkey === 'uri') {
      uri = `${req.query[tmpkey]}`
    } else {
      param = `${param}${param ? '&' : '?'}${tmpkey}=${req.query[tmpkey]}`
    }
  }
  console.log(`[getfeed] uri=${uri}`)
  console.log(`[getfeed] param=${param}`)

  // フィード取得
  let resStatus:number
  let resJson:any
  try {
    const requesturi = `${uri}${param}`
    resJson = await vtecxnext.getFeed(req, res, requesturi)
    resStatus = resJson ? 200 : 204
  } catch (error) {
    let resErrMsg:string
    if (error instanceof VtecxNextError) {
      console.log(`[getfeed] Error occured. status=${error.status} ${error.message}`)
      resStatus = error.status
      resErrMsg = error.message
    } else {
      console.log(`[getfeed] Error occured. (not VtecxNextError) ${error}`)
      resStatus = 503
      resErrMsg = 'Error occured.'
    }
    resJson = {feed : {'title' : resErrMsg}}
  }

  console.log('[getfeed] end.')
  res.status(resStatus)
  resJson ? res.json(resJson) : 
  res.end()
}

export default handler
