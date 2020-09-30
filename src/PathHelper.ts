import { sep as separator } from 'path';
import { Utils } from './Utils';
import * as fs from 'fs';
import { execSync, exec, spawnSync, spawn } from 'child_process';

export class PathHelper {

    static readonly GENY_WIN_DEFAULT_PATH: string = "C:\\Program Files\\Genymobile\\Genymotion";
    static readonly GENY_MAC_DEFAULT_PATH: string = "/Applications/Genymotion.app";
    static readonly VBOX_WIN_DEFAULT_PATH: string = "C:\\Program Files\\Oracle\\VirtualBox";
    static readonly VBOX_MAC_DEFAULT_PATH: string = "/Applications/VirtualBox.app/Contents/MacOS";

    static findPathes(genyPath: string, vboxPath: string): Array<any> {
        vboxPath = "";
        return [
            this.verifyGenyPath(genyPath) === true ? genyPath :
            this.verifyGenyPath(Utils.isWin() ? this.GENY_WIN_DEFAULT_PATH : this.GENY_MAC_DEFAULT_PATH) === true ?
            Utils.isWin() ? this.GENY_WIN_DEFAULT_PATH : this.GENY_MAC_DEFAULT_PATH : false,
            this.verifyVBoxPath(vboxPath) === true ? vboxPath :
            this.verifyVBoxPath(Utils.isWin() ? this.VBOX_WIN_DEFAULT_PATH : this.VBOX_MAC_DEFAULT_PATH) === true ?
            Utils.isWin() ? this.VBOX_WIN_DEFAULT_PATH : this.VBOX_MAC_DEFAULT_PATH : 
            this.verifyVBoxInSysPath() === true ? true : this.verifyPathInWinReg()
        ];
    }

    static verifyPathInWinReg(): boolean | string {
        if (!Utils.isWin()) {
            return false;
        } else {
            let cmd: string =  "C:\\Windows\\System32";
            let result = spawnSync("reg.exe", ["query", "HKLM\\SOFTWARE\\Oracle\\VirtualBox", "-v", "InstallDir"], {
                cwd: cmd
            }).stdout.toString();
            let array = result.split(" ");
            array.reverse();
            let path = "";
            let index: number = 0;
            for (let i = 0; i < array.length; i++) {
                if (array[i] === "") {
                    index = i;
                    break;
                }
            }
            array.reverse();
            for (let i = array.length - index; i < array.length; i++) {
                path += " " + array[i];
            }
            return path.substring(1, path.length - 5);
        }
    }

    static verifyVBoxInSysPath(): Boolean {
        let result: string;
        try {
            result = execSync("VBoxManage --version").toString();
        } catch {
            return false;
        }
        return result.split('.').length === 3 ? true : false;
    }

    static verifyGenyPath(path: string): boolean {
        if (!path || path === "") {
            return false;
        } else {
            if (fs.existsSync(PathHelper.playerPath(path))) {
                return true;
            }
        }
        return false;
    }

    static genymotionPath(genyPath: string): string {
        if (Utils.isMac()) {
            genyPath += separator + "Contents" + separator + "MacOS";
        }
        genyPath += separator + (Utils.isWin() ? "genymotion.exe" : "genymotion");
        return genyPath;
    }

    static playerPath(genyPath: string): string {
        if (Utils.isMac()) {
            genyPath += separator + "Contents" + separator + "MacOS" + separator
                + "player.app" + separator + "Contents" + separator + "MacOS";
        }
        genyPath += separator + (Utils.isWin() ? "player.exe" : "player");
        return genyPath;
    }

    static verifyVBoxPath(path: string): boolean {
        if (!path || path === "") {
            return false;
        } else {
            if (Utils.isMac()) {
                path += separator + "Contents" + separator + "MacOS";
            }

            path = path.slice(-1) === "/" || path.slice(-1) === "\\" ? path : path + separator;
            path += Utils.isWin() ? "VBoxManage.exe" : "VBoxManage";
            if (fs.existsSync(path)) {
                return true;
            }
        }
        return false;
    }
}
