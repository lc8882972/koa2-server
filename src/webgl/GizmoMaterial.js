const THREE = require('three');

const GizmoMaterial = function (parameters) {

  THREE.MeshBasicMaterial.call(this);

  this.depthTest = false;
  this.depthWrite = false;
  this.side = THREE.FrontSide;
  this.transparent = true;

  this.setValues(parameters);

  this.oldColor = this.color.clone();
  this.oldOpacity = this.opacity;

  this.highlight = function (highlighted) {

    if (highlighted) {

      this.color.setRGB(1, 1, 0);
      this.opacity = 1;

    } else {

      this.color.copy(this.oldColor);
      this.opacity = this.oldOpacity;

    }

  };

};

GizmoMaterial.prototype = Object.create(THREE.MeshBasicMaterial.prototype);
GizmoMaterial.prototype.constructor = GizmoMaterial;


const GizmoLineMaterial = function (parameters) {

  THREE.LineDashedMaterial.call(this);

  this.depthTest = false;
  this.depthWrite = false;
  this.transparent = true;
  this.linewidth = 1;

  this.setValues(parameters);

  this.oldColor = this.color.clone();
  this.oldOpacity = this.opacity;

  this.highlight = function (highlighted) {

    if (highlighted) {

      this.color.setRGB(1, 1, 0);
      this.opacity = 1;

    } else {

      this.color.copy(this.oldColor);
      this.opacity = this.oldOpacity;

    }

  };

};

GizmoLineMaterial.prototype = Object.create(THREE.LineDashedMaterial.prototype);
GizmoLineMaterial.prototype.constructor = GizmoLineMaterial;

export { GizmoMaterial, GizmoLineMaterial }