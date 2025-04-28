// Assuming ByteArray type is defined elsewhere, likely as a Uint8Array wrapper
// For simplicity, we'll use Uint8Array directly here.
type ByteArray = Uint8Array

class ProtocolSingleton {
  private static instance: ProtocolSingleton

  private PKG_HEAD_BYTES = 4
  private MSG_FLAG_BYTES = 1
  private MSG_ROUTE_CODE_BYTES = 2
  private MSG_ID_MAX_BYTES = 5
  private MSG_ROUTE_LEN_BYTES = 1

  private MSG_ROUTE_CODE_MAX = 0xffff

  private MSG_COMPRESS_ROUTE_MASK = 0x1
  private MSG_TYPE_MASK = 0x7

  public Package = {
    TYPE_HANDSHAKE: 1,
    TYPE_HANDSHAKE_ACK: 2,
    TYPE_HEARTBEAT: 3,
    TYPE_DATA: 4,
    TYPE_KICK: 5,
    encode: this.encodePackage.bind(this),
    decode: this.decodePackage.bind(this),
  }

  public Message = {
    TYPE_REQUEST: 0,
    TYPE_NOTIFY: 1,
    TYPE_RESPONSE: 2,
    TYPE_PUSH: 3,
    encode: this.encodeMessage.bind(this),
    decode: this.decodeMessage.bind(this),
  }

  private constructor() {
    // Private constructor to prevent direct instantiation
  }

  public static getInstance(): ProtocolSingleton {
    if (!ProtocolSingleton.instance) {
      ProtocolSingleton.instance = new ProtocolSingleton()
    }
    return ProtocolSingleton.instance
  }

