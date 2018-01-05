importScripts('three.min.js');
importScripts('OBJLoader.js');

var objLoader = new THREE.OBJLoader();
// console.log(THREE);
onmessage = function (e) {

  objLoader.load('sofa/M002700S10102021900C_H.obj', (object) => {

    var workerResult = object;
    postMessage(workerResult.toJSON());
  })
}