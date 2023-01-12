import { useState } from 'react';
import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import * as vtecxnext from '@vtecx/vtecxnext'  // getServerSideProps で使用
import * as browserutil from 'utils/browserutil'

function Header({title} : {title:string}) {
  return <h1>{title ? title : 'Default title'}</h1>;
}

const HomePage = (props:Props) => {
  const [action, setAction] = useState('');
  const [urlparam, setUrlparam] = useState('');
  const [reqdata, setReqdata] = useState('');
  const [result, setResult] = useState('');
  const [descriptionUrlparam, setDescriptionUrlparam] = useState('');
  const [descriptionReqdata, setDescriptionReqdata] = useState('');
  const [targetservice, setTargetservice] = useState('');

  const options = [
    {
      label: '--- 選択してください ---',
      value: 'select',
      labelUrlparam: '',
      labelReqdata: '',
    },
    {
      label: 'uid (/d)',
      value: 'uid',
      labelUrlparam: '',
      labelReqdata: '',
    },
    {
      label: 'uid2 (run twice) (/d)',
      value: 'uid2',
      labelUrlparam: '',
      labelReqdata: '',
    },
    {
      label: 'whoami (/d)',
      value: 'whoami',
      labelUrlparam: '',
      labelReqdata: '',
    },
    {
      label: 'is logged in',
      value: 'isloggedin',
      labelUrlparam: '',
      labelReqdata: '',
    },
    {
      label: 'account (/d)',
      value: 'info_account',
      labelUrlparam: '',
      labelReqdata: '',
    },
    {
      label: 'rxid (/d)',
      value: 'info_rxid',
      labelUrlparam: '',
      labelReqdata: '',
    },
    {
      label: 'service (/d)',
      value: 'info_service',
      labelUrlparam: '',
      labelReqdata: '',
    },
    {
      label: 'now (/d)',
      value: 'info_now',
      labelUrlparam: '',
      labelReqdata: '',
    },
    {
      label: 'post log',
      value: 'log',
      labelUrlparam: '',
      labelReqdata: 'feed',
    },
    {
      label: 'get entry',
      value: 'getentry',
      labelUrlparam: 'key={キー}',
      labelReqdata: '',
    },
    {
      label: 'get feed',
      value: 'getfeed',
      labelUrlparam: 'key={キー}[&検索条件]',
      labelReqdata: '',
    },
    {
      label: 'get count',
      value: 'getcount',
      labelUrlparam: 'key={キー}[&検索条件]',
      labelReqdata: '',
    },
    {
      label: 'post entry',
      value: 'postentry',
      labelUrlparam: '[key={親キー}]',
      labelReqdata: 'feed',
    },
    {
      label: 'put entry',
      value: 'putentry',
      labelUrlparam: '[isbulk&parallel&async]',
      labelReqdata: 'feed',
    },
    {
      label: 'delete entry',
      value: 'deleteentry',
      labelUrlparam: 'key={キー}[&r={リビジョン}]',
      labelReqdata: '',
    },
    {
      label: 'delete folder',
      value: 'deletefolder',
      labelUrlparam: 'key={親キー}[&async]',
      labelReqdata: '',
    },
    {
      label: 'allocids',
      value: 'allocids',
      labelUrlparam: 'key={キー}&num={採番数}',
      labelReqdata: '',
    },
    {
      label: 'addids',
      value: 'addids',
      labelUrlparam: 'key={キー}&num={加算数}',
      labelReqdata: '',
    },
    {
      label: 'getids',
      value: 'getids',
      labelUrlparam: 'key={キー}',
      labelReqdata: '',
    },
    {
      label: 'setids',
      value: 'setids',
      labelUrlparam: 'key={キー}&num={加算設定数}',
      labelReqdata: '',
    },
    {
      label: 'rangeids',
      value: 'rangeids',
      labelUrlparam: 'key={キー}&range={加算枠}',
      labelReqdata: '',
    },
    {
      label: 'getrangeids',
      value: 'getrangeids',
      labelUrlparam: 'key={キー}',
      labelReqdata: '',
    },
    {
      label: 'get session feed',
      value: 'session_get_feed',
      labelUrlparam: 'name={名前}',
      labelReqdata: '',
    },
    {
      label: 'get session entry',
      value: 'session_get_entry',
      labelUrlparam: 'name={名前}',
      labelReqdata: '',
    },
    {
      label: 'get session string',
      value: 'session_get_string',
      labelUrlparam: 'name={名前}',
      labelReqdata: '',
    },
    {
      label: 'get session long',
      value: 'session_get_long',
      labelUrlparam: 'name={名前}',
      labelReqdata: '',
    },
    {
      label: 'set session feed',
      value: 'session_put_feed',
      labelUrlparam: 'name={名前}',
      labelReqdata: 'feed',
    },
    {
      label: 'set session entry',
      value: 'session_put_entry',
      labelUrlparam: 'name={名前}',
      labelReqdata: 'feed (entry1件)',
    },
    {
      label: 'set session string',
      value: 'session_put_string',
      labelUrlparam: 'name={名前}&val={値}',
      labelReqdata: '',
    },
    {
      label: 'set session long',
      value: 'session_put_long',
      labelUrlparam: 'name={名前}&val={数値}',
      labelReqdata: '',
    },
    {
      label: 'increment session',
      value: 'session_put_incr',
      labelUrlparam: 'name={名前}&val={数値}',
      labelReqdata: '',
    },
    {
      label: 'delete session feed',
      value: 'session_delete_feed',
      labelUrlparam: 'name={名前}',
      labelReqdata: '',
    },
    {
      label: 'delete session entry',
      value: 'session_delete_entry',
      labelUrlparam: 'name={名前}',
      labelReqdata: '',
    },
    {
      label: 'delete session string',
      value: 'session_delete_string',
      labelUrlparam: 'name={名前}',
      labelReqdata: '',
    },
    {
      label: 'delete session long',
      value: 'session_delete_long',
      labelUrlparam: 'name={名前}',
      labelReqdata: '',
    },
    {
      label: 'pagination',
      value: 'paging_pagination',
      labelUrlparam: 'key={キー}[&検索条件]&_pagination={ページ範囲}',
      labelReqdata: '',
    },
    {
      label: 'get page',
      value: 'paging_getpage',
      labelUrlparam: 'key={キー}[&検索条件]&n={ページ番号}',
      labelReqdata: '',
    },
    {
      label: 'post bigquery',
      value: 'bigquery_post',
      labelUrlparam: '[_async&tablenames={エンティティの第一階層名}:{テーブル名},...]',
      labelReqdata: 'feed',
    },
    {
      label: 'delete bigquery',
      value: 'bigquery_delete',
      labelUrlparam: 'key={キー[,キー,...]}[&async&tablenames={エンティティの第一階層名}:{テーブル名},...]',
      labelReqdata: '',
    },
    {
      label: 'get bigquery',
      value: 'bigquery_put',
      labelUrlparam: '[csv={ダウンロードファイル名]',
      labelReqdata: `{"feed" : {
        "title" : 「SQL」,
        "subtitle" : 「CSVヘッダ(任意)」,
        "category" : [
          {
            "___label" : 「パラメータ値(任意)」,
            "___term" : 「パラメータ型(任意)」
          }, ...
        ]
    }}`,
    },
    {
      label: 'create pdf',
      value: 'pdf',
      labelUrlparam: '[pdf={ダウンロードファイル名]',
      labelReqdata: 'PDFテンプレートHTML',
    },
    {
      label: 'put signature',
      value: 'signature_put_1',
      labelUrlparam: 'key={キー}[&r={リビジョン}]]',
      labelReqdata: '',
    },
    {
      label: 'put signatures',
      value: 'signature_put_2',
      labelUrlparam: '',
      labelReqdata: `[
        {
          "link" : [
            {"___rel": "self", "___href" : 「署名対象キー」}
          ]
        }, ...
      ]`,
    },
    {
      label: 'delete signature',
      value: 'signature_delete',
      labelUrlparam: 'key={キー}[&r={リビジョン}]]',
      labelReqdata: '',
    },
    {
      label: 'check signature',
      value: 'signature_get',
      labelUrlparam: 'key={キー}',
      labelReqdata: '',
    },
    {
      label: 'send mail',
      value: 'sendmail',
      labelUrlparam: 'to={to指定メールアドレス,...}[&cc={cc指定メールアドレス,...}&bcc={bcc指定メールアドレス,...}&attachments={添付ファイルのキー,...}]',
      labelReqdata: `{
        "title" : 「メールのタイトル」,
        "summary" : 「テキストメッセージ」,
        "content" : {
          "______text" : 「HTMLメッセージ」
        }
      }
      `,
    },
    {
      label: 'push notification',
      value: 'pushnotification',
      labelUrlparam: 'to={Push通知送信先(グループ、UID、アカウントのいずれか),...}[&imageUrl={通知イメージURL(FCM用)}]',
      labelReqdata: `{
        "title" : 「Push通知タイトル(任意)」,
        "subtitle" : 「Push通知サブタイトル(任意)」,
        "content" : {
          "______text" : 「Push通知メッセージ本文」
        },
        "category" : [
          {
            "___scheme" : 「dataのキー(Expo用)(任意)」,
            "___label" : 「dataの値(Expo用)(任意)」
          }, ...
        ]
      }
      `,
    },
    {
      label: 'set message queue status',
      value: 'messagequeue_put',
      labelUrlparam: 'channel={チャネル}&flag={true|false}',
      labelReqdata: '',
    },
    {
      label: 'send message queue',
      value: 'messagequeue_post',
      labelUrlparam: 'channel={チャネル}',
      labelReqdata: `
      [
        {
          "link" : [
            {"___rel": "to", "___href" : 「メッセージ送信先("*"(グループメンバー)、UID、アカウントのいずれか)」}
          ]
          "summary" : 「メッセージ」
          "title" : 「Push通知用タイトル(任意)」,
          "subtitle" : 「Push通知用サブタイトル(任意)」,
          "content" : {
            "______text" : 「Push通知用メッセージ本文」
          },
          "category" : [
            {
              "___scheme" : 「Push通知用dataのキー(Expo用)(任意)」,
              "___label" : 「Push通知用dataの値(Expo用)(任意)」
            }, ...
          ]
        }
      }
      `,
    },
    {
      label: 'get message queue',
      value: 'messagequeue_get',
      labelUrlparam: 'channel={チャネル}',
      labelReqdata: '',
    },
    {
      label: 'join group',
      value: 'group_put',
      labelUrlparam: 'group={グループ}&selfid={グループエイリアスの末尾名})',
      labelReqdata: '',
    },
    {
      label: 'leave group',
      value: 'group_delete',
      labelUrlparam: 'group={グループ}',
      labelReqdata: '',
    },
    {
      label: 'no group member',
      value: 'group_get',
      labelUrlparam: 'group={グループのエイリアス(/_user/{UID}/group)}',
      labelReqdata: '',
    },
    {
      label: 'send message',
      value: 'sendmessage',
      labelUrlparam: 'status={ステータス}&message={メッセージ}',
      labelReqdata: '',
    },
    {
      label: 'adduser by admin',
      value: 'user_post_adduserbyadmin',
      labelUrlparam: '',
      labelReqdata: `
      [
        {
          "contributor": [
              {
                  "uri": "urn:vte.cx:auth:{メールアドレス},{パスワード}",
                  "name": "{ニックネーム}"
              }
          ],
          "title": "メールのタイトル(任意)",
          "summary": "テキストメール本文(任意)",
          "content": {
              "______text": "HTMLメール本文(任意)"
          }
        },
        ...
      ]
      `,
    },
    {
      label: 'changepass by admin',
      value: 'user_put_changepassbyadmin',
      labelUrlparam: '',
      labelReqdata: `
      [
        {
          "contributor": [
            {
              "uri": "urn:vte.cx:auth:,{パスワード}"
            }
          ],
          "link": [
            {
              "___href": "/_user/{UID}/auth",
              "___rel": "self"
            }
          ]
        }
      ]
      `,
    },
    {
      label: 'change account',
      value: 'user_put_changeaccount',
      labelUrlparam: '',
      labelReqdata: `
      [
        {
            "contributor": [
                {
                    "uri": "urn:vte.cx:auth:{メールアドレス}"
                }
            ],
            "title": "メールのタイトル(任意)",
            "summary": "テキストメール本文(任意)",
            "content": {
                "______text": "HTMLメール本文(任意)"
            }
        }
      ]
      `,
    },
    {
      label: 'change account verify',
      value: 'user_put_changeaccount_verify',
      labelUrlparam: 'verify={認証コード}',
      labelReqdata: '',
    },
    {
      label: 'userstatus',
      value: 'user_get_userstatus',
      labelUrlparam: '[account={アカウント}]',
      labelReqdata: '',
    },
    {
      label: 'revoke user',
      value: 'user_put_revokeuser',
      labelUrlparam: 'account={アカウント}',
      labelReqdata: '',
    },
    {
      label: 'revoke users',
      value: 'user_put_revokeusers',
      labelUrlparam: '',
      labelReqdata: `(アカウント・UIDいずれかを指定) 
      [
        {
          "link": [
            {
              "___href": "/_user/{UID}",
              "___rel": "self"
            }
          ],
          "title": "{アカウント}"
        },
        ...
      ]
      `,
    },
    {
      label: 'activate user',
      value: 'user_put_activateuser',
      labelUrlparam: 'account={アカウント}',
      labelReqdata: '',
    },
    {
      label: 'activate users',
      value: 'user_put_activateusers',
      labelUrlparam: '',
      labelReqdata: `(アカウント・UIDいずれかを指定) 
      [
        {
          "link": [
            {
              "___href": "/_user/{UID}",
              "___rel": "self"
            }
          ],
          "title": "{アカウント}"
        },
        ...
      ]
      `,
    },
    {
      label: 'cancel user',
      value: 'user_delete_canceluser',
      labelUrlparam: '',
      labelReqdata: '',
    },
    {
      label: 'delete user',
      value: 'user_delete_deleteuser',
      labelUrlparam: 'account={アカウント}',
      labelReqdata: '',
    },
    {
      label: 'delete users',
      value: 'user_put_deleteusers',
      labelUrlparam: '',
      labelReqdata: `(アカウント・UIDいずれかを指定) 
      [
        {
          "link": [
            {
              "___href": "/_user/{UID}",
              "___rel": "self"
            }
          ],
          "title": "{アカウント}"
        },
        ...
      ]
      `,
    },
    {
      label: 'logout (/d)',
      value: 'logout',
      labelUrlparam: '',
      labelReqdata: '',
    },
  ]

  const onChangeOption = (eTarget:EventTarget & HTMLSelectElement) => {
    console.log(`[onChangeOption] start. ${eTarget.value}`)
    setAction(eTarget.value)
    for (const option of options) {
      if (eTarget.value === option.value) {
        setDescriptionUrlparam(option.labelUrlparam)
        setDescriptionReqdata(option.labelReqdata)
      }
    }
  }
   
  const doRequest = async () => {
    setResult('')
    console.log(`[doRequest] start. action=${action}`)
    // selectの値を取得
    let method
    let body
    let apiAction
    let additionalParam
    let isJson:boolean = true
    let filename = ''
    if (action === 'uid' || action === 'uid2' || action === 'whoami' || 
        action === 'isloggedin' || action === 'logout' || 
        action === 'getentry' || action === 'getfeed' || action === 'getcount' ||
        action === 'allocids' || action === 'getids' || action === 'getrangeids' ||
        action === 'sendmessage') {
      method = 'GET'
      apiAction = action
    } else if (action === 'log' || action === 'postentry' || action === 'sendmail' ||
        action === 'pushnotification') {
      method = 'POST'
      body = reqdata
      apiAction = action
    } else if (action === 'putentry' || action === 'addids' || action === 'setids' || 
        action === 'rangeids') {
      method = 'PUT'
      body = reqdata
      apiAction = action
    } else if (action === 'deleteentry' || action === 'deletefolder') {
      method = 'DELETE'
      apiAction = action
    } else if (action.startsWith('session_')) {
      const tmpAction = action.substring(8)
      console.log(`[request] 'session_' + '${tmpAction}'`)
      const idx = tmpAction.indexOf('_')
      method = tmpAction.substring(0, idx)
      additionalParam = `type=${tmpAction.substring(idx + 1)}`
      console.log(`[request] method=${method} additionalParam=${additionalParam}`)
      if (method) {
        apiAction = 'session'
        if (method === 'put') {
          body = reqdata
        }
      }
    } else if (action.startsWith('paging_')) {
      method = 'GET'
      apiAction = 'paging'
    } else if (action.startsWith('bigquery_')) {
      method = action.substring(9)
      apiAction = 'bigquery'
      if (method === 'post' || method === 'put') {
        body = reqdata
      }
      if (method === 'put' && urlparam.indexOf('csv') > -1) {
        isJson = false
        const idx = urlparam.indexOf('csv') + 4
        filename = urlparam.substring(idx)
      }
    } else if (action === 'pdf') {
      method = 'PUT'
      body = reqdata
      apiAction = action
      isJson = false
      const idx = urlparam.indexOf('pdf') + 4
      filename = urlparam.substring(idx)
    } else if (action.startsWith('signature_')) {
      const tmpAction = action.substring(10)
      let tmpIdx = tmpAction.indexOf('_')
      const idx = tmpIdx < 0 ? tmpAction.length : tmpIdx
      method = tmpAction.substring(0, idx)
      apiAction = 'signature'
      if (method === 'put') {
        body = reqdata
      }
    } else if (action.startsWith('messagequeue_')) {
      const tmpAction = action.substring(13)
      let tmpIdx = tmpAction.indexOf('_')
      const idx = tmpIdx < 0 ? tmpAction.length : tmpIdx
      method = tmpAction.substring(0, idx)
      apiAction = 'messagequeue'
      if (method === 'put' || method === 'post') {
        body = reqdata
      }
    } else if (action.startsWith('group_')) {
      method = action.substring(6)
      apiAction = 'group'
    } else if (action.startsWith('info_')) {
      method = 'GET'
      apiAction = 'info'
      additionalParam = `type=${action.substring(5)}`
    } else if (action.startsWith('user_')) {
      const tmpAction = action.substring(5)
      console.log(`[request] 'user_' + '${tmpAction}'`)
      const idx = tmpAction.indexOf('_')
      method = tmpAction.substring(0, idx)
      additionalParam = `type=${tmpAction.substring(idx + 1)}`
      console.log(`[request] method=${method} additionalParam=${additionalParam}`)
      if (method) {
        apiAction = 'user'
        if (method === 'post' || method === 'put') {
          body = reqdata
        }
      }
    }

    if (method != null && apiAction != null) {
      additionalParam = `${additionalParam ? additionalParam : ''}${targetservice ? (additionalParam ? '&' : '') + 'targetservice=' + targetservice : ''}`
      //console.log(`[request] edit additionalParam = ${additionalParam}`)
      const tmpUrlparam = `${urlparam ? urlparam : ''}${additionalParam ? (urlparam ? '&' : '') + additionalParam : ''}`
      //console.log(`[request] edit tmpUrlparam = ${tmpUrlparam}`)
      const data = await browserutil.requestApi(method, apiAction, tmpUrlparam, body)
      if (isJson || 'feed' in data) {
        const feedStr = JSON.stringify(data)
        console.log(`[doRequest] data=${feedStr}`)
        setResult(feedStr)
      } else {
        // データダウンロード
        console.log(`[doRequest] isJson=false data=${data}`)

        const anchor = document.createElement("a")
        anchor.href = URL.createObjectURL(data)
        anchor.download = filename
        document.body.appendChild(anchor)
        anchor.click()
        URL.revokeObjectURL(anchor.href)
        document.body.removeChild(anchor)
      }

    } else {
      setResult(`no action: ${action}`)
    }
  }
  
  const sizeText = 54
  const rowTextarea = 5
  const colsTextarea = 50
  const sizeTargetservice = 20

  return (
    <div>
      <Header title="vtecxnext テスト" />
      <label>【getServerSideProps】 is logged in: {props.isLoggedin}</label>
      <br/>
      <br/>
      <select name="action" value={action} onChange={(e) => onChangeOption(e.target)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      <label>&nbsp;&nbsp;&nbsp;&nbsp;</label>
      <label>連携サービス名: </label>
      <input type="text" size={sizeTargetservice} id="targetservice" name="targetservice" value={targetservice} 
                       onChange={(event) => setTargetservice(event.target.value)} />
      <br/>
      <table>
        <tbody>
          <tr>
            <td align="right" valign="top"><label>URLパラメータ: </label></td>
            <td valign="top"><input type="text" size={sizeText} id="urlparam" name="urlparam" value={urlparam} 
                       onChange={(event) => setUrlparam(event.target.value)} /></td>
            <td valign="top"><label>{descriptionUrlparam}</label></td>
          </tr>
          <tr>
            <td align="right" valign="top"><label>リクエストデータ: </label></td>
            <td valign="top"><textarea rows={rowTextarea} cols={colsTextarea} id="reqdata" name="reqdata" value={reqdata}
                       onChange={(event) => setReqdata(event.target.value)} /></td>
            <td valign="top"><label>{descriptionReqdata}</label></td>
          </tr>
        </tbody>
      </table>
      <br/>
      <button onClick={doRequest}>実行</button>
      <br/>
      <label>実行結果: </label>
      <br/>
      <p>{result}</p>
      <br/>

    </div>
  );
}

// propsの型を定義する
type Props = {
  isLoggedin?: string
}

// サーバサイドで実行する処理(getServerSideProps)を定義する
export const getServerSideProps:GetServerSideProps = async (context:GetServerSidePropsContext) => {
  // vtecxnext 呼び出し
  const isLoggedin = await vtecxnext.isLoggedin(context.req, context.res)

  const props: Props = {
    isLoggedin: String(isLoggedin)
  }
  console.log(`[vtecx_test getServerSideProps] props.isLoggedin=${props.isLoggedin}`)

  return {
    props: props,
  }
}

export default HomePage