  public strencode(str: string): ByteArray {
    const byteArray = new Uint8Array(str.length * 3)
    let offset = 0
    for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i)
      let codes: number[] | null = null
      if (charCode <= 0x7f) {
        codes = [charCode]
      } else if (charCode <= 0x7ff) {
        codes = [0xc0 | (charCode >> 6), 0x80 | (charCode & 0x3f)]
      } else {
        codes = [
          0xe0 | (charCode >> 12),
          0x80 | ((charCode & 0xfc0) >> 6),
          0x80 | (charCode & 0x3f),
        ]
      }
      for (let j = 0; j < codes.length; j++) {
        byteArray[offset] = codes[j]
        ++offset
      }
    }
    const _buffer = new Uint8Array(offset)
    this.copyArray(_buffer, 0, byteArray, 0, offset)
    return _buffer
  }

  public strdecode(buffer: ArrayBuffer | Uint8Array): string {
    const bytes = new Uint8Array(buffer)
    const array: number[] = []
    let offset = 0
    let charCode = 0
    const end = bytes.length
    while (offset < end) {
      if (bytes[offset] < 128) {
        charCode = bytes[offset]
        offset += 1
      } else if (bytes[offset] < 224) {
        charCode = ((bytes[offset] & 0x3f) << 6) + (bytes[offset + 1] & 0x3f)
        offset += 2
      } else {
        charCode =
          ((bytes[offset] & 0x0f) << 12) +
          ((bytes[offset + 1] & 0x3f) << 6) +
          (bytes[offset + 2] & 0x3f)
        offset += 3
      }
      array.push(charCode)
    }
    return String.fromCharCode.apply(null, array)
  }

  private encodePackage(type: number, body?: ByteArray): ByteArray {
    const length = body ? body.length : 0
    const buffer = new Uint8Array(this.PKG_HEAD_BYTES + length)
    let index = 0
    buffer[index++] = type & 0xff
    buffer[index++] = (length >> 16) & 0xff
    buffer[index++] = (length >> 8) & 0xff
    buffer[index++] = length & 0xff
    if (body) {
      this.copyArray(buffer, index, body, 0, length)
    }
    return buffer
  }

  private decodePackage(
    buffer: ArrayBuffer | Uint8Array,
  ): { type: number; body: Uint8Array | null } | { type: number; body: Uint8Array | null }[] {
    let offset = 0
    const bytes = new Uint8Array(buffer)
    let length = 0
    const rs: { type: number; body: Uint8Array | null }[] = []
    while (offset < bytes.length) {
      const type = bytes[offset++]
      length = ((bytes[offset++] << 16) | (bytes[offset++] << 8) | bytes[offset++]) >>> 0
      const body = length ? new Uint8Array(length) : null
      if (body) {
        this.copyArray(body, 0, bytes, offset, length)
      }
      offset += length
      rs.push({ type: type, body: body })
    }
    return rs.length === 1 ? rs[0] : rs
  }

  private encodeMessage(
    id: number,
    type: number,
    compressRoute: number,
    route: number | string | null,
    msg?: ByteArray,
  ): ByteArray {
    // calculate message max length
    const idBytes = this.msgHasId(type) ? this.caculateMsgIdBytes(id) : 0
    let msgLen = this.MSG_FLAG_BYTES + idBytes

    if (this.msgHasRoute(type)) {
      if (compressRoute) {
        if (typeof route !== 'number') {
          throw new Error('error flag for number route!')
        }
        msgLen += this.MSG_ROUTE_CODE_BYTES
      } else {
        msgLen += this.MSG_ROUTE_LEN_BYTES
        if (route) {
          const encodedRoute = this.strencode(route as string)
          if (encodedRoute.length > 255) {
            throw new Error('route maxlength is overflow')
          }
          msgLen += encodedRoute.length
        }
      }
    }

    if (msg) {
      msgLen += msg.length
    }

    const buffer = new Uint8Array(msgLen)
    let offset = 0

    // add flag
    offset = this.encodeMsgFlag(type, compressRoute, buffer, offset)

    // add message id
    if (this.msgHasId(type)) {
      offset = this.encodeMsgId(id, buffer, offset)
    }

    // add route
    if (this.msgHasRoute(type)) {
      offset = this.encodeMsgRoute(compressRoute, route, buffer, offset)
    }

    // add body
    if (msg) {
      offset = this.encodeMsgBody(msg, buffer, offset)
    }

    return buffer
  }

  private decodeMessage(buffer: ArrayBuffer | Uint8Array): {
    id: number
    type: number
    compressRoute: number
    route: string | number | null
    body: Uint8Array
    isError: boolean
  } {
    const bytes = new Uint8Array(buffer)
    const bytesLen = bytes.length || bytes.byteLength
    let offset = 0
    let id = 0
    let route: string | number | null = null

    // parse flag
    const flag = bytes[offset++]
    const compressRoute = flag & this.MSG_COMPRESS_ROUTE_MASK
    const type = (flag >> 1) & this.MSG_TYPE_MASK

    const isError = !!(flag & 0x20) // Check if the error flag is set

    // parse id
    if (this.msgHasId(type)) {
      let m = parseInt(String(bytes[offset]))
      let i = 0
      do {
        m = parseInt(String(bytes[offset]))
        id = id + (m & 0x7f) * Math.pow(2, 7 * i)
        offset++
        i++
      } while (m >= 128)
    }

    // parse route
    if (this.msgHasRoute(type)) {
      if (compressRoute) {
        route = (bytes[offset++] << 8) | bytes[offset++]
      } else {
        const routeLen = bytes[offset++]
        if (routeLen) {
          const routeBytes = new Uint8Array(routeLen)
          this.copyArray(routeBytes, 0, bytes, offset, routeLen)
          route = this.strdecode(routeBytes)
        } else {
          route = ''
        }
        offset += routeLen
      }
    }

    // parse body
    const bodyLen = bytesLen - offset
    const body = new Uint8Array(bodyLen)

    this.copyArray(body, 0, bytes, offset, bodyLen)

    return {
      id: id,
      type: type,
      compressRoute: compressRoute,
      route: route,
      body: body,
      isError: isError,
    }
  }

  // private copyArray(
  //   dest: Uint8Array,
  //   doffset: number,
  //   src: Uint8Array,
  //   soffset: number,
  //   length: number,
  // ): void {
  //   if (typeof src.copy === 'function') {
  //     // Buffer (in Node.js environments)
  //     ;(src as Buffer).copy(dest as Buffer, doffset, soffset, soffset + length)
  //   } else {
  //     // Uint8Array (in browser and some Node.js environments)
  //     for (let index = 0; index < length; index++) {
  //       dest[doffset++] = src[soffset++]
  //     }
  //   }
  // }
  private copyArray(
    dest: Uint8Array,
    doffset: number,
    src: Uint8Array,
    soffset: number,
    length: number,
  ): void {
    for (let index = 0; index < length; index++) {
      dest[doffset++] = src[soffset++]
    }
  }
  private msgHasId(type: number): boolean {
    return type === this.Message.TYPE_REQUEST || type === this.Message.TYPE_RESPONSE
  }

  private msgHasRoute(type: number): boolean {
    return (
      type === this.Message.TYPE_REQUEST ||
      type === this.Message.TYPE_NOTIFY ||
      type === this.Message.TYPE_PUSH
    )
  }

  private caculateMsgIdBytes(id: number): number {
    let len = 0
    do {
      len += 1
      id >>= 7
    } while (id > 0)
    return len
  }

  private encodeMsgFlag(
    type: number,
    compressRoute: number,
    buffer: Uint8Array,
    offset: number,
  ): number {
    if (
      type !== this.Message.TYPE_REQUEST &&
      type !== this.Message.TYPE_NOTIFY &&
      type !== this.Message.TYPE_RESPONSE &&
      type !== this.Message.TYPE_PUSH
    ) {
      throw new Error('unknown message type: ' + type)
    }

    buffer[offset] = (type << 1) | (compressRoute ? 1 : 0)

    return offset + this.MSG_FLAG_BYTES
  }

  private encodeMsgId(id: number, buffer: Uint8Array, offset: number): number {
    do {
      let tmp = id % 128
      const next = Math.floor(id / 128)

      if (next !== 0) {
        tmp = tmp + 128
      }
      buffer[offset++] = tmp

      id = next
    } while (id !== 0)

    return offset
  }

  private encodeMsgRoute(
    compressRoute: number,
    route: number | string | null,
    buffer: Uint8Array,
    offset: number,
  ): number {
    if (compressRoute) {
      if (typeof route !== 'number' || route > this.MSG_ROUTE_CODE_MAX) {
        throw new Error('route number is overflow')
      }

      buffer[offset++] = (route >> 8) & 0xff
      buffer[offset++] = route & 0xff
    } else {
      if (route) {
        const encodedRoute = this.strencode(route as string)
        buffer[offset++] = encodedRoute.length & 0xff
        this.copyArray(buffer, offset, encodedRoute, 0, encodedRoute.length)
        offset += encodedRoute.length
      } else {
        buffer[offset++] = 0
      }
    }

    return offset
  }

  private encodeMsgBody(msg: ByteArray, buffer: Uint8Array, offset: number): number {
    this.copyArray(buffer, offset, msg, 0, msg.length)
    return offset + msg.length
  }
}

