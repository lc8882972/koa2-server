const THREE = require('three');
import { GizmoMaterial, GizmoLineMaterial } from "./GizmoMaterial";

const TransformGizmo = function () {

  THREE.Object3D.call(this);
  const scope = this;
  this.wapper = null;

  this.init = function (model) {
    this.wapper = model.parent;
    this.planes = new THREE.Object3D();
    this.planes.name = '_plane_group';
    //// PLANES

    const planeGeometry = new THREE.PlaneBufferGeometry(3400, 3400, 2, 2);
    const planeMaterialX = new THREE.MeshBasicMaterial({
      visible: false,
      side: THREE.DoubleSide,
      color: 0xff0000
    });
    const planeMaterialY = new THREE.MeshBasicMaterial({
      visible: false,
      side: THREE.DoubleSide,
      color: 0xffff00
    });
    const planeMaterialZ = new THREE.MeshBasicMaterial({
      visible: false,
      side: THREE.DoubleSide,
      color: 0xff00ff
    });

    const planeMaterialXYZ = new THREE.MeshBasicMaterial({
      visible: false,
      side: THREE.DoubleSide,
      color: 0x00ffff
    });

    const planes = {
      "XY": new THREE.Mesh(planeGeometry, planeMaterialX),
      "YZ": new THREE.Mesh(planeGeometry, planeMaterialY),
      "XZ": new THREE.Mesh(planeGeometry, planeMaterialZ),
      "XYZE": new THREE.Mesh(planeGeometry, planeMaterialXYZ)
    };

    this.activePlane = planes["XYZE"];

    planes["YZ"].rotation.set(0, Math.PI / 2, 0);
    planes["XZ"].rotation.set(-Math.PI / 2, 0, 0);

    for (let i in planes) {

      planes[i].name = i;
      this.planes.add(planes[i]);
      this.planes[i] = planes[i];

    }

    this.wapper.add(this.planes);

    // reset Transformations
    // this.traverse(function (child) {

    //     if (child instanceof THREE.Mesh) {

    //         child.updateMatrix();

    //         let tempGeometry = child.geometry.clone();
    //         tempGeometry.applyMatrix(child.matrix);
    //         child.geometry = tempGeometry;

    //         child.position.set(0, 0, 0);
    //         child.rotation.set(0, 0, 0);
    //         child.scale.set(1, 1, 1);

    //     }

    // });

  };

  this.destory = function () {
    if (this.wapper !== null && this.planes !== null) {
      this.wapper.children.splice(1, this.wapper.children.length - 1);
    }
  };
};

TransformGizmo.prototype = Object.create(THREE.Object3D.prototype);
TransformGizmo.prototype.constructor = TransformGizmo;

TransformGizmo.prototype.update = function (rotation, eye) {

  let vec1 = new THREE.Vector3(0, 0, 0);
  let vec2 = new THREE.Vector3(0, 1, 0);
  let lookAtMatrix = new THREE.Matrix4();

  this.traverse(function (child) {

    if (!child.planes) return;
    child.planes.children.forEach(plane => {

      if (plane.name.search("X") !== -1 || plane.name.search("Y") !== -1 || plane.name.search("Z") !== -1) {

        plane.quaternion.setFromEuler(rotation);
      }
    });

  });
};

const TransformGizmoTranslate = function (model) {

  TransformGizmo.call(this);

  this.setActivePlane = function (axis, eye) {

    var tempMatrix = new THREE.Matrix4();
    eye.applyMatrix4(tempMatrix.getInverse(tempMatrix.extractRotation(this.planes["XY"].matrixWorld)));

    if (axis === "X") {

      this.activePlane = this.planes["XY"];

      if (Math.abs(eye.y) > Math.abs(eye.z)) this.activePlane = this.planes["XZ"];

    }

    if (axis === "Y") {

      this.activePlane = this.planes["XY"];

      if (Math.abs(eye.x) > Math.abs(eye.z)) this.activePlane = this.planes["YZ"];

    }

    if (axis === "Z") {

      this.activePlane = this.planes["XZ"];

      if (Math.abs(eye.x) > Math.abs(eye.y)) this.activePlane = this.planes["YZ"];

    }

    if (axis === "XYZ") this.activePlane = this.planes["XYZE"];

  };
};

TransformGizmoTranslate.prototype = Object.create(TransformGizmo.prototype);
TransformGizmoTranslate.prototype.constructor = TransformGizmoTranslate;

export { TransformGizmo, TransformGizmoTranslate };