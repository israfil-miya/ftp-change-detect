import FtpFiles from './getfiles.js'
import nodemailer from "nodemailer"
import * as dotenv from 'dotenv'
dotenv.config()

let myEmail = process.env.EMAIL
let googleEmailPass = process.env.PASS

let personEmail = process.env.SENDMAILTO



async function sendMailTo(email, htmlBody) {
  let testAccount = await nodemailer.createTestAccount();

  let transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    auth: {
      user: myEmail,
      pass: googleEmailPass,
    },
  });

  let info = await transporter.sendMail({
    from: '"'+process.env.SHOWNAME+'" <no-reply@ftp.com>',
    to: email,
    subject: "Update",
    html: htmlBody
  });

}


function credentialsDefiner(){
  
  let credentials = {
    connTimeout: 300000,
    pasvTimeout: 300000,
  }
  
  let host = process.env.HOST
  let port = process.env.FTPPORT
  let user = process.env.USERNAME
  let password = process.env.PASSWORD
  let anonymous = process.env.ANONYMOUS
  
  credentials.host = host
  if(port) credentials.port = port
  if (!anonymous) {
    credentials.user = user
    credentials.password = password
  }
  
  return credentials
  
}

const ftpCredentials = credentialsDefiner()

let prevArray = []

const speedtestWatcher = new FtpFiles({
  ftpCredentials: ftpCredentials,
  cron: process.env.INTERVALCRON
  // fileExtension: '.zip', // optional
  // fileNameContains: 'GB' // optional
})

Array.prototype.diff = (arr2) => {
  return this.filter(x => !arr2.includes(x));
}

const handleSnapshot = async (snapshot) => {

  if (snapshot != prevArray) {
    if (prevArray.length) {
      if (prevArray.length > snapshot.length) {
        console.log("\n")
        console.log("FILE/s DELETED !!")
        await sendMailTo(personEmail, "<h3>SOME FILE/s MAY GOT DELETED, CHECK THE FTP SERVER</h3>")
      }
      if (prevArray.length < snapshot.length) {
        console.log("\n")
        console.log("FILE/s ADDED !!")

        await sendMailTo(personEmail, "<h3>NEW FILE/s GOT ADDED, CHECK THE FTP SERVER</h3>")

      }
    } else {
      console.log("\n")
      console.log("NO CHANGES DETECTED, TILL NOW !! (PROBABLY BECAUSE OF FIRST INITIALIZATION)")
    }
    prevArray = snapshot
  } else prevArray = snapshot
  console.log("\n")
  console.log(prevArray)
  console.log("\n")

  //speedtestWatcher.stop()
}

const handleError = (error) => {
  console.error(error)
}

speedtestWatcher.on('error', handleError)
speedtestWatcher.on('snapshot', handleSnapshot)

speedtestWatcher.watch()

//