// Export the singleton instance
const Protocol = ProtocolSingleton.getInstance()
export default Protocol

// If you need to attach it to the window object in a browser environment:
if (typeof window !== 'undefined') {
  ;(window as any).Protocol = Protocol
}
// ;(function (exports, ByteArray, global) {
//   var Protocol = exports

//   var PKG_HEAD_BYTES = 4
//   var MSG_FLAG_BYTES = 1
//   var MSG_ROUTE_CODE_BYTES = 2
//   var MSG_ID_MAX_BYTES = 5
//   var MSG_ROUTE_LEN_BYTES = 1

//   var MSG_ROUTE_CODE_MAX = 0xffff

//   var MSG_COMPRESS_ROUTE_MASK = 0x1
//   var MSG_TYPE_MASK = 0x7

//   var Package = (Protocol.Package = {})
//   var Message = (Protocol.Message = {})

//   Package.TYPE_HANDSHAKE = 1
//   Package.TYPE_HANDSHAKE_ACK = 2
//   Package.TYPE_HEARTBEAT = 3
//   Package.TYPE_DATA = 4
//   Package.TYPE_KICK = 5

//   Message.TYPE_REQUEST = 0
//   Message.TYPE_NOTIFY = 1
//   Message.TYPE_RESPONSE = 2
//   Message.TYPE_PUSH = 3

//   /**
//    * pomele client encode
//    * id message id;
//    * route message route
//    * msg message body
//    * socketio current support string
//    */
//   Protocol.strencode = function (str) {
//     var byteArray = new ByteArray(str.length * 3)
//     var offset = 0
//     for (var i = 0; i < str.length; i++) {
//       var charCode = str.charCodeAt(i)
//       var codes = null
//       if (charCode <= 0x7f) {
//         codes = [charCode]
//       } else if (charCode <= 0x7ff) {
//         codes = [0xc0 | (charCode >> 6), 0x80 | (charCode & 0x3f)]
//       } else {
//         codes = [
//           0xe0 | (charCode >> 12),
//           0x80 | ((charCode & 0xfc0) >> 6),
//           0x80 | (charCode & 0x3f),
//         ]
//       }
//       for (var j = 0; j < codes.length; j++) {
//         byteArray[offset] = codes[j]
//         ++offset
//       }
//     }
//     var _buffer = new ByteArray(offset)
//     copyArray(_buffer, 0, byteArray, 0, offset)
//     return _buffer
//   }

