export default function newArrayData(data, key,value) {
  let resultData = [];
  data.forEach(item => {
    let newData = Object.assign({},item);
    if(newData[key].includes(value)){
      if(newData.children && newData.children.length) {
        newData.children = newArrayData(newData.children, key, value);
      }
      resultData.push(newData);
    }else{
      if(newData.children && newData.children.length) {
        newData.children = newArrayData(newData.children, key, value);
        if(newData.children && newData.children.length >= 1) {
          resultData.push(newData);
        }
      }
    }
  });
  return resultData;
}
