const THREE = require('three');
import { GizmoMaterial, GizmoLineMaterial } from "./GizmoMaterial";

const TransformGizmo = function () {

  THREE.Object3D.call(this);
  const scope = this;
  this.planes = {};

  this.init = function () {

    this.name = 'TransformGizmo';

    //// PLANES

    const planeGeometry = new THREE.PlaneBufferGeometry(3400, 3400, 2, 2);
    const planeMaterial = new THREE.MeshBasicMaterial({
      visible: false,
      side: THREE.DoubleSide,
      color: 0xff0000
    });

    const planes = {
      "XY": new THREE.Mesh(planeGeometry, planeMaterial),
      "YZ": new THREE.Mesh(planeGeometry, planeMaterial),
      "XZ": new THREE.Mesh(planeGeometry, planeMaterial),
      "XYZE": new THREE.Mesh(planeGeometry, planeMaterial)
    };

    this.activePlane = planes["XYZE"];

    planes["YZ"].rotation.set(0, Math.PI / 2, 0);
    planes["XZ"].rotation.set(-Math.PI / 2, 0, 0);

    for (let i in planes) {

      planes[i].name = i;
      this.add(planes[i]);
      this.planes[i] = planes[i];

    }

    // reset Transformations
    this.traverse(function (child) {

      if (child instanceof THREE.Mesh) {

        child.updateMatrix();

        let tempGeometry = child.geometry.clone();
        tempGeometry.applyMatrix(child.matrix);
        child.geometry = tempGeometry;

        child.position.set(0, 0, 0);
        child.rotation.set(0, 0, 0);
        child.scale.set(1, 1, 1);

      }

    });

  };

  this.destory = function () {
    if (this.parent) {
      this.parent.remove(this);
    }
  };

  this.activate = function (model) {
    model.add(this);
  }

  this.deactivate = function (model) {
    if (this.parent) {
      this.parent.remove(this);
    }
  }
};

TransformGizmo.prototype = Object.create(THREE.Object3D.prototype);
TransformGizmo.prototype.constructor = TransformGizmo;

TransformGizmo.prototype.update = function (rotation, eye) {

  this.traverse(function (child) {

    if (child.name.search("X") !== -1 || child.name.search("Y") !== -1 || child.name.search("Z") !== -1) {

      child.quaternion.setFromEuler(rotation);
    }
  });

};

const TransformGizmoTranslate = function (model) {

  TransformGizmo.call(this);
  this.init();

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