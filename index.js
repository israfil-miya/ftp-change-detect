import FtpFiles from './getfiles.js'
import ftpServers from "./serversList.js"
import nodemailer from "nodemailer"
import * as dotenv from 'dotenv'
dotenv.config()


let myEmail = process.env.EMAIL
let googleEmailPass = process.env.PASS
let personEmail = process.env.SENDMAILTO



async function sendMailTo(email, htmlBody) {

  let transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    auth: {
      user: myEmail,
      pass: googleEmailPass,
    },
  });

  let info = await transporter.sendMail({
    from: '"' + process.env.SHOWNAME + '" <no-reply@ftp.com>',
    to: email,
    subject: "Update",
    html: htmlBody
  });

}


ftpServers.map((serverInfo, index) => {



  let ftpCredentials = serverInfo.info

  let prevArray = []

  const studioClickHouseFTPwatcher = new FtpFiles({
    ftpCredentials,
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
          console.log("FILE/s DELETED !!")

          await sendMailTo(personEmail, `<h3>SOME FILE/s MAY GOT DELETED, CHECK THE FTP SERVER OF ${serverInfo.additionalInfo.name} </h3>`)
        }
        if (prevArray.length < snapshot.length) {
          console.log("FILE/s ADDED !!")

          await sendMailTo(personEmail, `<h3>GOT NEW FILE/s, CHECK THE FTP SERVER OF ${serverInfo.additionalInfo.name} </h3>`)

        }
      } else {
        console.log("NO CHANGES DETECTED, TILL NOW !! (PROBABLY BECAUSE OF FIRST INITIALIZATION)", serverInfo.additionalInfo.name)
      }
      prevArray = snapshot
    } else prevArray = snapshot
    console.log(prevArray)

    //studioClickHouseFTPwatcher.stop()
  }

  const handleError = (error) => {
    console.error(error)
  }

  studioClickHouseFTPwatcher.on('error', handleError)
  studioClickHouseFTPwatcher.on('snapshot', handleSnapshot)

  studioClickHouseFTPwatcher.watch()

})

//