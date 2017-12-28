import * as THREE from 'three';



export default (dom) => {
  let camera, scene, renderer;
  let mesh, mesh2;
  let raycaster;
  function init(canvas) {
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 400;
    camera.lookAt(new THREE.Vector3(0, 0, 0))
    scene = new THREE.Scene();
    scene.add(new THREE.AmbientLight(0xfffff))
    raycaster = new THREE.Raycaster();
    // raycaster.setFromCamera(camera);

    let geometry = new THREE.BoxBufferGeometry(200, 200, 200);
    let material = new THREE.MeshBasicMaterial({ color: 0xff00ff });
    mesh = new THREE.Mesh(geometry, material);
    let box3 = new THREE.Box3();
    box3.setFromObject(mesh);
    mesh.userData.box = box3;
    scene.add(mesh);

    let geometry2 = new THREE.BoxBufferGeometry(200, 200, 200);
    let material2 = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    mesh2 = new THREE.Mesh(geometry2, material2);
    mesh2.position.set(190, 0, 0);
    let box32 = new THREE.Box3();
    box32.setFromObject(mesh2);
    mesh2.userData.box = box32;

    scene.add(mesh2);
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
    mouse.set((point.x * 2) - 1, - (point.y * 2) + 1);
    return mouse;
  };

  function animate() {
    requestAnimationFrame(animate);
    // mesh.rotation.x += 0.005;
    // mesh.rotation.y += 0.01;
    // let result = mesh.userData.box.intersectsBox(mesh2.userData.box);
    // let x = Math.random() * 1000;
    // console.log(result);
    // mesh2.position.x = x;
    // mesh2.position.y = x;
    // mesh2.userData.box.setFromObject(mesh2);
    renderer.render(scene, camera);
  }

  function onMouseDown(event) {
    let point = getIntersects({ x: event.clientX, y: event.clientY })
    let vector3 = new THREE.Vector3()
    raycaster.setFromCamera(point, camera);
    raycaster.ray.intersectBox(mesh.userData.box, vector3);
    console.log(vector3)
  }
  init(dom);
  animate();
}