import FtpClient from 'ftp'
import later from '@breejs/later'

class FtpFiles extends FtpClient {
  constructor (opts) {
    super(opts)
    this.ftpCredentials = opts.ftpCredentials
    this.cron = opts.cron.split(' ').length === 6
      ? opts.cron : `0 ${opts.cron}`
    this.hasExtension = opts.fileExtension ? RegExp(opts.fileExtension)
      : RegExp('.*')
    this.fileNameContains = opts.fileNameContains
      ? RegExp(opts.fileNameContains) : RegExp('.*')
  }

  getSnapshot () {
    const walk = (dir = '.', pathArray = []) => {
      return new Promise((resolve, reject) => {
        this.list(dir, (err, list) => {
          if (err) reject(err)
          if(!list) return

          let pending = list.length
          list.forEach(fileInfo => {
            const newPath = `${dir}/${fileInfo.name}`
            
            // type of 'd' === directory
            if (fileInfo.type === 'd' && !fileInfo.name.includes(".") && !fileInfo.name.includes("..")) {
              walk(newPath, pathArray)
                  .then(x => {
                    if (!--pending) resolve(pathArray)
                  })
                  .catch(err => reject(err))
            } else {
              pathArray.push(newPath)
              if (!--pending) resolve(pathArray)
            }
          })
        })
      })
    }

    walk('')
      .then(snapshot => {
        const filteredSnapshot = snapshot
          .map(x => x.replace('./', ''))
          .filter(x => {
            const fileName = x.split('/').pop()
            return this.hasExtension.test(fileName) &&
              this.fileNameContains.test(fileName)
          })
        this.emit('snapshot', filteredSnapshot)
        this.destroy()
      })
      .catch(err => this.emit('error', err))

    this.connect(this.ftpCredentials)
  }

  watch () {
    //this.on('ready', () => console.log('FTP server ready.'))
    //this.on('greeting', m => console.log(`Connected to: ${m}`))
    //this.on('close', () => console.log('FTP connection closed.'))

    const watchSchedule = later.parse.cron(this.cron, true)
    this.scheduler = later.setInterval(this.getSnapshot.bind(this), watchSchedule)
  }

  stop () {
    this.scheduler.clear()
    this.destroy()
    this.removeAllListeners()
  }

}

export default FtpFiles
