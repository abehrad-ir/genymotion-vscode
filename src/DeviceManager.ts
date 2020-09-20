import { sep as separator } from 'path';
import './Utils';
import * as fs from 'fs';
import { spawnSync, spawn } from 'child_process';
import { Utils } from './Utils';

interface DevicesList {
    name: string;
    uuid: string;
    android_version: string;
    ip: string,
    state: string,
}


export class DeviceManager {

    genyPath: string;
    vboxPath: string;

    constructor(genyPath: string, vboxPath: string) {
        this.genyPath = genyPath;
        this.vboxPath = vboxPath;
    }

    private vBoxManageName(): string {
        return Utils.isWin() ? "VBoxManage.exe" : "VBoxManage";
    }

    private playerName(): string {
        return Utils.isWin() ? "player.exe" : "player";
    }

    private isGenymotionDevice(uuid: string): boolean {
        for (let line of spawnSync(this.vBoxManageName(), ["guestproperty", "enumerate", uuid], {
            cwd: this.vboxPath
        }).stdout.toString().split("\n")) {
            if (line.search("vbox_graph_mode") !== -1) {
                return true;
            }
        }
        return false;
    }

    private getAndroidVersions(uuid: string) {
        for (let line of spawnSync(this.vBoxManageName(), ["guestproperty", "enumerate", uuid], {
            cwd: this.vboxPath
        }).stdout.toString().split("\n")) {
            if (line.search("android_version") !== -1) {
                return line.substring(line.indexOf("value: ") + 7, line.indexOf("timestamp: ") - 2);
            }
        }
        return "4.1.1";
    }

    private getIPAddress(uuid: string) {
        for (let line of spawnSync(this.vBoxManageName(), ["guestproperty", "enumerate", uuid], {
            cwd: this.vboxPath
        }).stdout.toString().split("\n")) {
            if (line.search("androvm_ip_management") !== -1) {
                let ip = line.substring(line.indexOf("value: ") + 7, line.indexOf("timestamp: ") - 2);
                return ip === "" ? "No IP Address" : ip;
            }
        }
        return "0";
    }
    
    private strContain(str: string, con: string): boolean {
        return str.search(con) !== -1 ? true : false;
    }

    private getStatus(uuid: string): string {
        for (let line of spawnSync(this.vBoxManageName(), ["showvminfo", uuid], {
            cwd: this.vboxPath
        }).stdout.toString().split("\n")) {
            if (line.search("State: ") !== -1) {
                return this.strContain(line, "powered off") ? "Powered Off" :
                this.strContain(line, "running") ? "Running" :
                this.strContain(line, "paused") ? "Paused" :
                this.strContain(line, "aborted") ? "Aborted" : "";
            }
        }
        return "";
    }

    startDevice(uuid: string) {
        spawn(this.playerName(), ["--vm-name", uuid], {
            cwd: this.genyPath,
            stdio: 'ignore',
            detached: true
        }).unref();
    }

    devicesList(): DevicesList[] {
        let ret: DevicesList[] = [];
        let result = spawnSync(this.vBoxManageName(), ["list", "vms"], {
            cwd: this.vboxPath,
        }).stdout.toString();
        let devices = result.split("\r\n");
        devices.pop();
        for (let device of devices) {
            let name = device.substring(1, device.lastIndexOf('"'));
            let uuid = device.substring(device.lastIndexOf('{') + 1, device.lastIndexOf('}'));
            
            if (this.isGenymotionDevice(uuid)) {
                ret.push({
                name: name,
                uuid: uuid,
                android_version: this.getAndroidVersions(uuid),
                ip: this.getIPAddress(uuid),
                state: this.getStatus(uuid)
                });
            }
        }
        return ret;
    }


}