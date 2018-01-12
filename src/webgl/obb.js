const THREE = require('three')

const FLT_EPSILON = 1.192093e-007;

function ROTATE(a, i, j, k, l, t) {
  g = a.elements[i + 4 * j];
  h = a.elements[k + 4 * l];
  a.elements[i + 4 * j] = (g - s * (h + g * t));
  a.elements[k + 4 * l] = (h + s * (g - h * t));
}

function intersectMovingBox3(stationaryBox, movingBox, d) {
  const kNoIntersection = Infinity;

  let tEnter = 0;
  let tLeave = 1;
  let oneOverD = 0;
  let xEnter = Infinity;
  let xLeave = Infinity;
  let swap = Infinity;
  // x轴
  if (d.x === 0) {
    if (stationaryBox.min.x >= movingBox.max.x || stationaryBox.max.x <= movingBox.min.x) {
      return kNoIntersection;
    }
  } else {
    oneOverD = 1 / d.x;

    // 计算开始接触和脱离接触的时间
    xEnter = (stationaryBox.min.x - movingBox.max.x) * oneOverD;
    xLeave = (stationaryBox.max.x - movingBox.min.x) * oneOverD;
    // 检查顺序
    if (xEnter > xLeave) {
      swap = xEnter;
      xEnter = xLeave;
      xLeave = swap;
    }

    if (xEnter > tEnter) {
      tEnter = xEnter;
    }

    if (xLeave < tLeave) {
      tLeave = xLeave;
    }

    if (tEnter > tLeave) {
      return kNoIntersection;
    }
  }

  // y轴
  if (d.y === 0) {
    if (stationaryBox.min.y >= movingBox.max.y || stationaryBox.max.y <= movingBox.min.y) {
      return kNoIntersection;
    }
  } else {
    oneOverD = 1 / d.y;

    // 计算开始接触和脱离接触的时间
    xEnter = (stationaryBox.min.y - movingBox.max.y) * oneOverD;
    xLeave = (stationaryBox.max.y - movingBox.min.y) * oneOverD;

    // 检查顺序
    if (xEnter > xLeave) {
      swap = xEnter;
      xEnter = xLeave;
      xLeave = swap;
    }

    if (xEnter > tEnter) {
      tEnter = xEnter;
    }

    if (xLeave < tLeave) {
      tLeave = xLeave;
    }

    if (tEnter > tLeave) {
      return kNoIntersection;
    }
  }

  // z轴
  if (d.z === 0) {
    if (stationaryBox.min.z >= movingBox.max.z || stationaryBox.max.z <= movingBox.min.z) {
      return kNoIntersection;
    }
  } else {
    oneOverD = 1 / d.z;

    // 计算开始接触和脱离接触的时间
    xEnter = (stationaryBox.min.z - movingBox.max.z) * oneOverD;
    xLeave = (stationaryBox.max.z - movingBox.min.z) * oneOverD;

    // 检查顺序
    if (xEnter > xLeave) {
      swap = xEnter;
      xEnter = xLeave;
      xLeave = swap;
    }

    if (xEnter > tEnter) {
      tEnter = xEnter;
    }

    if (xLeave < tLeave) {
      tLeave = xLeave;
    }

    if (tEnter > tLeave) {
      return kNoIntersection;
    }
  }

  return tEnter;
}

/**
 * 生成协方差矩阵
 * @param {Array} vertPos 
 */
function getConvarianceMatrix(vertPos) {
  let cov = new THREE.Matrix4();

  let s1 = [0, 0, 0];
  let s2 = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]

  for (let i = 0; i < vertPos.length; i++) {
    s1[0] += vertPos[i].x;
    s1[1] += vertPos[i].y;
    s1[2] += vertPos[i].z;

    s2[0][0] += vertPos[i].x * vertPos[i].x;
    s2[1][1] += vertPos[i].y * vertPos[i].y;
    s2[2][2] += vertPos[i].z * vertPos[i].z;
    s2[0][1] += vertPos[i].x * vertPos[i].y;
    s2[0][2] += vertPos[i].x * vertPos[i].z;
    s2[1][2] += vertPos[i].y * vertPos[i].z;
  }

  let n = vertPos.length;

  // now get covariances
  cov.elements[0] = (s2[0][0] - s1[0] * s1[0] / n) / n;
  cov.elements[5] = (s2[1][1] - s1[1] * s1[1] / n) / n;
  cov.elements[10] = (s2[2][2] - s1[2] * s1[2] / n) / n;
  cov.elements[4] = (s2[0][1] - s1[0] * s1[1] / n) / n;
  cov.elements[9] = (s2[1][2] - s1[1] * s1[2] / n) / n;
  cov.elements[8] = (s2[0][2] - s1[0] * s1[2] / n) / n;
  cov.elements[1] = cov.elements[4];
  cov.elements[2] = cov.elements[8];
  cov.elements[6] = cov.elements[9];

  return cov;
}

