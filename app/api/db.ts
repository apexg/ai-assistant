const mysql = require('mysql2');
const Cache = require("node-cache");
import Profile from "./profile";

declare global {
  var cachedData: any;
  var pool: any;
}
global.cachedData = new Cache();

// 打开数据库
function openDb () {
  if (!global.pool) {
    global.pool = mysql.createPool({
      host: Profile.MySQL.Host,
      port: Profile.MySQL.Port,
      user: Profile.MySQL.User,
      password: Profile.MySQL.Pwd,
      database: Profile.MySQL.Database,
      waitForConnections: true,
      connectionLimit: 10,
      maxIdle: 10,
      idleTimeout: 60000,
      queueLimit: 0,
      supportBigNumbers: true,
      bigNumberStrings: true
    });
  }

  return global.pool;
}

// 生成一个bigint唯一值
export function bigInt() {
  const now = new Date();
  const timestamp = now.getTime().toString().slice(0, 6); // 获取当前时间的前6位作为时间戳
  const randomNum = Math.floor(Math.random() * (10 ** 13)).toString(); // 生成13位随机数
  const result = timestamp + randomNum; // 拼接时间戳与随机数
  return BigInt(result); // 返回BigInt数据类型的值
}

// 执行Sql操作
export function execDb(sql: string, params: any) {
  return new Promise((resolve, reject) => {
    const db = openDb();
    db.execute(sql, params.map((x: any) => (x === undefined ? null : x)), function(err: any, results: any, fields: any) {
      if (results) {
        resolve(results);
      } else {
        console.log(JSON.stringify(err));
        reject(err);
      }
    });
  });
}