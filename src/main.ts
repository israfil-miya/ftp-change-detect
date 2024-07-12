import FtpFiles from './getfiles';
import ftpServers from "./serversList";
import nodemailer from "nodemailer";
import * as dotenv from 'dotenv';

dotenv.config();

const myEmail = process.env.EMAIL as string;
const googleEmailPass = process.env.PASS as string;
const personEmail = process.env.SENDMAILTO as string;

async function sendMailTo(email: string, htmlBody: string): Promise<void> {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    auth: {
      user: myEmail,
      pass: googleEmailPass,
    },
  });

  await transporter.sendMail({
    from: `"${process.env.SHOWNAME}" <no-reply@ftp.com>`,
    to: email,
    subject: "Update",
    html: htmlBody,
  });
}

ftpServers.map((serverInfo: any, index: number) => {
  const ftpCredentials = serverInfo.info;

  let prevArray: string[] = [];

  const FTPwatcher = new FtpFiles({
    ftpCredentials,
    cron: process.env.INTERVALCRON as string,
    // fileExtension: '.zip', // optional
    // fileNameContains: 'GB' // optional
  });

  (Array.prototype as any).diff = function (arr2: string[]) {
    return this.filter((x: string) => !arr2.includes(x));
  }

  const handleSnapshot = async (snapshot: string[]) => {
    if (snapshot.toString() !== prevArray.toString()) {
      if (prevArray.length) {
        if (prevArray.length > snapshot.length) {
          console.log("FILE/s DELETED !!");
          await sendMailTo(personEmail, `<h3>SOME FILE/s MAY GOT DELETED, CHECK THE FTP SERVER OF ${serverInfo.additionalInfo.name}</h3>`);
        }
        if (prevArray.length < snapshot.length) {
          console.log("FILE/s ADDED !!");
          await sendMailTo(personEmail, `<h3>GOT NEW FILE/s, CHECK THE FTP SERVER OF ${serverInfo.additionalInfo.name}</h3>`);
        }
      } else {
        console.log("NO CHANGES DETECTED, TILL NOW !! (PROBABLY BECAUSE OF FIRST INITIALIZATION)", serverInfo.additionalInfo.name);
      }
      prevArray = snapshot;
    } else {
      prevArray = snapshot;
    }
    console.log(prevArray);

    // FTPwatcher.stop()
  }

  const handleError = (error: Error) => {
    console.error(error);
  }

  FTPwatcher.on('error', handleError);
  FTPwatcher.on('snapshot', handleSnapshot);

  FTPwatcher.watch();

});
