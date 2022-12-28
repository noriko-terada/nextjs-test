import { NextApiRequest, NextApiResponse } from 'next'
import * as vtecxnext from 'utils/vtecxnext'
import { VtecxNextError } from 'utils/vtecxnext'
import * as testutil from 'utils/testutil'
import { ApiRouteTestError } from 'utils/testutil'

const handler = async (req:NextApiRequest, res:NextApiResponse) => {
  console.log(`[info] start. x-requested-with=${req.headers['x-requested-with']}`)
  // X-Requested-With ヘッダチェック
  if (!vtecxnext.checkXRequestedWith(req, res)) {
    return
  }
  // 処理区分を取得
  const type:string = testutil.getParam(req, 'type')
  // uid取得
  let resStatus:number
  let resMessage:string
  try {
    if (type === 'account') {
      resMessage = await vtecxnext.account(req, res)
    } else if (type === 'service') {
      resMessage = await vtecxnext.service(req, res)
    } else if (type === 'rxid') {
      resMessage = await vtecxnext.rxid(req, res)
    } else if (type === 'now') {
      resMessage = await vtecxnext.now()
    } else {
      throw new ApiRouteTestError(400, `invalid type: ${type}`)
    }
    resStatus = 200
  } catch (error) {
    if (error instanceof VtecxNextError) {
      console.log(`[info] Error occured. status=${error.status} ${error.message}`)
      resStatus = error.status
      resMessage = error.message
    } else {
      console.log(`[info] Error occured. (not VtecxNextError) ${error}`)
      resStatus = 503
      resMessage = 'Error occured.'
    }
  }
  const feed = {feed : {'title' : resMessage}}

  console.log('[info] end.')
  res.status(resStatus).json(feed)
  res.end()
}

export default handler
