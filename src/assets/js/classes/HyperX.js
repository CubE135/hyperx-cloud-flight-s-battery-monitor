const HID = require('node-hid')

module.exports = class HyperX {
  static VENDOR_ID = 2385
  static PRODUCT_ID = 5866

  constructor(tray, icons, updateDelay, debug = false) {
    this.tray = tray
    this.icons = icons
    this.updateDelay = updateDelay
    this.debug = debug
    this.init()
  }

  init(){
    const platform = process.platform
    if (platform == "win32" || platform == "win64") {
      HID.setDriverType('libusb')
    }
    
    this.hidDevices = HID.devices().filter(
      (d) => d.vendorId === HyperX.VENDOR_ID && d.productId === HyperX.PRODUCT_ID
    )

    if (this.hidDevices.length === 0) {
      this.tray.setImage(this.icons['no_connection'])
      this.tray.setToolTip('Device not connected...')
    }

    this.hidDevice = this.hidDevices.find(
      (d) => d.usagePage === 65299
    )
  }

  runStatusUpdaterInterval() {
    const _this = this
    this.sendBatteryUpdateBuffer(_this)
    this.updateInterval = setInterval(() => { this.sendBatteryUpdateBuffer(_this) }, this.updateDelay * 60 * 1000)
  }

  sendBatteryUpdateBuffer(_this) {
    let device = new HID.HID(_this.hidDevice.path)
    try {
      // Battery Status Buffer
      const buffer = Buffer.from([
        0x06,
        0x00,
        0x02,
        0x00,
        0x9a,
        0x00,
        0x00,
        0x68,
        0x4a,
        0x8e,
        0x0a,
        0x00,
        0x00,
        0x00,
        0xbb,
        0x02,
      ])
      device.write(buffer)
      device.close()
    } catch (e) {
      console.error(e)
    }
  }

  runListener() {
    this.hidDevices.map((deviceInfo) => {
      deviceInfo.deviceHID = new HID.HID(deviceInfo.path)

      deviceInfo.deviceHID.on('error', (err) => console.log(err))
      deviceInfo.deviceHID.on('data', (data) => {
        if (this.debug) {
          console.log(new Date(), data, `length: ${data.length} hex: ${data.length.toString(16)}`)
          for (let byte of data.slice(0, 10)) {
            console.log(byte)
          }
        }

        switch (data.length) {
          case 0x3E:
            let batteryPercentage = data[7]
            if (data[5] != 0 && data[6] != 0 && data[3] == 2) {
              // Battery Status
              this.tray.setToolTip('Battery: ' + batteryPercentage + '%')
              if (this.debug) console.log('Battery: ' + batteryPercentage + '%')

              if (batteryPercentage < 5) {
                this.tray.setImage(this.icons['empty'])
              }else if (batteryPercentage < 45) {
                this.tray.setImage(this.icons['low'])
              }else if(batteryPercentage < 55) {
                this.tray.setImage(this.icons['half'])
              }else if(batteryPercentage < 95) {
                this.tray.setImage(this.icons['high'])
              }else if(batteryPercentage > 95) {
                this.tray.setImage(this.icons['full'])
              }
            } else if (data[3] == 1 && data[4] == 1){
              // Turned on
              this.sendBatteryUpdateBuffer(this)
            }
            break
          default:
            break
        }
      })
    })
  }

  stop() {
    this.hidDevices.map((deviceInfo) => {
      deviceInfo.deviceHID.close()
    })
    clearInterval(this.updateInterval);
  }
}