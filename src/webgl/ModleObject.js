'use strict';
const THREE = require('three');
import { GizmoMaterial, GizmoLineMaterial } from "./GizmoMaterial";
import { TransformGizmo, TransformGizmoTranslate } from "./TransformGizmo";

class InteractiveContainer {
  constructor() {
    this.model = null;
    this.frame = null;
    this.circle = null;
  }

  setModel(model) {
    const group = new THREE.Group();
    this.model = model;
    const array = model.geometry.attributes.position.array;
    const vector = this.findXYZ(array);

    const r = (vector.maxX - vector.minX) * 0.65; // 半径
    const lr = { x: r * 1.2, y: vector.maxY * 1.2, z: r * 1.2, r }; // 三角

    this.frame = new DottedLineFrame(vector, model.rotation);
    this.circle = new DottedLineCircle(r);
    this.circle.addBoxGeometry(vector, model.rotation);
    this.circle.addCircleGeometry(r, lr, model.rotation);
    this.circle.addDottedine(lr);
    this.circle.addTriangelShape(lr);
    group.add(this.frame);
    group.add(this.circle);
    return group;
  }

  findXYZ(array) {
    let minX = 0;
    let maxX = 0;
    let minY = 0;
    let maxY = 0;
    let minZ = 0;
    let maxZ = 0;
    let item = 0;
    let index = 0;
    for (let loop = 0; loop < array.length; loop++) {
      item = array[loop];

      index = loop + 1;
      if (index % 3 === 1) {
        if (array[loop] < minX) {
          minX = array[loop];
        }

        if (array[loop] > maxX) {
          maxX = array[loop];
        }
      }

      if (index % 3 === 2) {
        if (array[loop] < minY) {
          minY = array[loop];
        }

        if (array[loop] > maxY) {
          maxY = array[loop];
        }
      }

      if (index % 3 === 0) {
        if (array[loop] < minZ) {
          minZ = array[loop];
        }

        if (array[loop] > maxZ) {
          maxZ = array[loop];
        }
      }
    }

    return { minX, minY, minZ, maxX, maxY, maxZ };
  }

  clear() {
    this.model = null;
  }
}

// 虚线框
class DottedLineFrame extends THREE.Group {
  constructor(v, rotation) {
    super();
    const geometryCube = this.createBoxGeometry(v);
    geometryCube.computeLineDistances();
    let object = new THREE.LineSegments(geometryCube, new THREE.LineDashedMaterial({
      color: 0x0000ff,
      dashSize: 20,
      gapSize: 10,
      linewidth: 1
    }));
    object.rotation.y = rotation.y;
    this.name = 'DottedLineFrame';
    this.add(object);
  }

  createBoxGeometry(vector) {

    const geometry = new THREE.Geometry();
    geometry.vertices.push(
      new THREE.Vector3(vector.minX, vector.minY, vector.minZ),
      new THREE.Vector3(vector.minX, vector.maxY, vector.minZ),
      new THREE.Vector3(vector.minX, vector.maxY, vector.minZ),
      new THREE.Vector3(vector.maxX, vector.maxY, vector.minZ),
      new THREE.Vector3(vector.maxX, vector.maxY, vector.minZ),
      new THREE.Vector3(vector.maxX, vector.minY, vector.minZ),
      new THREE.Vector3(vector.maxX, vector.minY, vector.minZ),
      new THREE.Vector3(vector.minX, vector.minY, vector.minZ),
      new THREE.Vector3(vector.minX, vector.minY, vector.maxZ),
      new THREE.Vector3(vector.minX, vector.maxY, vector.maxZ),
      new THREE.Vector3(vector.minX, vector.maxY, vector.maxZ),
      new THREE.Vector3(vector.maxX, vector.maxY, vector.maxZ),
      new THREE.Vector3(vector.maxX, vector.maxY, vector.maxZ),
      new THREE.Vector3(vector.maxX, vector.minY, vector.maxZ),
      new THREE.Vector3(vector.maxX, vector.minY, vector.maxZ),
      new THREE.Vector3(vector.minX, vector.minY, vector.maxZ),
      new THREE.Vector3(vector.minX, vector.minY, vector.minZ),
      new THREE.Vector3(vector.minX, vector.minY, vector.maxZ),
      new THREE.Vector3(vector.minX, vector.maxY, vector.minZ),
      new THREE.Vector3(vector.minX, vector.maxY, vector.maxZ),
      new THREE.Vector3(vector.maxX, vector.maxY, vector.minZ),
      new THREE.Vector3(vector.maxX, vector.maxY, vector.maxZ),
      new THREE.Vector3(vector.maxX, vector.minY, vector.minZ),
      new THREE.Vector3(vector.maxX, vector.minY, vector.maxZ)
    );
    return geometry;
  }

}