//   /**
//    * client decode
//    * msg String data
//    * return Message Object
//    */
//   Protocol.strdecode = function (buffer) {
//     var bytes = new ByteArray(buffer)
//     var array = []
//     var offset = 0
//     var charCode = 0
//     var end = bytes.length
//     while (offset < end) {
//       if (bytes[offset] < 128) {
//         charCode = bytes[offset]
//         offset += 1
//       } else if (bytes[offset] < 224) {
//         charCode = ((bytes[offset] & 0x3f) << 6) + (bytes[offset + 1] & 0x3f)
//         offset += 2
//       } else {
//         charCode =
//           ((bytes[offset] & 0x0f) << 12) +
//           ((bytes[offset + 1] & 0x3f) << 6) +
//           (bytes[offset + 2] & 0x3f)
//         offset += 3
//       }
//       array.push(charCode)
//     }
//     return String.fromCharCode.apply(null, array)
//   }

//   /**
//    * Package protocol encode.
//    *
//    * Pomelo package format:
//    * +------+-------------+------------------+
//    * | type | body length |       body       |
//    * +------+-------------+------------------+
//    *
//    * Head: 4bytes
//    *   0: package type,
//    *      1 - handshake,
//    *      2 - handshake ack,
//    *      3 - heartbeat,
//    *      4 - data
//    *      5 - kick
//    *   1 - 3: big-endian body length
//    * Body: body length bytes
//    *
//    * @param  {Number}    type   package type
//    * @param  {ByteArray} body   body content in bytes
//    * @return {ByteArray}        new byte array that contains encode result
//    */
//   Package.encode = function (type, body) {
//     var length = body ? body.length : 0
//     var buffer = new ByteArray(PKG_HEAD_BYTES + length)
//     var index = 0
//     buffer[index++] = type & 0xff
//     buffer[index++] = (length >> 16) & 0xff
//     buffer[index++] = (length >> 8) & 0xff
//     buffer[index++] = length & 0xff
//     if (body) {
//       copyArray(buffer, index, body, 0, length)
//     }
//     return buffer
//   }

//   /**
//    * Package protocol decode.
//    * See encode for package format.
//    *
//    * @param  {ByteArray} buffer byte array containing package content
//    * @return {Object}           {type: package type, buffer: body byte array}
//    */
//   Package.decode = function (buffer) {
//     var offset = 0
//     var bytes = new ByteArray(buffer)
//     var length = 0
//     var rs = []
//     while (offset < bytes.length) {
//       var type = bytes[offset++]
//       length = ((bytes[offset++] << 16) | (bytes[offset++] << 8) | bytes[offset++]) >>> 0
//       var body = length ? new ByteArray(length) : null
//       copyArray(body, 0, bytes, offset, length)
//       offset += length
//       rs.push({ type: type, body: body })
//     }
//     return rs.length === 1 ? rs[0] : rs
//   }

//   /**
//    * Message protocol encode.
//    *
//    * @param  {Number} id            message id
//    * @param  {Number} type          message type
//    * @param  {Number} compressRoute whether compress route
//    * @param  {Number|String} route  route code or route string
//    * @param  {Buffer} msg           message body bytes
//    * @return {Buffer}               encode result
//    */
//   Message.encode = function (id, type, compressRoute, route, msg) {
//     // caculate message max length
//     var idBytes = msgHasId(type) ? caculateMsgIdBytes(id) : 0
//     var msgLen = MSG_FLAG_BYTES + idBytes

//     if (msgHasRoute(type)) {
//       if (compressRoute) {
//         if (typeof route !== 'number') {
//           throw new Error('error flag for number route!')
//         }
//         msgLen += MSG_ROUTE_CODE_BYTES
//       } else {
//         msgLen += MSG_ROUTE_LEN_BYTES
//         if (route) {
//           route = Protocol.strencode(route)
//           if (route.length > 255) {
//             throw new Error('route maxlength is overflow')
//           }
//           msgLen += route.length
//         }
//       }
//     }

//     if (msg) {
//       msgLen += msg.length
//     }

//     var buffer = new ByteArray(msgLen)
//     var offset = 0

//     // add flag
//     offset = encodeMsgFlag(type, compressRoute, buffer, offset)

//     // add message id
//     if (msgHasId(type)) {
//       offset = encodeMsgId(id, buffer, offset)
//     }

//     // add route
//     if (msgHasRoute(type)) {
//       offset = encodeMsgRoute(compressRoute, route, buffer, offset)
//     }

//     // add body
//     if (msg) {
//       offset = encodeMsgBody(msg, buffer, offset)
//     }

//     return buffer
//   }

