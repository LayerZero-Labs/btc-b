import fs from "fs";
import * as aptos from 'aptos'
import os from "os";
import { bytesToHex } from '@noble/hashes/utils'
import * as bip39 from 'bip39'

export enum KeyType {
    HEX_PRIVATE_KEY = 0,
    JSON_FILE = 1,
    MNEMONIC = 2,
}

export function expandTilde(filepath: string): string {
    return filepath.replace(/^~/, os.homedir())
}

export function getAccountFromFile(file: string) {
    return getAccount(file, KeyType.JSON_FILE)
}

export function getAccount(key: string, keyType: KeyType, path: string = "m/44'/637'/0'/0'/0'"): aptos.AptosAccount {
    switch (keyType) {
        case KeyType.HEX_PRIVATE_KEY: {
            const privateKeyBytes = Uint8Array.from(Buffer.from(aptos.HexString.ensure(key).noPrefix(), 'hex'))
            return new aptos.AptosAccount(privateKeyBytes)
        }
        case KeyType.JSON_FILE: {
            const content = fs.readFileSync(expandTilde(key), 'utf8')
            const keyPair = JSON.parse(content)
            const privateKeyBytes = Uint8Array.from(
                Buffer.from(aptos.HexString.ensure(keyPair.privateKeyHex).noPrefix(), 'hex')
            )
            return new aptos.AptosAccount(privateKeyBytes)
        }
        case KeyType.MNEMONIC: {
            //https://aptos.dev/guides/building-your-own-wallet/#creating-an-aptos-account
            if (!aptos.AptosAccount.isValidPath(path)) {
                throw new Error(`Invalid derivation path: ${path}`)
            }
            const normalizeMnemonics = key
                .trim()
                .split(/\s+/)
                .map((part) => part.toLowerCase())
                .join(' ')
            {
                const { key } = aptos.derivePath(path, bytesToHex(bip39.mnemonicToSeedSync(normalizeMnemonics)))
                return new aptos.AptosAccount(new Uint8Array(key))
            }
        }
    }
}