function getOBBOrientation(vertPos) {
  let Cov;   // Mat4 

  if (vertPos.length <= 0) {
    return new THREE.Matrix4();
  }


  Cov = getConvarianceMatrix(vertPos);

  // now get eigenvectors

  let result = getEigenVectors(Cov);

  result.Evecs.transpose();

  return result.Evecs;
}

/**
 * now get eigenvectors
 * @param {THREE.Matrix4} a 
 */
function getEigenVectors(a) {

  let vout = new THREE.Matrix4();
  let dout = new THREE.Vector3();

  const ROTATE = function (a, i, j, k, l, t) {
    g = a.elements[i + 4 * j];
    h = a.elements[k + 4 * l];
    a.elements[i + 4 * j] = (g - s * (h + g * t));
    a.elements[k + 4 * l] = (h + s * (g - h * t));
  }

  let n = 3;
  let j, iq, ip, i;
  let tresh, theta, tau, t, sm, s, h, g, c;
  let nrot = 0;
  let b = new THREE.Vector3();
  let z = new THREE.Vector3();
  let d = new THREE.Vector3();
  let v = new THREE.Matrix4();

  b.set(a.elements[0], a.elements[5], a.elements[10]);
  d.set(a.elements[0], a.elements[5], a.elements[10]);

  for (i = 0; i < 50; i++) {
    sm = 0;
    for (ip = 0; ip < n; ip++) {
      for (iq = ip + 1; iq < n; iq++) {
        sm += Math.abs(a.elements[ip + 4 * iq])
      };
    }


    if (Math.abs(sm) < FLT_EPSILON) {
      v.transpose();
      return { Evecs: v, Evals: d };
    }

    if (i < 3)
      tresh = 0.2 * sm / (n * n);
    else
      tresh = 0;

    for (ip = 0; ip < n; ip++) {
      for (iq = ip + 1; iq < n; iq++) {
        g = 100 * Math.abs(a.elements[ip + iq * 4]);
        let dmip = d.getComponent(ip);
        let dmiq = d.getComponent(iq);

        if (i > 3 && Math.abs(dmip) + g == Math.abs(dmip) && Math.abs(dmiq) + g == Math.abs(dmiq)) {
          a.elements[ip + 4 * iq] = 0;
        }
        else if (Math.abs(a.elements[ip + 4 * iq]) > tresh) {
          h = dmiq - dmip;
          if (Math.abs(h) + g == Math.abs(h)) {
            t = (a.elements[ip + 4 * iq]) / h;
          }
          else {
            theta = 0.5 * h / (a.elements[ip + 4 * iq]);
            t = 1 / (Math.abs(theta) + Math.sqrt(1 + theta * theta));
            if (theta < 0) t = -t;
          }
          c = 1 / Math.sqrt(1 + t * t);
          s = t * c;
          tau = s / (1 + c);
          h = t * a.elements[ip + 4 * iq];
          z.setComponent(ip, z.getComponent(ip) - h);
          z.setComponent(iq, z.getComponent(iq) + h);
          d.setComponent(ip, d.getComponent(ip) - h);
          d.setComponent(iq, d.getComponent(iq) + h);

          a.elements[ip + 4 * iq] = 0;
          for (j = 0; j < ip; j++) {
            ROTATE(a, j, ip, j, iq, tau);
          }
          for (j = ip + 1; j < iq; j++) {
            ROTATE(a, ip, j, j, iq, tau);
          }
          for (j = iq + 1; j < n; j++) {
            ROTATE(a, ip, j, iq, j, tau);
          }
          for (j = 0; j < n; j++) {
            ROTATE(v, j, ip, j, iq, tau);
          }
          nrot++;
        }
      }
    }

    b.add(z);
    d.copy(b);
    z.set(0, 0, 0);
  }

  v.transpose();
  return { Evecs: v, Evals: d };
}