// 交互圆
class DottedLineCircle extends THREE.Group {
  constructor(radius) {
    super();
    this.r = radius;
    this.name = 'DottedLineCircle';
  }

  addBoxGeometry(vector, rotation) {
    let mesh = new THREE.Mesh(
      new THREE.BoxGeometry(vector.maxX - vector.minX, vector.maxY, vector.maxZ - vector.minZ),
      new THREE.MeshBasicMaterial({ color: 0x00ffff, visible: false }));
    mesh.name = 'XYZ';
    mesh.translateY(vector.maxY / 2);
    mesh.rotation.y = rotation.y;
    this.add(mesh);
  }

  addCircleGeometry(radius, vector, rotation) {
    let group = new THREE.Group();

    let r = 100;
    let color = 0xff0000;
    let circleGeometry = new THREE.CircleGeometry(radius, radius / 2);
    let triangle;
    circleGeometry.vertices.shift();
    circleGeometry.computeLineDistances();
    let circleObject = new THREE.Line(circleGeometry, new GizmoLineMaterial({
      color: 0xffff00,
      dashSize: 50,
      gapSize: 50
    }));

    circleObject.rotation.x = -(Math.PI / 2);
    // circleObject.rotation.y = rotation.y;
    group.add(circleObject);
    // // triangle-
    let triangleShapeTri = new THREE.Shape();
    // 圆点 x = 0, y = 0
    // x1 = x + r * cos(angle)
    // y1 = y + r * sin(angle)
    let ta = 43 * Math.PI / 180;
    let Tx = vector.r * Math.cos(ta);
    let Ty = vector.r * Math.sin(ta);
    triangleShapeTri.moveTo(-r, 0);
    triangleShapeTri.lineTo(r, 0);
    triangleShapeTri.lineTo(0, r);
    triangleShapeTri.lineTo(-r, 0); // close path
    triangle = this.createTriangelShape2('R', triangleShapeTri, color, -Tx, 0, Ty, -(Math.PI / 2), 0, Math.PI / 180 * 45, 1);
    group.add(triangle);
    triangle = this.createTriangelShape2('R', triangleShapeTri, color, Tx, 0, -Ty, (Math.PI / 2), 0, -Math.PI / 180 * 45, 1);
    group.add(triangle);

    // triangle-
    let triangleShapeTriF = new THREE.Shape();
    let taf = 47 * Math.PI / 180;
    let Txf = vector.r * Math.cos(taf);
    let Tyf = vector.r * Math.sin(taf);
    triangleShapeTriF.moveTo(-r, 0);
    triangleShapeTriF.lineTo(r, 0);
    triangleShapeTriF.lineTo(0, r);
    triangleShapeTriF.lineTo(-r, 0); // close path
    triangle = this.createTriangelShape2('R', triangleShapeTriF, color, -Txf, 0, Tyf, (Math.PI / 2), 0, -(Math.PI / 180 * 45), 1);
    group.add(triangle);
    triangle = this.createTriangelShape2('R', triangleShapeTri, color, Txf, 0, -Tyf, -(Math.PI / 2), 0, Math.PI / 180 * 45, 1);
    group.add(triangle);

    group.name = 'circleGroup';
    //group.rotation.y = rotation.y;
    this.add(group);
  }

