/*

Server Database

Structure:

{
  info: {
    host: host ip or domain
    port: port number (optional, default: 21)
    user: username for login (if set otherwise optional)
    password: password for login (if set otherwise optional)
  },
  additionalInfo: {
    name: ftp name for unique identification
  }
}


Add as many as you want. Separate by a Comma ( , )

*/


let ftpServers = 

[
  {
    info: {
      host: '92.205.7.115',
      user: 'see360degrees@studioclickhouse.com',
      password: '360degrees@2022'
    },
    additionalInfo: {
      name: 'See 360 Degrees'
    }
  },
  {
    info: {
      host: '92.205.7.115',
      user: 'jrphotography@studioclickhouse.com',
      password: 'jrphotography@2022'
    },
    additionalInfo: {
      name: 'JR Photography'
    }
  },
  {
    info: {
      host: '92.205.7.115',
      user: 'xostudio@studioclickhouse.com',
      password: 'xostudio@2022'
    },
    additionalInfo: {
      name: 'XO Studio'
    }
  },
  {
    info: {
      host: '92.205.7.115',
      user: 'hhstudio@studioclickhouse.com',
      password: 'hhstudio@2022'
    },
    additionalInfo: {
      name: 'HH Studio'
    }
  },
  {
    info: {
      host: '92.205.7.115',
      user: 'theblakeimage@studioclickhouse.com',
      password: 'blake@2022'
    },
    additionalInfo: {
      name: 'The Blake Image'
    }
  },
]



export default ftpServers