class OBB {
  constructor(verts) {
    if (!verts) return;

    this._center = new THREE.Vector3();;   // 中心点  
    /* 
      以下三个变量为正交单位向量， 
      定义了当前OBB包围盒的x,y,z轴 
      用于计算矢量投影 
     */
    this._xAxis = new THREE.Vector3();    // 包围盒x轴方向单位矢量  
    this._yAxis = new THREE.Vector3();    // 包围盒y轴方向单位矢量  
    this._zAxis = new THREE.Vector3();    // 包围盒z轴方向单位矢量  
    this._extents = new THREE.Vector3();  // 3个1/2边长,半长、半宽、半高  

    let matTransform = getOBBOrientation(verts);

    //	For matTransform is orthogonal, so the inverse matrix is just rotate it;
    matTransform.transpose();

    let vecMax = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
    let vecMin = new THREE.Vector3(Infinity, Infinity, Infinity);

    let vect;
    for (let i = 1; i < verts.length; i++) {
      vect = verts[i].clone();
      vect.applyMatrix4(matTransform);

      vecMax.x = vecMax.x > vect.x ? vecMax.x : vect.x;
      vecMax.y = vecMax.y > vect.y ? vecMax.y : vect.y;
      vecMax.z = vecMax.z > vect.z ? vecMax.z : vect.z;

      vecMin.x = vecMin.x < vect.x ? vecMin.x : vect.x;
      vecMin.y = vecMin.y < vect.y ? vecMin.y : vect.y;
      vecMin.z = vecMin.z < vect.z ? vecMin.z : vect.z;
    }

    matTransform.transpose();

    this._xAxis.set(matTransform.elements[0], matTransform.elements[1], matTransform.elements[2]);
    this._yAxis.set(matTransform.elements[4], matTransform.elements[5], matTransform.elements[6]);
    this._zAxis.set(matTransform.elements[8], matTransform.elements[9], matTransform.elements[10]);

    this._center.copy(vecMax.clone().add(vecMin).divideScalar(2));
    this._center.applyMatrix4(matTransform);

    this._xAxis.normalize();
    this._yAxis.normalize();
    this._zAxis.normalize();

    this._extents.copy(vecMax.clone().sub(vecMin).divideScalar(2));

    this.computeExtAxis();
  }

  fromObjects(objects) {

  }
  /*
  * compute extX, extY, extZ
  */
  computeExtAxis() {
    this._extentX = this._xAxis.clone().multiplyScalar(this._extents.x);
    this._extentY = this._yAxis.clone().multiplyScalar(this._extents.y);
    this._extentZ = this._zAxis.clone().multiplyScalar(this._extents.z);
  }

  /**
   * face to the obb's -z direction
   */
  getCorners() {
    const verts = [];

    let _extentX = this._extentX;
    let _extentY = this._extentY;
    let _extentZ = this._extentZ;
    // verts[0] = temp - _extentX + _extentY + _extentZ;     // left top front
    // verts[1] = temp - _extentX - _extentY + _extentZ;     // left bottom front
    // verts[2] = temp + _extentX - _extentY + _extentZ;     // right bottom front
    // verts[3] = temp + _extentX + _extentY + _extentZ;     // right top front

    // verts[4] = temp + _extentX + _extentY - _extentZ;     // right top back
    // verts[5] = temp + _extentX - _extentY - _extentZ;     // right bottom back
    // verts[6] = temp - _extentX - _extentY - _extentZ;     // left bottom back
    // verts[7] = temp - _extentX + _extentY - _extentZ;     // left top back
    verts[0] = this._center.clone().sub(_extentX).add(_extentY).add(_extentZ);     // left top front
    verts[1] = this._center.clone().sub(_extentX).sub(_extentY).add(_extentZ);     // left bottom front
    verts[2] = this._center.clone().add(_extentX).sub(_extentY).add(_extentZ);     // right bottom front
    verts[3] = this._center.clone().add(_extentX).add(_extentY).add(_extentZ);     // right top front

    verts[4] = this._center.clone().add(_extentX).add(_extentY).sub(_extentZ);     // right top back
    verts[5] = this._center.clone().add(_extentX).sub(_extentY).sub(_extentZ);     // right bottom back
    verts[6] = this._center.clone().sub(_extentX).sub(_extentY).sub(_extentZ);     // left bottom back
    verts[7] = this._center.clone().sub(_extentX).add(_extentY).sub(_extentZ);     // left top back
    console.log(verts);
    return verts;
  }

