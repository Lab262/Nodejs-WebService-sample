
function databaseHost() {
  switch (process.env.NODE_ENV) {
    case 'development':
    return  ""
    case 'staging':
    return ""
    case 'production':
    return ""
    case 'test':
    return ""
    default :
    return ''
  }
  return process.env.NODE_ENV
}

function serverProtocolAndHost() {
  switch (process.env.NODE_ENV) {
    case 'development':
    return {
      protocol: "http://",
      host: "localhost:8080",
    }
    case 'staging':
    return {
      protocol: "http://",
      host: "ohmybox-stg.herokuapp.com",
    }
    case 'production':
    return  {
      protocol: "http://",
      host: "ohmybox-prod.herokuapp.com",
    }
    case 'test':
    return "localhost:8080"
    default :
    return ''
  }
  return process.env.NODE_ENV
}

module.exports = {

  'secret': ',9@4gk8+nYw,3EL2{Law7vzFZE46Ni&An=(88bY/Rpno$vnLbY',
  database: {
    host: databaseHost()
  },
  email: {
    username: "ohmyboxlab@gmail.com",
    password: "lab262$$$",
    accountName: "Oh! my box",
    verifyEmailUrl: "api/v0/auth/verifyEmail",
    forgotPasswordConfirmedUrl: "api/v0/auth/forgotPasswordConfirmed"

  },
  server: serverProtocolAndHost(),
  facebook: {
    passwordSecret: "AQWgd$j[QGe]Bh.Ugkf>?B3y696?2$#B2xwfN3hrVhFrE348g"
  }
}
