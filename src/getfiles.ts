import FtpClient from 'ftp';
import later from '@breejs/later';
import { EventEmitter } from 'events';

interface FtpFilesOptions {
  ftpCredentials: FtpClient.Options;
  cron: string;
  fileExtension?: string;
  fileNameContains?: string;
}

class FtpFiles extends EventEmitter {
  private ftpCredentials: FtpClient.Options;
  private cron: string;
  private hasExtension: RegExp;
  private fileNameContains: RegExp;
  private client: FtpClient;
  private scheduler: later.Timer = null!;

  constructor(opts: FtpFilesOptions) {
    super();
    this.ftpCredentials = opts.ftpCredentials;
    this.cron = opts.cron.split(' ').length === 6 ? opts.cron : `0 ${opts.cron}`;
    this.hasExtension = opts.fileExtension ? new RegExp(opts.fileExtension) : /.+/;
    this.fileNameContains = opts.fileNameContains ? new RegExp(opts.fileNameContains) : /.+/;
    this.client = new FtpClient();
  }

  private async walk(dir: string = '.', pathArray: string[] = []): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.client.list(dir, (err, list) => {
        if (err) return reject(err);
        if (!list) return resolve(pathArray);

        let pending = list.length;
        list.forEach(fileInfo => {
          const newPath = `${dir}/${fileInfo.name}`;

          if (fileInfo.type === 'd' && !fileInfo.name.includes('.') && !fileInfo.name.includes('..')) {
            this.walk(newPath, pathArray)
              .then(() => {
                if (!--pending) resolve(pathArray);
              })
              .catch(err => reject(err));
          } else {
            pathArray.push(newPath);
            if (!--pending) resolve(pathArray);
          }
        });
      });
    });
  }

  getSnapshot() {
    this.walk('')
      .then(snapshot => {
        const filteredSnapshot = snapshot
          .map(x => x.replace('./', ''))
          .filter(x => {
            const fileName = x.split('/').pop() as string;
            return this.hasExtension.test(fileName) && this.fileNameContains.test(fileName);
          });
        this.emit('snapshot', filteredSnapshot);
        this.client.destroy();
      })
      .catch(err => this.emit('error', err));

    this.client.connect(this.ftpCredentials);
  }

  watch() {
    const watchSchedule = later.parse.cron(this.cron, true);
    this.scheduler = later.setInterval(this.getSnapshot.bind(this), watchSchedule);
  }

  stop() {
    if (this.scheduler) {
      this.scheduler.clear();
    }
    this.client.destroy();
    this.removeAllListeners();
  }
}

export default FtpFiles;
