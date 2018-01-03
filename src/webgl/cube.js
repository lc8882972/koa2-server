import * as THREE from 'three';
import 'three/examples/js/controls/OrbitControls'
import './DragControl'

export default (dom) => {
  let camera, scene, renderer, orbitControl;
  let mesh, mesh2, egm;
  let raycaster;

  function init(canvas) {
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 400;
    camera.lookAt(new THREE.Vector3(0, 0, 0))
    scene = new THREE.Scene();
    scene.add(new THREE.AmbientLight(0xfffff))
    raycaster = new THREE.Raycaster();
    // raycaster.setFromCamera(camera);
    orbitControl = new THREE.OrbitControls(camera, dom);
    let geometry = new THREE.BoxBufferGeometry(200, 200, 200);
    // geometry.fromGeometry()

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
    let material = new THREE.MeshFaceMaterial(materialArray);
    mesh = new THREE.Mesh(geometry, material);

    let box3 = new THREE.Box3();
    box3.setFromObject(mesh);
    mesh.userData.box = box3;
    scene.add(mesh);
    console.log(mesh);

    let geometry2 = new THREE.BoxGeometry(200, 200, 200);
    let material2 = new THREE.MeshBasicMaterial({
      color: 0xff0000
    });
    mesh2 = new THREE.Mesh(geometry2, material2);
    mesh2.position.set(250, 0, 0);
    let box32 = new THREE.Box3();
    box32.setFromObject(mesh2);
    mesh2.userData.box = box32;
    scene.add(mesh2);

    let triangle = new THREE.Shape();
    triangle.moveTo(-100, 0);
    triangle.lineTo(100, 0);
    triangle.lineTo(80, 20);
    triangle.lineTo(-80, 20);
    triangle.lineTo(-100, 0);

    let eg = new THREE.ExtrudeGeometry(triangle, {
      amounr: 10,
      bevelEnabled: false
    })

    eg.faces[0].materialIndex = 0;
    eg.faces[1].materialIndex = 0;
    eg.faces[2].materialIndex = 1;
    eg.faces[3].materialIndex = 1;
    eg.faces[4].materialIndex = 2;
    eg.faces[5].materialIndex = 2;
    eg.faces[6].materialIndex = 3;
    eg.faces[7].materialIndex = 3;
    eg.faces[8].materialIndex = 4;
    eg.faces[9].materialIndex = 4;
    eg.faces[10].materialIndex = 5;
    eg.faces[11].materialIndex = 5;
    // eg.groups = [{
    //     start: 0,
    //     count: 6,
    //     materialIndex: 0
    //   },
    //   {
    //     start: 6,
    //     count: 6,
    //     materialIndex: 1
    //   },
    //   {
    //     start: 12,
    //     count: 6,
    //     materialIndex: 2
    //   },
    //   {
    //     start: 18,
    //     count: 6,
    //     materialIndex: 3
    //   },
    //   {
    //     start: 24,
    //     count: 6,
    //     materialIndex: 4
    //   },
    //   {
    //     start: 30,
    //     count: 6,
    //     materialIndex: 5
    //   }
    // ]

    egm = new THREE.Mesh(eg, material);
    egm.position.x = -250;

    let matrix4 = new THREE.Matrix4().copy(egm.matrix);
    let quat = new THREE.Quaternion();
    let euler = new THREE.Euler();
    // euler.z = Math.PI / 2;

    // quat.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
    quat.setFromEuler(euler);
    // quat.setFromRotationMatrix(egm.matrix);
    // quat.x = Math.PI / 2
    console.log(quat);
    matrix4.setRotationFromQuaternion(quat);
    // matrix4.makeRotationX(Math.PI / 2);
    // matrix4.setPosition(egm.position);
    egm.applyMatrix(matrix4);
    scene.add(egm);

    //立方体顶点位置坐标
    // var vertices = [
    //   -1, -1, -1, 
    //   1, -1, -1,
    //   1, 1, -1, 
    //   -1, 1, -1, 
    //   -1, -1, 1,
    //   1, -1, 1,
    //   1, 1, 1, 
    //   -1, 1, 1,
    // ];
    // //立方体顶点索引，三个顶点定义一个
    // var indices = [
    //   2, 1, 0, 0, 3, 2,
    //   0, 4, 7, 7, 3, 0,
    //   0, 1, 5, 5, 4, 0,
    //   1, 2, 6, 6, 5, 1,
    //   2, 3, 7, 7, 6, 2,
    //   4, 5, 6, 6, 7, 4
    // ];
    // var box = new THREE.PolyhedronBufferGeometry(vertices, indices, 100);
    // egm = new THREE.Mesh(box, material);
    // egm.position.x = -250;
    // scene.add(egm);
    let objects = [mesh, mesh2, egm];
    let dragControls = new THREE.DragControls(objects, camera, dom);
    dragControls.addEventListener('dragstart', function (event) { orbitControl.enabled = false; });
    dragControls.addEventListener('dragend', function (event) { orbitControl.enabled = true; });

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0xffffff)
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    dom.appendChild(renderer.domElement);
    renderer.domElement.addEventListener('mousedown', onMouseDown, false);
    window.addEventListener('resize', onWindowResize, false);
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  var getIntersects = function (point, objects) {
    let mouse = new THREE.Vector2();
    mouse.set((point.x * 2) - 1, -(point.y * 2) + 1);
    return mouse;
  };

  function animate() {
    requestAnimationFrame(animate);

    // mesh.rotation.x += 0.005;
    // mesh.rotation.y += 0.05;
    // mesh.rotation.z += 0.05;

    // egm.rotation.x += 0.005;
    // egm.rotation.y += 0.05;
    // egm.rotation.z += 0.05;

    // let result = mesh.userData.box.intersectsBox(mesh2.userData.box);
    // let x = Math.random() * 1000;
    // console.log(result);
    // mesh2.position.x = x;
    // mesh2.position.y = x;
    // mesh2.userData.box.setFromObject(mesh2);
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