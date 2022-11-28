import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req:NextApiRequest, res:NextApiResponse) {
    console.log(`[get_now] start. x-requested-with=${req.headers['x-requested-with']}`)
    // X-Requested-With ヘッダがない場合エラー
    if (req.headers['x-requested-with'] == null) {
      console.log(`[get_now] x-requested-with header is required.`)
      res.status(417).json(undefined)
    } else {
      console.log(`VTECX_URL=${process.env.VTECX_URL}`)
      const response = await fetch(`${process.env.VTECX_URL}/d/?_now`,
        {
          method: 'GET',
          headers: {
            'X-Requested-With': 'XMLHttpRequest'
          }
        }
      )
      const feed = await response.json()
      console.log("[get_now] end.")
      res.status(200).json(feed)
    }
}
