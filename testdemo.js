var ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
var ALPHABET_MAP = {};
var BASE = 58;
for (var i = 0; i < ALPHABET.length; i++) {
  ALPHABET_MAP[ALPHABET.charAt(i)] = i;
}

function ToUTF8(str) {
  var result = new Array();

  var k = 0;
  for (var i = 0; i < str.length; i++) {
    var j = encodeURI(str[i]);
    if (j.length == 1) {
      // 未转换的字符
      result[k++] = j.charCodeAt(0);
    } else {
      // 转换成%XX形式的字符
      var bytes = j.split("%");
      for (var l = 1; l < bytes.length; l++) {
        result[k++] = parseInt("0x" + bytes[l]);
      }
    }
  }

  return result;
}


// 如果有特殊需求，要转成utf16，可以用以下函数
function ToUTF16(str) {
  var result = new Array();

  var k = 0;
  for (var i = 0; i < str.length; i++) {
    var j = str[i].charCodeAt(0);
    result[k++] = j & 0xFF;
    result[k++] = j >> 8;
  }

  return result;
}

function encode(buffer) {
  if (buffer.length === 0) return '';
  var i,
    j,
    digits = [0];
  for (i = 0; i < buffer.length; i++) {
    for (j = 0; j < digits.length; j++) {
      // 将数据转为二进制，再位运算右边添8个0，得到的数转二进制
      // 位运算-->相当于 digits[j].toString(2);parseInt(10011100000000,2)
      digits[j] <<= 8;
    }
    digits[0] += buffer[i];
    var carry = 0;
    for (j = 0; j < digits.length; ++j) {
      digits[j] += carry;
      carry = (digits[j] / BASE) | 0;
      digits[j] %= BASE;
    }
    while (carry) {
      digits.push(carry % BASE);
      carry = (carry / BASE) | 0;
    }
  }
  // deal with leading zeros
  for (i = 0; buffer[i] === 0 && i < buffer.length - 1; i++) digits.push(0);
  return digits
    .reverse()
    .map(function (digit) {
      return ALPHABET[digit];
    })
    .join('');
}

// ToUTF8('6嘎') --->[54, 229, 152, 142]
// encode(ToUTF8('6嘎')) -- - > 2 QPT7B
console.log(encode(ToUTF8('0x90608e86B4D352A2E8e649f235E01bD4772E03f7')))
// string ---> 加密后的字符串
function decode(string) {
  if (string.length === 0) return [];
  var i,
    j,
    bytes = [0];
  for (i = 0; i < string.length; i++) {
    var c = string[i];
    // c是不是ALPHABET_MAP的key 
    if (!(c in ALPHABET_MAP)) throw new Error('Non-base58 character');
    for (j = 0; j < bytes.length; j++) bytes[j] *= BASE;
    bytes[0] += ALPHABET_MAP[c];
    var carry = 0;
    for (j = 0; j < bytes.length; ++j) {
      bytes[j] += carry;
      carry = bytes[j] >> 8;
      // 0xff --> 11111111
      bytes[j] &= 0xff;
    }
    while (carry) {
      bytes.push(carry & 0xff);
      carry >>= 8;
    }
  }
  // deal with leading zeros
  for (i = 0; string[i] === '1' && i < string.length - 1; i++) bytes.push(0);
  return bytes.reverse();
}

// [54, 229, 152, 142]
console.log(decode('ovHax8ujvSLtKgsCC5EsmTBWopZ8sUqh6to7vk66Ck7oqdxYz6q1vFL4D'))

// ovHax8ujvSLtKgsCC5EsmTBWopZ8sUqh6to7vk66Ck7oqdxYz6q1vFL4D
// IONCEAPyWDS3qEdVFbw7XHBSks3JbBqr9CvZt