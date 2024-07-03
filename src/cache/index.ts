import fs from 'fs'
import path from 'path'
import tokenCache from './tokens.json'

const fileLocation = path.join(__dirname, './tokens.json')

export const saveToken = (address: string, token: any) => { 
  tokenCache[address] = token
  fs.writeFileSync(fileLocation, JSON.stringify(tokenCache))
}

export const insertTokenData = (address: string, data: any) => {
  const newData = [...tokenCache[address].data, ...data];
  const offset = (newData.length - 20)
  tokenCache[address].data = newData.slice((offset < 0) ? 0 : offset)
  fs.writeFileSync(fileLocation, JSON.stringify(tokenCache))
}

export const getToken = (address: string): any => {
	return tokenCache[address] || null
}