/**
 * Copyright (c) Microsoft Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import path from 'path'
import fs from 'fs'
import * as util from 'util'
import * as crypto from 'crypto'
const mkdirAsync = util.promisify(fs.mkdir.bind(fs))
// See https://joel.tools/microtasks/
export function makeWaitForNextTask() {
  if (parseInt(process.versions.node, 10) >= 11) return setImmediate
  // Unlike Node 11, Node 10 and less have a bug with Task and MicroTask execution order:
  // - https://github.com/nodejs/node/issues/22257
  //
  // So we can't simply run setImmediate to dispatch code in a following task.
  // However, we can run setImmediate from-inside setImmediate to make sure we're getting
  // in the following task.
  let spinning = false
  const callbacks = []
  const loop = () => {
    const callback = callbacks.shift()
    if (!callback) {
      spinning = false
      return
    }
    setImmediate(loop)
    // Make sure to call callback() as the last thing since it's
    // untrusted code that might throw.
    callback()
  }
  return (callback) => {
    callbacks.push(callback)
    if (!spinning) {
      spinning = true
      setImmediate(loop)
    }
  }
}
export function assert(value, message) {
  if (!value) throw new Error(message)
}
export function debugAssert(value, message) {
  if (isUnderTest() && !value) throw new Error(message)
}
export function isString(obj) {
  return typeof obj === 'string' || obj instanceof String
}
export function isRegExp(obj) {
  return (
    obj instanceof RegExp ||
    Object.prototype.toString.call(obj) === '[object RegExp]'
  )
}
export function isObject(obj) {
  return typeof obj === 'object' && obj !== null
}
export function isError(obj) {
  return (
    obj instanceof Error ||
    (obj && obj.__proto__ && obj.__proto__.name === 'Error')
  )
}
const isInDebugMode = !!getFromENV('PWDEBUG')
export function isDebugMode() {
  return isInDebugMode
}
let _isUnderTest = false
export function setUnderTest() {
  _isUnderTest = true
}
export function isUnderTest() {
  return _isUnderTest
}
export function getFromENV(name) {
  let value = process.env[name]
  value =
    value === undefined
      ? process.env[`npm_config_${name.toLowerCase()}`]
      : value
  value =
    value === undefined
      ? process.env[`npm_package_config_${name.toLowerCase()}`]
      : value
  return value
}
export function getAsBooleanFromENV(name) {
  const value = getFromENV(name)
  return !!value && value !== 'false' && value !== '0'
}
export async function mkdirIfNeeded(filePath) {
  // This will harmlessly throw on windows if the dirname is the root directory.
  await mkdirAsync(path.dirname(filePath), { recursive: true }).catch(() => {})
}
export function headersObjectToArray(headers) {
  const result = []
  for (const name in headers) {
    if (!Object.is(headers[name], undefined))
      result.push({ name, value: headers[name] })
  }
  return result
}
export function headersArrayToObject(headers, lowerCase) {
  const result = {}
  for (const { name, value } of headers)
    result[lowerCase ? name.toLowerCase() : name] = value
  return result
}
export function monotonicTime() {
  const [seconds, nanoseconds] = process.hrtime()
  return seconds * 1000 + ((nanoseconds / 1000) | 0) / 1000
}
export function calculateSha1(buffer) {
  const hash = crypto.createHash('sha1')
  hash.update(buffer)
  return hash.digest('hex')
}
export function createGuid() {
  return crypto.randomBytes(16).toString('hex')
}
