import { NextApiRequest, NextApiResponse } from 'next'
import * as vtecxnext from 'utils/vtecxnext'
import { VtecxNextError } from 'utils/vtecxnext'

const handler = async (req:NextApiRequest, res:NextApiResponse) => {
  console.log(`[log] start. x-requested-with=${req.headers['x-requested-with']}`)
  // X-Requested-With ヘッダチェック
  if (!vtecxnext.checkXRequestedWith(req, res)) {
    return
  }
  // vte.cxへリクエスト
  console.log(`[log] body : ${req.body}`)

  const bodyJson = JSON.parse(req.body)
  const message = bodyJson[0].summary
  const title = bodyJson[0].title
  const subtitle = bodyJson[0].subtitle

  console.log(`[log] message=${message} title=${title} subtitle=${subtitle}`)

  let resStatus:number
  let resMessage:string
  try {
    await vtecxnext.log(req, message, title, subtitle)
    resStatus = 200
    resMessage = 'post log entry.'
  } catch (error) {
    if (error instanceof VtecxNextError) {
      console.log(`[log] Error occured. status=${error.status} ${error.message}`)
      resStatus = error.status
      resMessage = error.message
    } else {
      console.log(`[log] Error occured. (not VtecxNextError) ${error}`)
      resStatus = 503
      resMessage = 'Error occured.'
    }
  }
  const feed = {feed : {'title' : resMessage}}

  console.log('[log] end.')
  res.status(resStatus).json(feed)
}

export default handler
