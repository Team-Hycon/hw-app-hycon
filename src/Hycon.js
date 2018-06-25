/******************************************************************************
 *   Ledger Node JS API for Hycon
 *   (c) 2018 Hycon
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *****************************************************************************/
//@flow

import type Transport from "@ledgerhq/hw-transport";
import { splitPath, foreach } from "./utils";

/**
 * Hycon API
 *
 * @example
 * import Hycon from "@glosfer/hw-app-hycon";
 * const hycon = new Hycon(transport)
 */
export default class Hycon {
	transport: Transport<*>;

	constructor(transport: Transport<*>) {
		this.transport = transport;
		transport.decorateAppAPIMethods(
			this,
			[
				"getAddress",
				"signTransaction",
				"getAppConfig"
			],
			"w0w"
		);
	}

	/**
	 * get Hycon address for a given BIP 32 path.
	 * @param path a path in BIP 32 format
	 * @option boolDisplay optionally enable or not the display
	 * @return an object with a publicKey, address
	 * @example
	 * hycon.getAddress("44'/1397'/0'/0'/0").then(result => result.stringAddress)
	 */
	getAddress(
		path: string,
		boolDisplay?: boolean
	): Promise<{
		publicKey: string,
		hexAddress: string,
		stringAddress: string
	}> {
		let paths = splitPath(path);
		let buffer = new Buffer(1 + paths.length * 4);
		buffer[0] = paths.length;
		paths.forEach((element, index) => {
			buffer.writeUInt32BE(element, 1 + 4 * index);
		});
		return this.transport
			.send(
				0xe0,
				0x02,
				boolDisplay ? 0x01 : 0x00,
				0x00,
				buffer
			)
			.then(response => {
				let result = {};
				let publicKeyLength = response[0];
				let hexAddressLength = response[1 + publicKeyLength];
				let stringAddressLength = response[1 + publicKeyLength + 1 + hexAddressLength];
				console.log(stringAddressLength)
				result.publicKey = response
					.slice(1, 1 + publicKeyLength)
					.toString("hex");
				result.hexAddress =
					"0x" +
					response
						.slice(
							1 + publicKeyLength + 1,
							1 + publicKeyLength + 1 + hexAddressLength
						)
						.toString("hex");
				result.stringAddress =
					response
						.slice(
							1 + publicKeyLength + 1 + hexAddressLength + 1,
							1 + publicKeyLength + 1 + hexAddressLength + 1 + stringAddressLength
						)
						.toString("ascii");
				return result;
			});
	}

	/**
	 * You can sign a transaction and retrieve signature and recovery given the raw transaction and the BIP 32 path of the account to sign
	 * @param path a path in BIP32 format
	 * @param tx encoded (by protobuf) raw tx
	 * @example
	 * hycon.signTransaction("44'/1397'/0'/0'/0", "1214db6612b309d257a2aebd59b7445a900ed775d92118904e206428d209").then(result => result.signature)
	 */
	signTransaction(
		path: string,
		rawTxHex: string
	): Promise<{
		signature: string,
		recovery: number
	}> {
		let paths = splitPath(path);
		let rawTx = new Buffer(rawTxHex, "hex");
		let buffer = new Buffer(1 + paths.length * 4 + 1 + rawTx.length * 4);
		buffer[0] = paths.length;
		paths.forEach((element, index) => {
			buffer.writeUInt32BE(element, 1 + 4 * index);
		});
		buffer[paths.length * 4 + 1] = rawTx.length;
		rawTx.copy(buffer, 1 + 4 * paths.length + 1, 0, rawTx.length);
		return this.transport
			.send(
				0xe0,
				0x04,
				0x00,
				0x00,
				buffer
			)
			.then(response => {
				let result = {};
				result.signature = response
					.slice(1, 1 + 64)
					.toString("hex");
				result.recovery = response[0];
				return result;
			});
	}

	/**
	 * You can get ledger wallet's app Version
	 * @example
	 * hycon.getAppConfig().then(result => result.version)
	 */
	getAppConfig(): Promise<{
		version: string
	}> {
		return this.transport.send(0xe0, 0x06, 0x00, 0x00).then(response => {
			let result = {};
			result.version = "" + response[0] + "." + response[1] + "." + response[2];
			return result;
		});
	}
}