//   /**
//    * Message protocol decode.
//    *
//    * @param  {Buffer|Uint8Array} buffer message bytes
//    * @return {Object}            message object
//    */
//   Message.decode = function (buffer) {
//     var bytes = new ByteArray(buffer)
//     var bytesLen = bytes.length || bytes.byteLength
//     var offset = 0
//     var id = 0
//     var route = null

//     // parse flag
//     var flag = bytes[offset++]
//     var compressRoute = flag & MSG_COMPRESS_ROUTE_MASK
//     var type = (flag >> 1) & MSG_TYPE_MASK

//     var isError = false //根据flag判断本次返回的包是否有错误码
//     if (flag & 0x20) {
//       isError = true
//     }

//     // parse id
//     if (msgHasId(type)) {
//       var m = parseInt(bytes[offset])
//       var i = 0
//       do {
//         var m = parseInt(bytes[offset])
//         id = id + (m & 0x7f) * Math.pow(2, 7 * i)
//         offset++
//         i++
//       } while (m >= 128)
//     }

//     // parse route
//     if (msgHasRoute(type)) {
//       if (compressRoute) {
//         route = (bytes[offset++] << 8) | bytes[offset++]
//       } else {
//         var routeLen = bytes[offset++]
//         if (routeLen) {
//           route = new ByteArray(routeLen)
//           copyArray(route, 0, bytes, offset, routeLen)
//           route = Protocol.strdecode(route)
//         } else {
//           route = ''
//         }
//         offset += routeLen
//       }
//     }

//     // parse body
//     var bodyLen = bytesLen - offset
//     var body = new ByteArray(bodyLen)

//     copyArray(body, 0, bytes, offset, bodyLen)

//     return {
//       id: id,
//       type: type,
//       compressRoute: compressRoute,
//       route: route,
//       body: body,
//       isError: isError,
//     }
//   }

//   var copyArray = function (dest, doffset, src, soffset, length) {
//     if ('function' === typeof src.copy) {
//       // Buffer
//       src.copy(dest, doffset, soffset, soffset + length)
//     } else {
//       // Uint8Array
//       for (var index = 0; index < length; index++) {
//         dest[doffset++] = src[soffset++]
//       }
//     }
//   }

//   var msgHasId = function (type) {
//     return type === Message.TYPE_REQUEST || type === Message.TYPE_RESPONSE
//   }

//   var msgHasRoute = function (type) {
//     return (
//       type === Message.TYPE_REQUEST || type === Message.TYPE_NOTIFY || type === Message.TYPE_PUSH
//     )
//   }

//   var caculateMsgIdBytes = function (id) {
//     var len = 0
//     do {
//       len += 1
//       id >>= 7
//     } while (id > 0)
//     return len
//   }

//   var encodeMsgFlag = function (type, compressRoute, buffer, offset) {
//     if (
//       type !== Message.TYPE_REQUEST &&
//       type !== Message.TYPE_NOTIFY &&
//       type !== Message.TYPE_RESPONSE &&
//       type !== Message.TYPE_PUSH
//     ) {
//       throw new Error('unkonw message type: ' + type)
//     }

//     buffer[offset] = (type << 1) | (compressRoute ? 1 : 0)

//     return offset + MSG_FLAG_BYTES
//   }

//   var encodeMsgId = function (id, buffer, offset) {
//     do {
//       var tmp = id % 128
//       var next = Math.floor(id / 128)

//       if (next !== 0) {
//         tmp = tmp + 128
//       }
//       buffer[offset++] = tmp

//       id = next
//     } while (id !== 0)

//     return offset
//   }

//   var encodeMsgRoute = function (compressRoute, route, buffer, offset) {
//     if (compressRoute) {
//       if (route > MSG_ROUTE_CODE_MAX) {
//         throw new Error('route number is overflow')
//       }

//       buffer[offset++] = (route >> 8) & 0xff
//       buffer[offset++] = route & 0xff
//     } else {
//       if (route) {
//         buffer[offset++] = route.length & 0xff
//         copyArray(buffer, offset, route, 0, route.length)
//         offset += route.length
//       } else {
//         buffer[offset++] = 0
//       }
//     }

//     return offset
//   }

//   var encodeMsgBody = function (msg, buffer, offset) {
//     copyArray(buffer, offset, msg, 0, msg.length)
//     return offset + msg.length
//   }

//   if (typeof window != 'undefined') {
//     window.Protocol = Protocol
//   }
// })(
//   typeof window == 'undefined' ? module.exports : {},
//   typeof window == 'undefined' ? Buffer : Uint8Array,
//   this,
// )
