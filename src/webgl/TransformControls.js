const THREE = require('three')

import { TransformGizmo, TransformGizmoTranslate } from "./TransformGizmo";

const TransformControls = function (camera, controls, domElement) {

  // TODO: Make non-uniform scale and rotate play nice in hierarchies
  // TODO: ADD RXYZ contol

  THREE.Object3D.call(this);

  domElement = (domElement !== undefined) ? domElement : document;

  this.object = null;
  this.visible = false;
  this.space = "world";
  this.size = 1;
  this.axis = null;
  this.shapeArray = [];

  var scope = this;

  var _dragging = false;
  var _gizmo = null;


  var changeEvent = { type: "change" };
  var mouseDownEvent = { type: "mouseDown" };
  var mouseUpEvent = { type: "mouseUp" };
  var objectChangeEvent = { type: "objectChange" };

  var ray = new THREE.Raycaster();
  var pointerVector = new THREE.Vector2();

  var point = new THREE.Vector3();
  var offset = new THREE.Vector3();

  var rotation = new THREE.Vector3();
  var scale = 1;

  var lookAtMatrix = new THREE.Matrix4();
  var eye = new THREE.Vector3();

  var tempMatrix = new THREE.Matrix4();

  var oldPosition = new THREE.Vector3();
  var oldScale = new THREE.Vector3();
  var oldRotationMatrix = new THREE.Matrix4();

  var parentRotationMatrix = new THREE.Matrix4();
  var parentScale = new THREE.Vector3();

  var worldPosition = new THREE.Vector3();
  var worldRotation = new THREE.Euler();
  var worldRotationMatrix = new THREE.Matrix4();
  var camPosition = new THREE.Vector3();
  var camRotation = new THREE.Euler();

  this.dispose = function () {

    domElement.removeEventListener("mousedown", onPointerDown);
    domElement.removeEventListener("touchstart", onPointerDown);

    domElement.removeEventListener("mousemove", onPointerHover);
    domElement.removeEventListener("touchmove", onPointerHover);

    domElement.removeEventListener("mousemove", onPointerMove);
    domElement.removeEventListener("touchmove", onPointerMove);

    domElement.removeEventListener("mouseup", onPointerUp);
    domElement.removeEventListener("mouseout", onPointerUp);
    domElement.removeEventListener("touchend", onPointerUp);
    domElement.removeEventListener("touchcancel", onPointerUp);
    domElement.removeEventListener("touchleave", onPointerUp);

  };

  this.activate = function () {
    this.shapeArray = this.object.children[2].children.filter(f => f.type === 'Mesh');

    let cg = this.object.children[2].getObjectByName('circleGroup');
    this.shapeArray.push(...cg.children);

    domElement.addEventListener("mousedown", onPointerDown, false);
    domElement.addEventListener("touchstart", onPointerDown, false);

    domElement.addEventListener("mousemove", onPointerHover, false);
    domElement.addEventListener("touchmove", onPointerHover, false);

    domElement.addEventListener("mousemove", onPointerMove, false);
    domElement.addEventListener("touchmove", onPointerMove, false);

    domElement.addEventListener("mouseup", onPointerUp, false);
    domElement.addEventListener("mouseout", onPointerUp, false);
    domElement.addEventListener("touchend", onPointerUp, false);
    domElement.addEventListener("touchcancel", onPointerUp, false);
    domElement.addEventListener("touchleave", onPointerUp, false);
  };

  this.deactivate = function () {
    this.shapeArray = [];
    this.axis = null;
    this.dispose();
  };

  this.attach = function (object) {

    _gizmo = new TransformGizmoTranslate(object);
    this.object = object;
    this.update();

  };

  this.detach = function () {

    this.object = null;
    this.visible = false;
    this.axis = null;
    _gizmo = null;

  };

  this.update = function () {

    if (scope.object === null) return;

    scope.object.updateMatrixWorld();
    worldPosition.setFromMatrixPosition(scope.object.matrixWorld);
    worldRotation.setFromRotationMatrix(tempMatrix.extractRotation(scope.object.matrixWorld));

    camera.updateMatrixWorld();
    camPosition.setFromMatrixPosition(camera.matrixWorld);
    camRotation.setFromRotationMatrix(tempMatrix.extractRotation(camera.matrixWorld));

    scale = worldPosition.distanceTo(camPosition) / 6 * scope.size;
    this.position.copy(worldPosition);
    this.scale.set(scale, scale, scale);

    if (camera instanceof THREE.PerspectiveCamera) {

      eye.copy(camPosition).sub(worldPosition).normalize();

    } else if (camera instanceof THREE.OrthographicCamera) {

      eye.copy(camPosition).normalize();

    }

    _gizmo.update(new THREE.Euler(), eye);

  };

  function onPointerHover(event) {

    if (scope.object === null || _dragging === true || (event.button !== undefined && event.button !== 0)) return;

    var pointer = event.changedTouches ? event.changedTouches[0] : event;
    let objects = scope.shapeArray;

    var intersect = intersectObjects(pointer, objects);

    var axis = null;

    if (intersect) {

      axis = intersect.object.name;

      if (intersect.object.material.highlight) {
        intersect.object.material.highlight(true);
      }

      event.preventDefault();

    }

    if (scope.axis !== axis) {

      scope.axis = axis;
      objects.forEach(triangle => {
        if (triangle.material.highlight && triangle.name !== scope.axis) {
          triangle.material.highlight(false);
        }
      });
      scope.update();
      scope.dispatchEvent(changeEvent);

    }

  }

  function onPointerDown(event) {

    if (event.button !== undefined && event.button !== 0) return;

    if (scope.object === null) {
      controls.enabled = true;
      return;
    }

    if (_dragging === true) {
      return;
    }

    var pointer = event.changedTouches ? event.changedTouches[0] : event;
    let objects = scope.shapeArray;

    if (pointer.button === 0 || pointer.button === undefined) {

      var intersect = intersectObjects(pointer, objects, false);

      if (intersect) {

        event.preventDefault();
        event.stopPropagation();

        scope.dispatchEvent(mouseDownEvent);

        _gizmo.init(scope.object);

        scope.axis = intersect.object.name;

        scope.update();

        eye.copy(camPosition).sub(worldPosition).normalize();

        _gizmo.setActivePlane(scope.axis, eye);

        var planeIntersect = intersectObjects(pointer, [_gizmo.activePlane]);

        if (planeIntersect) {

          oldPosition.copy(scope.object.position);
          oldScale.copy(scope.object.scale);

          oldRotationMatrix.extractRotation(scope.object.matrix);
          worldRotationMatrix.extractRotation(scope.object.matrixWorld);

          parentRotationMatrix.extractRotation(scope.object.parent.matrixWorld);
          parentScale.setFromMatrixScale(tempMatrix.getInverse(scope.object.parent.matrixWorld));

          offset.copy(planeIntersect.point);
          _dragging = true;
          controls.enabled = false;
        }

      }
      else {
        scope.enabled = true;
      }

    }

  }

  function onPointerMove(event) {

    if (scope.object === null || scope.axis === null || _dragging === false || (event.button !== undefined && event.button !== 0)) return;

    var pointer = event.changedTouches ? event.changedTouches[0] : event;

    var planeIntersect = intersectObjects(pointer, [_gizmo.activePlane]);

    if (planeIntersect === false) return;

    event.preventDefault();

    event.stopPropagation();

    point.copy(planeIntersect.point);
    console.log(planeIntersect.object.name);

    point.sub(offset);
    point.multiply(parentScale);
 
    if (scope.axis.search("X") === - 1) point.x = 0;
    if (scope.axis.search("Y") === - 1) point.y = 0;
    if (scope.axis.search("Z") === - 1) point.z = 0;

    point.applyMatrix4(tempMatrix.getInverse(parentRotationMatrix));

    scope.object.position.copy(oldPosition);
    scope.object.position.add(point);
    scope.object.position.round();


    // if (scope.axis.search("R") !== -1) {
    //   let movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    //   let movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
    //   let dis = Math.abs(movementX) > Math.abs(movementY) ? movementX : movementY;

    //   let rect = domElement.getBoundingClientRect();
    //   let x = (pointer.clientX - rect.left) / rect.width;
    //   let y = (pointer.clientY - rect.top) / rect.height;

    //   let m = new THREE.Vector2(x, y);
    //   let rotationY = dis * 0.002;

    //   scope.object.children[0].rotation.y += rotationY;
    //   scope.object.children[1].rotation.y += rotationY;
    //   scope.object.children[2].getObjectByName('circleGroup').rotation.y += rotationY;
    // }

    scope.update();
    scope.dispatchEvent(changeEvent);
    scope.dispatchEvent(objectChangeEvent);

  }

  function onPointerUp(event) {

    event.preventDefault(); // Prevent MouseEvent on mobile

    if (event.button !== undefined && event.button !== 0) return;

    if (!controls.enabled) {
      controls.enabled = true;
    }

    if (_dragging && (scope.axis !== null)) {
      scope.dispatchEvent(mouseUpEvent);
      _gizmo.destory();
      _dragging = false;
    }

    if ('TouchEvent' in window && event instanceof TouchEvent) {

      // Force "rollover"

      scope.axis = null;
      scope.update();
      scope.dispatchEvent(changeEvent);

    } else {
      onPointerHover(event);
    }

  }

  function intersectObjects(pointer, objects) {

    var rect = domElement.getBoundingClientRect();
    var x = (pointer.clientX - rect.left) / rect.width;
    var y = (pointer.clientY - rect.top) / rect.height;

    pointerVector.set((x * 2) - 1, - (y * 2) + 1);
    ray.setFromCamera(pointerVector, camera);
    var intersections = ray.intersectObjects(objects, true);

    return intersections[0] ? intersections[0] : false;

  }

};


TransformControls.prototype = Object.create(THREE.EventDispatcher.prototype);
TransformControls.prototype.constructor = TransformControls;

export { TransformControls };