  createTriangelShape(name, shape, color, x, y, z, rx, ry, rz, s) {
    let geometry = new THREE.ShapeBufferGeometry(shape);

    let mesh = new THREE.Mesh(geometry, new GizmoMaterial({
      color, //0xffff00,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    }));
    mesh.name = name;
    mesh.position.set(x, y, z);
    mesh.rotation.set(rx, ry, rz);
    mesh.scale.set(s, s, s);

    this.add(mesh);
  }

  createTriangelShape2(name, shape, color, x, y, z, rx, ry, rz, s) {
    let geometry = new THREE.ShapeBufferGeometry(shape);

    let mesh = new THREE.Mesh(geometry, new GizmoMaterial({
      color, //0xffff00,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    }));
    mesh.name = name;
    mesh.position.set(x, y, z);
    mesh.rotation.set(rx, ry, rz);
    mesh.scale.set(s, s, s);

    return mesh;
  }

  addTriangelShape(vector) {
    // Z+
    let r = 100;
    let color = 0xff0000;
    let triangleShape = new THREE.Shape();
    triangleShape.moveTo(-r, 0);
    triangleShape.lineTo(r, 0);
    triangleShape.lineTo(0, r);
    triangleShape.lineTo(-r, 0); // close path
    this.createTriangelShape('Y', triangleShape, 0xff00ff, 0, vector.y + r * 2, 0, 0, 0, 0, 1);
    this.createTriangelShape('Y', triangleShape, 0xff00ff, 0, vector.y + r * 1.5, 0, -(Math.PI), 0, 0, 1);

    // X+
    let triangleShapeX = new THREE.Shape();
    triangleShapeX.moveTo(0, -r);
    triangleShapeX.lineTo(0, r);
    triangleShapeX.lineTo(r, 0);
    triangleShapeX.lineTo(0, -r); // close path
    this.createTriangelShape('X', triangleShapeX, color, vector.x, 0, 0, -(Math.PI / 2), 0, 0, 1);

    // X-
    let triangleShapeXL = new THREE.Shape();
    triangleShapeXL.moveTo(0, -r);
    triangleShapeXL.lineTo(0, r);
    triangleShapeXL.lineTo(-r, 0);
    triangleShapeXL.lineTo(0, -r); // close path
    this.createTriangelShape('X', triangleShapeXL, color, -vector.x, 0, 0, -(Math.PI / 2), 0, 0, 1);

    // Y+
    let triangleShapeZ = new THREE.Shape();
    triangleShapeZ.moveTo(-r, 0);
    triangleShapeZ.lineTo(r, 0);
    triangleShapeZ.lineTo(0, r);
    triangleShapeZ.lineTo(-r, 0); // close path
    this.createTriangelShape('Z', triangleShapeZ, 0xffff00, 0, 0, vector.z, (Math.PI / 2), 0, 0, 1);

    // Y-
    let triangleShapeZF = new THREE.Shape();
    triangleShapeZF.moveTo(-r, 0);
    triangleShapeZF.lineTo(r, 0);
    triangleShapeZF.lineTo(0, r);
    triangleShapeZF.lineTo(-r, 0); // close path
    this.createTriangelShape('Z', triangleShapeZF, color, 0, 0, -vector.z, -(Math.PI / 2), 0, 0, 1);
  }

  addDottedine(v) {
    let lineR = v.x;
    let lineGeometryX = new THREE.Geometry();
    let material = new GizmoLineMaterial({
      color: 0xffff00,
      dashSize: 20,
      gapSize: 20,
      linewidth: 1
    });

    // -x -> x
    lineGeometryX.vertices.push(new THREE.Vector3(-lineR, 0, 0));
    lineGeometryX.vertices.push(new THREE.Vector3(lineR, 0, 0));
    lineGeometryX.computeLineDistances();
    let lineX = new THREE.Line(lineGeometryX, material);
    this.add(lineX);

    // y 
    let lineGeometryY = new THREE.Geometry();
    lineGeometryY.vertices.push(new THREE.Vector3(0, 0, 0));
    lineGeometryY.vertices.push(new THREE.Vector3(0, v.y, 0));
    lineGeometryY.computeLineDistances();
    let lineY = new THREE.Line(lineGeometryY, material);
    this.add(lineY);

    // -z -> z
    let lineGeometryZ = new THREE.Geometry();
    lineGeometryZ.vertices.push(new THREE.Vector3(0, 0, -lineR));
    lineGeometryZ.vertices.push(new THREE.Vector3(0, 0, lineR));
    lineGeometryZ.computeLineDistances();
    let lineZ = new THREE.Line(lineGeometryZ, material);

    this.add(lineZ);
  }
}

class DottedLine extends THREE.Group {
  constructor() {
    super();
  }

  addDottedine(v) {
    let lineR = v.x;
    let lineGeometryX = new THREE.Geometry();
    let material = new GizmoLineMaterial({
      color: 0xffff00,
      dashSize: 20,
      gapSize: 20,
      linewidth: 1
    });

    // X-
    lineGeometryX.vertices.push(new THREE.Vector3(0, 0, 0));
    lineGeometryX.vertices.push(new THREE.Vector3(-lineR, 0, 0));
    lineGeometryX.computeLineDistances();
    let lineXL = new THREE.Line(lineGeometryX, material);
    lineXL.name = 'X-';

    // X+
    lineGeometryX.vertices.push(new THREE.Vector3(0, 0, 0));
    lineGeometryX.vertices.push(new THREE.Vector3(lineR, 0, 0));
    lineGeometryX.computeLineDistances();
    let lineXR = new THREE.Line(lineGeometryX, material);
    lineXR.name = 'X+';

    // Y+
    let lineGeometryYU = new THREE.Geometry();
    lineGeometryYU.vertices.push(new THREE.Vector3(0, 0, 0));
    lineGeometryYU.vertices.push(new THREE.Vector3(0, v.y, 0));
    lineGeometryYU.computeLineDistances();
    let lineYU = new THREE.Line(lineGeometryYU, material);
    lineYU.name = 'Y+';
    // this.add(lineY);

    // Z-
    let lineGeometryZB = new THREE.Geometry();
    lineGeometryZB.vertices.push(new THREE.Vector3(0, 0, -lineR));
    lineGeometryZB.vertices.push(new THREE.Vector3(0, 0, lineR));
    lineGeometryZB.computeLineDistances();
    let lineZB = new THREE.Line(lineGeometryZB, material);
    lineZB.name = 'Z-';

    // -z -> z
    let lineGeometryZF = new THREE.Geometry();
    lineGeometryZF.vertices.push(new THREE.Vector3(0, 0, -lineR));
    lineGeometryZF.vertices.push(new THREE.Vector3(0, 0, lineR));
    lineGeometryZF.computeLineDistances();
    let lineZF = new THREE.Line(lineGeometryZF, material);
    lineZB.name = 'Z+';
    this.add(lineXL);
    this.add(lineXR);
    this.add(lineYU);
    this.add(lineZB);
    this.add(lineZF);
  }
}

const pickerMaterial = new GizmoMaterial({
  visible: true,
  transparent: false
});



class ModelObject3D extends THREE.Object3D {

  constructor(control) {
    super();
    this._obj = null;
    this.control = control;
  }

  setControl(control) {
    this.control = control;
  }

  addModel(model) {
    let isObject = model instanceof THREE.Object3D;
    if (!isObject) {
      console.error('BIM:ModelObject.addModel: The parameters must be THREE.Object3D classes');
      return;
    }
    this._obj = model;
    this.add(model);
  }

  addModel2(model) {
    let isObject = model instanceof THREE.Object3D;
    if (!isObject) {
      console.error('BIM:ModelObject.addModel: The parameters must be THREE.Object3D classes');
      return;
    }
    this._obj = model;
    model.position.copy(this._obj.position);
    model.rotation.copy(this._obj.rotation);
    this.remove(this._obj);

    this.add(model);
    this.userData.control = this.control;
    this.userData.control.attach(model);
  }

  replaceModel(model) {
    let isObject = model instanceof THREE.Object3D;
    if (!isObject) {
      console.error('BIM:ModelObject.addModel: The parameters must be THREE.Object3D classes');
      return;
    }

    model.position.copy(this._obj.position);
    model.rotation.copy(this._obj.rotation);
    this.remove(this._obj);
    this._obj = model;
    this.add(model);
    this.userData.control = this.control;
    this.userData.control.attach(model);
  }

  activate() {
    let container = new InteractiveContainer();
    let fz = container.setModel(this._obj.children[0]);
    this._obj.add(...fz.children);
    this.userData.control.activate();
  }

  deactivate() {
    let model = this._obj;

    model.children.splice(1, model.children.length - 1);
    this.userData.control.deactivate();
  }
}
export { ModelObject3D };
