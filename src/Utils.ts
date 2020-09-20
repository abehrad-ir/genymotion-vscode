export class Utils {

    static isMac(): boolean {
        return process.platform === "darwin" ? true : false;
    }

    static isWin(): boolean {
        return process.platform === "win32" ? true : false;
    }
}