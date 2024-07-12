/*

Servers Database

Structure:

[{
  info: {
    host: host ip or domain
    port: port number (optional, default: 21)
    user: username for login (optional)
    password: password for login (optional)
  },
  additionalInfo: {
    name: ftp name for unique identification
  }
}]


Add as many as you want. Separate by a Comma ( , )

*/

interface FtpServersList {
  info: {
    host: string;
    port?: number;
    user?: string;
    password?: string;
  };
  additionalInfo?: {
    name: string;
  };
}



let ftpServers: [FtpServersList] = [
  {
    info: {
      host: "ftp.server.com",
    },
    additionalInfo: {
      name: "Server 1",
    },
  },
];

export default ftpServers;