  /**
   * Project point to the target axis
   * @param {THREE.Vector3} point 
   * @param {THREE.Vector3} axis 
   */
  projectPoint(point, axis) {
    let dot = axis.dot(point);
    let ret = dot * point.length();
    return ret;
  }

  /**
   * Calculate the min and max project value of through the box's corners
   * @param {OBB} box 
   * @param {THREE.Vector3} axis 
   */
  getInterval(axis) {
    let corners = this.getCorners(corners);
    let min = Infinity, max = -Infinity;
    let value;

    for (let i = 1; i < corners.length; i++) {
      value = this.projectPoint(axis, corners[i]);
      min = Math.min(min, value);
      max = Math.max(max, value);
    }

    return { min, max };
  }

  /**
   * Get the edge of x y z axis direction
   * @param {Number} index 
   */
  getEdgeDirection(index) {
    let corners = this.getCorners(corners);
    let tmpLine;

    switch (index) {
      case 0:// edge with x axis
        tmpLine = corners[5].clone().sub(corners[6]);
        tmpLine.normalize();
        break;
      case 1:// edge with y axis
        tmpLine = corners[7].clone().sub(corners[6]);
        tmpLine.normalize();
        break;
      case 2:// edge with z axis
        tmpLine = corners[1].clone().sub(corners[6]);
        tmpLine.normalize();
        break;
      default:
        console.warn('Invalid index!');
        break;
    }
    return tmpLine;
  }

  /**
   * Transforms the obb by the given transformation matrix.
   * @param {THREE.Matrix4} matrix4 
   */
  transform(matrix4) {

    let vect4 = new THREE.Vector4(this._center.x, this._center.y, this._center.z, 1);

    let newcenter = vect4.applyMatrix4(matrix4) // center;
    this._center.x = newcenter.x;
    this._center.y = newcenter.y;
    this._center.z = newcenter.z;

    this._xAxis.applyMatrix4(matrix4);
    this._yAxis.applyMatrix4(matrix4)
    this._zAxis.applyMatrix4(matrix4)

    this._xAxis.normalize();
    this._yAxis.normalize();
    this._zAxis.normalize();

    let scale = new THREE.Vector3();
    let trans = new THREE.Vector3();
    let quat = new THREE.Quaternion();
    matrix4.decompose(scale, quat, trans);
    this._extents.x *= scale.x;
    this._extents.y *= scale.y;
    this._extents.z *= scale.z;

    this.computeExtAxis();
  }

  /**
   * Get the face of x y z axis direction
   * @param {Number} index 
   */
  getFaceDirection(index) {
    let corners = this.getCorners(corners);

    let faceDirection = new THREE.Vector3();
    let v0, v1;
    switch (index) {
      case 0:// front and back
        v0 = corners[2].clone().sub(corners[1]);
        v1 = corners[0].clone().sub(corners[1]);
        faceDirection.crossVectors(v0, v1);
        faceDirection.normalize();
        break;
      case 1:// left and right
        v0 = corners[5].clone().sub(corners[2]);
        v1 = corners[3].clone().sub(corners[2]);
        faceDirection.crossVectors(v0, v1);
        faceDirection.normalize();
        break;
      case 2:// top and bottom
        v0 = corners[1].clone().sub(corners[2]);
        v1 = corners[5].clone().sub(corners[2]);
        faceDirection.crossVectors(v0, v1);
        faceDirection.normalize();
        break;
      default:
        console.warn("Invalid index!");
        break;
    }
    return faceDirection;
  }

  /**
   * Check intersect with other
   * @param {OBB} box 
   */
  intersects(box) {
    let axis = new THREE.Vector3();
    let resultA, resultB;
    for (let i = 0; i < 3; i++) {
      resultA = this.getInterval(this.getFaceDirection(i));
      resultB = box.getInterval(this.getFaceDirection(i));
      if (resultA.max < resultB.min || resultB.max < resultA.min) return false;
    }

    for (let i = 0; i < 3; i++) {
      resultA = this.getInterval(box.getFaceDirection(i));
      resultB = box.getInterval(box.getFaceDirection(i));
      if (resultA.max < resultB.min || resultB.max < resultA.min) return false;
    }

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        axis.crossVectors(this.getEdgeDirection(i), box.getEdgeDirection(j));
        this.getInterval(axis);
        box.getInterval(axis);
        if (resultA.max < resultB.min || resultB.max < resultA.min) return false;
      }
    }

    return true;
  }
}

export default OBB;
