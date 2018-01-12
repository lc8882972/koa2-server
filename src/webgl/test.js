const THREE = require('three')
const numeric = require('numeric');
import './Orbit3DControls'

export default (dom) => {
  var camera, scene, renderer, orbitControl;
  var mouse = new THREE.Vector3();
  var dataPoints, mesh, obbLine;

  init();
  animate();

  // document.querySelector('#bttn').addEventListener('click', function () {
  //   scene.remove(dataPoints);
  //   scene.remove(obbLine);
  //   dataPoints = new THREE.Object3D();
  //   scene.add(dataPoints);
  // })

  function init() {
    scene = new THREE.Scene();

    // camera = new THREE.OrthographicCamera(-50, 50, 50, -50, -10, 10);
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 10;
    scene.add(camera);
    orbitControl = new THREE.Orbit3DControls(camera, dom);

    ////////////////////////////////////////////
    dataPoints = new THREE.Object3D();
    scene.add(dataPoints);

    mesh = new THREE.Mesh(new THREE.CircleGeometry(1, 16), new THREE.MeshBasicMaterial());
    //////////////////////////////////////////////////////////

    var gridXZ = new THREE.GridHelper(50, 10, new THREE.Color(0xff00ff), new THREE.Color(0xffffff));

    gridXZ.rotation.x = Math.PI / 2;
    //scene.add(gridXZ);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x888888);

    dom.appendChild(renderer.domElement);
    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('mousedown', onDocumentMouseDown, false);
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function onDocumentMouseDown(event) {
    event.preventDefault();
    // NDC: [-1,1]x[-1,1]
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    mouse.z = 0.5;

    mouse.unproject(camera);
    // console.log(mouse.x + ', ' + mouse.y + ', ' + mouse.z);

    if (event.button === 0) { // left button
      if (obbLine) scene.remove(obbLine);
      var m = mesh.clone();
      dataPoints.add(m);
      m.position.set(mouse.x, mouse.y, Math.random() * 10);

      var obb = findOBB(dataPoints);
      obbLine = drawOBB(obb);
      scene.add(obbLine);
    }
  }

  function animate() {
    requestAnimationFrame(animate);
    render();
  }

  function render() {
    renderer.render(scene, camera);
  }
  //////////////////////////////////////////////////////
  function findOBB(dataPoints) {
    // copy the [x,y] array
    // input: dataPoints is an Object3D (group)

    var xyArray = [];
    for (var i = 0; i < dataPoints.children.length; i++) {
      xyArray.push([dataPoints.children[i].position.x, dataPoints.children[i].position.y, dataPoints.children[i].position.z]);
    }

    // find mean
    var xbar = 0;
    var ybar = 0;
    var zbar = 0;
    for (var i = 0; i < xyArray.length; i++) {
      xbar += xyArray[i][0];
      ybar += xyArray[i][1];
      zbar += xyArray[i][2];
    }
    xbar /= xyArray.length;
    ybar /= xyArray.length;
    zbar /= xyArray.length;

    // adjust data
    for (var i = 0; i < xyArray.length; i++) {
      xyArray[i][0] -= xbar;
      xyArray[i][1] -= ybar;
      xyArray[i][2] -= zbar;
    }

    // covariance matrix
    var xx = 0;
    var xy = 0;
    var yy = 0;
    var xz = 0;
    var yz = 0;
    var zz = 0;

    for (var i = 0; i < xyArray.length; i++) {
      xx += xyArray[i][0] * xyArray[i][0];
      xy += xyArray[i][0] * xyArray[i][1];
      yy += xyArray[i][1] * xyArray[i][1];
      xz += xyArray[i][0] * xyArray[i][2];
      yz += xyArray[i][1] * xyArray[i][2];
      zz += xyArray[i][2] * xyArray[i][2];
    }

    // solve eigenvectors
    var cM = [
      [xx, xy, xz],
      [xy, yy, yz],
      [xz, yz, zz]
    ];

    var ev = numeric.eig(cM);

    console.log(ev.E.x);

    // pick PC1 as +x
    var PC1 = [ev.E.x[0][0], ev.E.x[1][0], ev.E.x[2][0]];

    // rotate 90 CCW as +y}
    var PC2 = [-PC1[1], PC1[0], PC1[2]];

    // pick PC1 as +z
    var PC3 = [-PC1[2], PC1[1], PC1[0]];

    var xp = 0;
    var yp = 0;
    var zp = 0;
    // change basis
    for (var i = 0; i < xyArray.length; i++) {
      xp = dot(xyArray[i], PC1);
      yp = dot(xyArray[i], PC2);
      zp = dot(xyArray[i], PC3);
      xyArray[i][0] = xp;
      xyArray[i][1] = yp;
      xyArray[i][2] = zp;
    }

    // find xy extreme values
    var xMin, xMax, yMin, yMax, zMin, zMax;
    xMin = yMin = zMin = 1e10;
    xMax = yMax = zMax = -1e10;

    for (var i = 0; i < xyArray.length; i++) {
      if (xyArray[i][0] < xMin) xMin = xyArray[i][0];
      if (xyArray[i][0] > xMax) xMax = xyArray[i][0];
      if (xyArray[i][1] < yMin) yMin = xyArray[i][1];
      if (xyArray[i][1] > yMax) yMax = xyArray[i][1];
      if (xyArray[i][1] < zMin) zMin = xyArray[i][2];
      if (xyArray[i][1] > zMax) zMax = xyArray[i][2];
    }

    // get 4 corners
    return {
      center: [xbar, ybar, zbar],
      axes: [PC1, PC2, PC3],
      size: [
        [xMin, xMax],
        [yMin, yMax],
        [zMin, zMax]
      ]
    };
  }

  function dot(v1, v2) {
    return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
  }

  function drawOBB(obb) {
    var xMin, xMax, yMin, yMax, zMin, zMax;
    xMin = obb.size[0][0], xMax = obb.size[0][1];
    yMin = obb.size[1][0], yMax = obb.size[1][1];
    zMin = obb.size[2][0], zMax = obb.size[2][1];
    var PC1 = obb.axes[0];
    var PC2 = obb.axes[1];
    var PC3 = obb.axes[2];

    var pos1, pos2, pos3, pos4;
    pos1 = [0, 0, 0];
    pos2 = [0, 0, 0];
    pos3 = [0, 0, 0];
    pos4 = [0, 0, 0];

    //console.log (xMin +', '+xMax);
    pos1[0] = obb.center[0] + xMax * PC1[0] + yMax * PC2[0] + zMax * PC3[0]; // x
    pos1[1] = obb.center[1] + xMax * PC1[1] + yMax * PC2[1] + zMax * PC3[1]; // y
    pos1[2] = obb.center[2] + xMax * PC1[2] + yMax * PC2[2] + zMax * PC3[2]; // z

    pos2[0] = obb.center[0] + xMin * PC1[0] + yMax * PC2[0];
    pos2[1] = obb.center[1] + xMin * PC1[1] + yMax * PC2[1];
    pos2[2] = obb.center[2] + xMax * PC1[2] + yMax * PC2[2] + zMax * PC3[2]; // z

    pos3[0] = obb.center[0] + xMin * PC1[0] + yMin * PC2[0];
    pos3[1] = obb.center[1] + xMin * PC1[1] + yMin * PC2[1];

    pos4[0] = obb.center[0] + xMax * PC1[0] + yMin * PC2[0];
    pos4[1] = obb.center[1] + xMax * PC1[1] + yMin * PC2[1];

    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(pos1[0], pos1[1], 10));
    geometry.vertices.push(new THREE.Vector3(pos1[0], pos1[1], -10));

    geometry.vertices.push(new THREE.Vector3(pos2[0], pos2[1], -10));
    geometry.vertices.push(new THREE.Vector3(pos2[0], pos2[1], 10));
    geometry.vertices.push(new THREE.Vector3(pos1[0], pos1[1], 10));

    geometry.vertices.push(new THREE.Vector3(pos2[0], pos2[1], 10));
    geometry.vertices.push(new THREE.Vector3(pos3[0], pos3[1], 10));
    geometry.vertices.push(new THREE.Vector3(pos3[0], pos3[1], -10));

    geometry.vertices.push(new THREE.Vector3(pos2[0], pos2[1], -10));
    geometry.vertices.push(new THREE.Vector3(pos1[0], pos1[1], -10));
    geometry.vertices.push(new THREE.Vector3(pos2[0], pos2[1], -10));

    geometry.vertices.push(new THREE.Vector3(pos3[0], pos3[1], -10));
    geometry.vertices.push(new THREE.Vector3(pos4[0], pos4[1], -10));
    geometry.vertices.push(new THREE.Vector3(pos1[0], pos1[1], -10));

    geometry.vertices.push(new THREE.Vector3(pos4[0], pos4[1], -10));
    geometry.vertices.push(new THREE.Vector3(pos4[0], pos4[1], 10));

    geometry.vertices.push(new THREE.Vector3(pos1[0], pos1[1], 10));
    geometry.vertices.push(new THREE.Vector3(pos2[0], pos2[1], 10));

    geometry.vertices.push(new THREE.Vector3(pos3[0], pos3[1], 10));
    geometry.vertices.push(new THREE.Vector3(pos4[0], pos4[1], 10));

    var obbLine = new THREE.Line(geometry, new THREE.LineBasicMaterial({
      color: 0xff0000
    }));
    return obbLine;
  }


}

