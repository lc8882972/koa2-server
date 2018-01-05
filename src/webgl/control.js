import * as THREE from 'three';
import 'three/examples/js/controls/OrbitControls'
import { ModelObject3D } from './ModleObject'
import { TransformControls } from './TransformControls'
// import './MTLLoader'
// import './OBJLoader'

export default (dom) => {
  let camera, scene, renderer, orbitControl;
  let mesh, mesh2, egm;
  let raycaster;
  // let mtlLoader = new THREE.MTLLoader();
  // let objLoader = new THREE.OBJLoader();
  let sofaMaterial;

  function init(canvas) {

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 400;
    camera.lookAt(new THREE.Vector3(0, 0, 0))
    scene = new THREE.Scene();
    scene.add(new THREE.AmbientLight(0xfffff));
    // const ambientLight = new THREE.AmbientLight(0xfffff);
    // ambientLight.position.set(400, 1000, 800);
    // scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xf0f0f0);
    directionalLight.position.set(400, 1000, 800);
    scene.add(directionalLight);
    orbitControl = new THREE.OrbitControls(camera, dom);

    let obj = load();

    scene.add(obj);

    obj.activate();

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0xffffff)
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    dom.appendChild(renderer.domElement);
    // renderer.domElement.addEventListener('mousedown', onMouseDown, false);
    window.addEventListener('resize', onWindowResize, false);
  }

  function load() {
    let control = new TransformControls(camera, orbitControl, dom);

    let m3d = new ModelObject3D(control);
    let wapper = new THREE.Group();

    let geometry = new THREE.BoxBufferGeometry(200, 200, 200);
    let material = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });
    let mesh = new THREE.Mesh(geometry, material);
    wapper.add(mesh);
    m3d.addModel2(wapper);
    return m3d;
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