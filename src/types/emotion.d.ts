// 为JSON文件添加类型声明
declare module '*.json' {
  const value: any;
  export default value;
}