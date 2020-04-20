import { MD5 } from './MD5'
export default class Utils {

    private static gid: number = 1
    private static md5 = new MD5()

 

    public static getGID(): number {
        return this.gid++
    }

 
    public static getObjLen(object: any): number {
        let len = 0
        for (const key in object) {
            if (object.hasOwnProperty(key)) len++
        }
        return len
    }
    
    //得到对象实例的唯一标识符_$gid ，用于区分每一个对象
    public static getObjectGID(obj: any) {
        if (!obj) return null

        if (!obj["_$gid"]) {
            obj["_$gid"] = "objId_" + Utils.getGID();
        }
        return obj["_$gid"]
    }

    public static getMD5(info: string): string {
        return Utils.md5.hex_md5(info)
    }
}