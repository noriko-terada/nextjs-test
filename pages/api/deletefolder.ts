import { NextApiRequest, NextApiResponse } from 'next'
import * as vtecxnext from '@vtecx/vtecxnext'
import { VtecxNextError } from '@vtecx/vtecxnext'
import * as testutil from 'utils/testutil'

const handler = async (req:NextApiRequest, res:NextApiResponse) => {
  console.log(`[deletefolder] start. x-requested-with=${req.headers['x-requested-with']}`)
  // X-Requested-With ヘッダチェック
  if (!vtecxnext.checkXRequestedWith(req, res)) {
    return
  }
  // キーを取得
  const key:string = testutil.getParam(req, 'key')
  const async:boolean = testutil.hasParam(req, 'async')
  const targetservice:string = testutil.getParam(req, 'targetservice')
  console.log(`[deletefolder] key=${key} async=${async} ${targetservice ? 'targetservice=' + targetservice : ''}`)

  // 削除
  let resStatus:number
  let resMessage:string
  try {
    await vtecxnext.deleteFolder(req, res, key, async, targetservice)
    resStatus = async ? 202 : 200
    resMessage = `folder deleted. ${async ? '(accepted)' : ''} ${key}`
  } catch (error) {
    if (error instanceof VtecxNextError) {
      console.log(`[deletefolder] Error occured. status=${error.status} ${error.message}`)
      resStatus = error.status
      resMessage = error.message
    } else {
      console.log(`[deletefolder] Error occured. (not VtecxNextError) ${error}`)
      resStatus = 503
      resMessage = 'Error occured.'
    }
  }
  const feed = {feed : {'title' : resMessage}}

  console.log('[deletefolder] end.')
  res.status(resStatus).json(feed)
  res.end()
}

export default handler
