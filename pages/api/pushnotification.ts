import { NextApiRequest, NextApiResponse } from 'next'
import * as vtecxnext from 'utils/vtecxnext'
import { VtecxNextError } from 'utils/vtecxnext'
import * as testutil from 'utils/testutil'

const handler = async (req:NextApiRequest, res:NextApiResponse) => {
  console.log(`[pushnotification] start. x-requested-with=${req.headers['x-requested-with']}`)
  // X-Requested-With ヘッダチェック
  if (!vtecxnext.checkXRequestedWith(req, res)) {
    return
  }
  // 引数を取得
  const tmpTo = testutil.getParam(req, 'to')
  const to = tmpTo ? tmpTo.split(',') : []
  console.log(`[pushnotification] to=${to}`)
  const imageUrl = testutil.getParam(req, 'imageurl')

  // Push通知
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
    // title: Push通知タイトル
    // subtitle: Push通知サブタイトル
    // content: Push通知メッセージ本文(body)
    // summary: dataに設定するメッセージ(Expo用)
    // category _$scheme={dataのキー} _$label={dataの値}(Expo用)
    const message = entry.content['______text']
    const title = 'title' in entry ? entry['title'] : undefined
    const subtitle = 'subtitle' in entry ? entry['subtitle'] : undefined
    const data:any = {}
    if ('category' in entry) {
      for (const category of entry['category']) {
        data[category['___scheme']] = category['___label']
      }
    }

    await vtecxnext.pushNotification(req, res, message, to, title, subtitle, imageUrl, data)
    resStatus = 200
    resMessage = `sent a push notification.`
  } catch (error) {
    if (error instanceof VtecxNextError) {
      console.log(`[pushnotification] Error occured. status=${error.status} ${error.message}`)
      resStatus = error.status
      resMessage = error.message
    } else {
      console.log(`[pushnotification] Error occured. (not VtecxNextError) ${error}`)
      resStatus = 503
      resMessage = 'Error occured.'
    }
  }

  console.log('[pushnotification] end.')
  const resJson = {feed : {'title' : resMessage}}
  res.status(resStatus).json(resJson)
  res.end()
}

export default handler
