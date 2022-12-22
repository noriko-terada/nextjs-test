import { NextApiRequest, NextApiResponse } from 'next'
import * as vtecxnext from 'utils/vtecxnext'
import { VtecxNextError } from 'utils/vtecxnext'

const handler = async (req:NextApiRequest, res:NextApiResponse) => {
  console.log(`[deleteentry] start. x-requested-with=${req.headers['x-requested-with']}`)
  // X-Requested-With ヘッダチェック
  if (!vtecxnext.checkXRequestedWith(req, res)) {
    return
  }
  // キーを取得
  const tmpKey = req.query['key']
  const key = tmpKey ? String(tmpKey) : ''
  const tmpRevision = req.query['r']
  const revision = tmpRevision ? Number(tmpRevision) : undefined

  console.log(`[deleteentry] key=${key} r=${revision}`)

  // 削除
  let resStatus:number
  let resMessage:string
  try {
    await vtecxnext.deleteEntry(req, res, key, revision)
    resStatus = 200
    resMessage = `entry deleted. ${key}`
  } catch (error) {
    if (error instanceof VtecxNextError) {
      console.log(`[deleteentry] Error occured. status=${error.status} ${error.message}`)
      resStatus = error.status
      resMessage = error.message
    } else {
      console.log(`[deleteentry] Error occured. (not VtecxNextError) ${error}`)
      resStatus = 503
      resMessage = 'Error occured.'
    }
  }
  const feed = {feed : {'title' : resMessage}}

  console.log('[deleteentry] end.')
  res.status(resStatus).json(feed)
  res.end()
}

export default handler
