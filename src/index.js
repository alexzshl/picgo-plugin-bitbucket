// fork from : https://github.com/yuki-xin/picgo-plugin-web-uploader

// const logger = require('@varnxy/logger')
// logger.setDirectory('/Users/zhang/Work/WorkSpaces/WebWorkSpace/picgo-plugin-gitlab/logs')
// let log = logger('plugin')

module.exports = (ctx) => {
  const PLUGIN_ID = 'bitbucket'
  const PLUGIN_NAME = 'BitBucket'
  const PLUGIN_CONFIG_ID = 'picBed.bitbucket'

  const DEFAULT_API_URL = 'https://api.bitbucket.org/2.0'
  const DEFAULT_REPO_URL = 'https://bitbucket.org'

  const register = () => {
    ctx.helper.uploader.register(PLUGIN_ID, {
      handle,
      name: PLUGIN_NAME,
      config: config
    })
  }
  const handle = async function (ctx) {
    let userConfig = ctx.getConfig(PLUGIN_CONFIG_ID)
    if (!userConfig) {
      throw new Error('Can\'t find uploader config')
    }
    // const url = userConfig.URL || DEFAULT_API
    const workspace = userConfig.Workspace
    const project = userConfig.Project
    const token = userConfig.Token
    const srcPath = userConfig.Path

    // const realImgUrlPre = url + '/' + workspace + '/' + project
    // const realUrl = url + '/api/v4/projects/' + workspace + '%2F' + project + '/uploads'
    const realImgUrlPre = `${DEFAULT_REPO_URL}/${workspace}/${project}/raw/master`
    const realUrl = `${DEFAULT_API_URL}/repositories/${workspace}/${project}/src`

    // const metaUrlPre = `${DEFAULT_API_URL}/repositories/${workspace}/${project}/src/master`

    try {
      let imgList = ctx.output
      for (let i in imgList) {
        let image = imgList[i].buffer
        if (!image && imgList[i].base64Image) {
          image = Buffer.from(imgList[i].base64Image, 'base64')
        }

        const targetPath = srcPath + imgList[i].fileName
        const postConfig = postOptions(realUrl, token, targetPath, image, imgList[i].fileName)
        // let body = await ctx.Request.request(postConfig)
        let body = await ctx.request(postConfig)
        delete imgList[i].base64Image
        delete imgList[i].buffer
        // body = JSON.parse(body)
        console.log(body)
        imgList[i]['imgUrl'] = `${realImgUrlPre}${targetPath}`

        // let metaData = await ctx.Request.request({
        //   method: 'POST',
        //   url: metaUrlPre
        // })
        // metaData = JSON.parse(metaData)
      }
    } catch (err) {
      ctx.emit('notification', {
        title: '上传失败',
        body: JSON.stringify(err)
      })
    }
  }

  const postOptions = (url, token, targetPath, image, fileName) => {
    let headers = {
      contentType: 'multipart/form-data',
      'User-Agent': 'PicGo',
      'Authorization': 'Bearer ' + token
    }
    let formData = {
      [targetPath]: {
        'value': image,
        'options': {
          'filename': fileName
        }
      }
    }
    const opts = {
      method: 'POST',
      url: url,
      headers: headers,
      formData: formData
    }
    return opts
  }

  const config = ctx => {
    let userConfig = ctx.getConfig(PLUGIN_CONFIG_ID)
    if (!userConfig) {
      userConfig = {}
    }
    return [
      {
        name: 'URL',
        type: 'input',
        // default: userConfig.URL,
        default: 'https://bitbucket.org',
        required: false,
        // value: 'https://bitbucket.org',
        message: 'https://bitbucket.org',
        alias: 'URL'
      },
      {
        name: 'Workspace',
        type: 'input',
        default: userConfig.Workspace,
        required: true,
        message: 'Workspace',
        alias: 'Workspace'
      },
      {
        name: 'Project',
        type: 'input',
        default: userConfig.Project,
        required: true,
        message: 'Project',
        alias: 'Project'
      },
      {
        name: 'Token',
        type: 'input',
        default: userConfig.Token,
        required: true,
        message: 'project access token',
        alias: 'Token'
      },
      {
        name: 'Path',
        type: 'input',
        default: userConfig.Path,
        required: false,
        message: 'src path. such as "/src/images/"',
        alias: 'Path'
      }
    ]
  }
  return {
    uploader: 'bitbucket',
    // transformer: 'bitbucket',
    // config: config,
    register

  }
}
