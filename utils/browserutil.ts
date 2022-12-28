/**
 * 戻り値がJSONのリクエスト
 * @param method メソッド
 * @param apiAction サーバサイドJS名
 * @param urlparam URLパラメータ
 * @param body リクエストデータ
 * @param headers リクエストヘッダ
 * @returns レスポンスJSON
 */
export const requestApi = async (method:string, apiAction:string, urlparam:string, body?:any, headers?:any): Promise<any> => {
  console.log(`[requestApi] start. method=${method} apiAction=${apiAction} urlparam=${urlparam}`)
  const reqHeaders:any = headers ? headers : {}
  reqHeaders['X-Requested-With'] = 'XMLHttpRequest'
  const requestInit:RequestInit = {
    body: body,
    method: method,
    headers: reqHeaders
  }

  const url = `api/${apiAction}?${urlparam ? urlparam : ''}`
  //console.log(`[requestApi] url=${url}`)
  const response = await fetch(url, requestInit)
  const status = response.status
  console.log(`[requestApi] response. status=${status}`)
  let data
  if (status === 204) {
    data = null
  } else {
    const contentType = response.headers.get('content-type')
    console.log(`[requestApi] content-type=${contentType}`)
    if (!contentType || contentType.startsWith('application/json')) {
      data = await response.json()
    } else {
      data = await response.blob()
    }
  }
  console.log(data)
  return data
}
