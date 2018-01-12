import * as THREE from 'three';
import './Orbit3DControls'
import './DragControl'
import './MTLLoader'
import OBB from './obb';

export default (dom) => {
  let camera, scene, renderer, orbitControl;
  let mesh, mesh2, egm, bh;
  let raycaster;
  let myWorker;
  let mtlLoader = new THREE.MTLLoader();
  let sofaMaterial;

  function init(canvas) {

    if (window.Worker) {
      myWorker = new Worker('worker.js');
    }

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 400;
    camera.lookAt(new THREE.Vector3(0, 0, 0))
    scene = new THREE.Scene();
    scene.add(new THREE.AmbientLight(0xfffff));
    const ambientLight = new THREE.AmbientLight(0xfffff);
    ambientLight.position.set(400, 1000, 800);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xf0f0f0);
    directionalLight.position.set(400, 1000, 800);
    scene.add(directionalLight);

    raycaster = new THREE.Raycaster();

    orbitControl = new THREE.Orbit3DControls(camera, dom);
    let geometry = new THREE.BoxGeometry(200, 200, 200);

    let materialArray = [
      new THREE.MeshBasicMaterial({
        color: 0x00ffff
      }),
      new THREE.MeshBasicMaterial({
        color: 0x0051ba
      }),
      new THREE.MeshBasicMaterial({
        color: 0xffd500
      }),
      new THREE.MeshBasicMaterial({
        color: 0xff5800
      }),
      new THREE.MeshBasicMaterial({
        color: 0xc41e3a
      }),
      new THREE.MeshBasicMaterial({
        color: 0xff0000
      }),
    ];

    mesh = new THREE.Mesh(geometry, materialArray);

    mesh.geometry.computeBoundingBox();

    let box3 = new THREE.Box3();
    box3.setFromObject(mesh);
    mesh.userData.box = box3;

    scene.add(mesh);

    let geometry2 = new THREE.BoxGeometry(200, 50, 50);
    geometry2.rotateX(Math.PI / 4);
    geometry2.rotateY(Math.PI / 4);
    // geometry2.translate(250, 0, 0);

    console.log(geometry2.vertices)
    let material2 = new THREE.MeshBasicMaterial({
      color: 0xff0000
    });
    mesh2 = new THREE.Mesh(geometry2, material2);
    let box32 = new THREE.Box3();
    box32.setFromObject(mesh2);

    mesh2.userData.box = box32;
    scene.add(mesh2);

    let objects = [mesh, mesh2];
    let dragControls = new THREE.DragControls(objects, camera, dom);
    dragControls.addEventListener('dragstart', function (event) { orbitControl.enabled = false; });
    dragControls.addEventListener('dragend', function (event) { orbitControl.enabled = true; });

    const vertices = [
      new THREE.Vector3(-101, 80, -100),
      new THREE.Vector3(110, -100, 10),
      new THREE.Vector3(99, 150, 0),
    ];

    let obb = new OBB(geometry2.vertices);

    console.log(obb);
    let vert = obb.getCorners();
    let lineGeometry = new THREE.BoxGeometry();
    lineGeometry.vertices.push(...vert);

    var obbLine = new THREE.Line(lineGeometry, new THREE.MeshBasicMaterial({
      color: 0xff0000
    }));

    obbLine.position.copy(obb._center);
    scene.add(obbLine);

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0xffffff)
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    dom.appendChild(renderer.domElement);
    renderer.render(scene, camera);

    renderer.domElement.addEventListener('mousedown', onMouseDown, false);
    window.addEventListener('resize', onWindowResize, false);
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function drawOBB(obb) {
    var xMin, xMax, yMin, yMax;
    xMin = obb.min.x, xMax = obb.max.x;
    yMin = obb.min.y, yMax = obb.max.y;
    var PC1 = new THREE.Vector3(obb.orientation.elements[0], obb.orientation.elements[1], obb.orientation.elements[2]);
    var PC2 = new THREE.Vector3(obb.orientation.elements[3], obb.orientation.elements[4], obb.orientation.elements[5]);

    var pos1, pos2, pos3, pos4;
    pos1 = [0, 0];
    pos2 = [0, 0];
    pos3 = [0, 0];
    pos4 = [0, 0];

    // pos1[0] = obb.center[0] + xMax * PC1[0] + yMax * PC2[0]; // x
    // pos1[1] = obb.center[1] + xMax * PC1[1] + yMax * PC2[1]; // y
    // pos2[0] = obb.center[0] + xMin * PC1[0] + yMax * PC2[0];
    // pos2[1] = obb.center[1] + xMin * PC1[1] + yMax * PC2[1];
    // pos3[0] = obb.center[0] + xMin * PC1[0] + yMin * PC2[0];
    // pos3[1] = obb.center[1] + xMin * PC1[1] + yMin * PC2[1];
    // pos4[0] = obb.center[0] + xMax * PC1[0] + yMin * PC2[0];
    // pos4[1] = obb.center[1] + xMax * PC1[1] + yMin * PC2[1];
    console.log(xMin, xMax);
    pos1[0] = obb.position.x + xMax * PC1.x + yMax * PC2.x; // x
    pos1[1] = obb.position.y + xMax * PC1.y + yMax * PC2.y; // y

    pos2[0] = obb.position.x + xMin * PC1.x + yMax * PC2.x;
    pos2[1] = obb.position.y + xMin * PC1.y + yMax * PC2.y;


    pos3[0] = obb.position.x + xMin * PC1.x + yMin * PC2.x;
    pos3[1] = obb.position.y + xMin * PC1.y + yMin * PC2.y;
    pos4[0] = obb.position.x + xMax * PC1.x + yMin * PC2.x;
    pos4[1] = obb.position.y + xMax * PC1.y + yMin * PC2.y;


    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(pos1[0], pos1[1], 0));
    geometry.vertices.push(new THREE.Vector3(pos2[0], pos2[1], 0));
    geometry.vertices.push(new THREE.Vector3(pos3[0], pos3[1], 0));
    geometry.vertices.push(new THREE.Vector3(pos4[0], pos4[1], 0));
    geometry.vertices.push(new THREE.Vector3(pos1[0], pos1[1], 0));

    var obbLine = new THREE.Line(geometry, new THREE.LineBasicMaterial({
      color: 0xff0000
    }));

    return obbLine;
  }

  var getIntersects = function (point, objects) {
    let mouse = new THREE.Vector2();
    mouse.set((point.x * 2) - 1, -(point.y * 2) + 1);
    return mouse;
  };

  function animate() {
    requestAnimationFrame(animate);

    renderer.render(scene, camera);
  }

  function onMouseDown(event) {
    let point = getIntersects({
      x: event.clientX,
      y: event.clientY
    })
    let vector3 = new THREE.Vector3()
    raycaster.setFromCamera(point, camera);
    raycaster.ray.intersectBox(mesh.userData.box, vector3);
  }

  init(dom);
  animate();
}