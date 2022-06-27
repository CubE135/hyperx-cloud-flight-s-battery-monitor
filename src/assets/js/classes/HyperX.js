const HID = require('node-hid')

module.exports = class HyperX {
    static VENDOR_ID = 2385
    static PRODUCT_ID = 5866

    constructor(updateDelay, debug = false) {
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
            throw new Error(new Error('HyperX Cloud Flight S Wireless was not found'))
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
        } catch (e) {
            console.error(e)
        }
    }

    runListener(tray, icons) {
        this.hidDevices.map((deviceInfo) => {
            const device = new HID.HID(deviceInfo.path)
        
            device.on('error', (err) => console.log(err))
            device.on('data', (data) => {
              if (this.debug) {
                console.log(new Date(), data, `length: ${data.length} hex: ${data.length.toString(16)}`)
                for (let byte of data) {
                  console.log(byte)
                }
              }
        
              switch (data.length) {
                case 0x3E:
                  let batteryPercentage = data[7]
                  if (data[5] != 0 && data[6] != 0 && data[3] == 2) {
                    tray.setToolTip('Battery: ' + batteryPercentage + '%')
                    if (this.debug) console.log('Battery: ' + batteryPercentage + '%')

                    if (batteryPercentage < 5) {
                      tray.setImage(icons['empty'])
                    }else if (batteryPercentage < 45) {
                      tray.setImage(icons['low'])
                    }else if(batteryPercentage < 55) {
                      tray.setImage(icons['half'])
                    }else if(batteryPercentage < 95) {
                      tray.setImage(icons['high'])
                    }else if(batteryPercentage > 95) {
                      tray.setImage(icons['full'])
                    }
                  }
                  break
                default:
                  break
              }
            })
        })
    }

    stop() {
        clearInterval(this.updateInterval);
    }
}