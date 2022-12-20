import { NextApiRequest, NextApiResponse } from 'next'
import * as vtecxnext from 'utils/vtecxnext'
import { VtecxNextError } from 'utils/vtecxnext'
import * as testutil from 'utils/testutil'

const handler = async (req:NextApiRequest, res:NextApiResponse) => {
  console.log(`[sendmail] start. x-requested-with=${req.headers['x-requested-with']}`)
  // X-Requested-With ヘッダチェック
  if (!vtecxnext.checkXRequestedWith(req, res)) {
    return
  }
  // 引数を取得
  const tmpTo = testutil.getParam(req, 'to')
  const tos = tmpTo ? tmpTo.split(',') : []
  const tmpCc = testutil.getParam(req, 'cc')
  const ccs = tmpCc ? tmpCc.split(',') : undefined
  const tmpBcc = testutil.getParam(req, 'bcc')
  const bccs = tmpBcc ? tmpBcc.split(',') : undefined
  const tmpAttachment = testutil.getParam(req, 'attachment')
  const attachments = tmpAttachment ? tmpAttachment.split(',') : undefined
  console.log(`[sendmail] tos=${tos} ccs=${ccs} bccs=${bccs} attachments=${attachments}`)

  // メール送信
  let resStatus:number
  let resMessage:string
  let entry
  try {
    entry = req.body ? JSON.parse(req.body) : null
  } catch (e) {
    if (e instanceof Error) {
      const error:Error = e
      resMessage = `${error.name}: ${error.message}`
    } else {
      resMessage = String(e)
    }
    const resJson = {feed : {'title' : resMessage}}
    res.status(400).json(resJson)
    res.end()
    return
  }

  try {
    await vtecxnext.sendMail(req, res, entry, tos, ccs, bccs, attachments)
    resStatus = 200
    resMessage = `sent the email.`
  } catch (error) {
    if (error instanceof VtecxNextError) {
      console.log(`[sendmail] Error occured. status=${error.status} ${error.message}`)
      resStatus = error.status
      resMessage = error.message
    } else {
      console.log(`[sendmail] Error occured. (not VtecxNextError) ${error}`)
      resStatus = 503
      resMessage = 'Error occured.'
    }
  }

  console.log('[sendmail] end.')
  const resJson = {feed : {'title' : resMessage}}
  res.status(resStatus).json(resJson)
  res.end()
}

export default handler
